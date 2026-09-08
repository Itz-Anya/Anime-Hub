import axios from "axios";

const BASE = "https://api.jikan.moe/v4";

const http = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

export type JikanImage = {
  jpg: { image_url: string; large_image_url?: string; small_image_url?: string };
  webp?: { image_url: string; large_image_url?: string };
};

export type Anime = {
  mal_id: number;
  url: string;
  images: JikanImage;
  trailer?: { youtube_id?: string | null; url?: string | null; embed_url?: string | null };
  title: string;
  title_english?: string | null;
  title_japanese?: string | null;
  type?: string | null;
  source?: string | null;
  episodes?: number | null;
  status?: string | null;
  airing?: boolean;
  aired?: { from?: string | null; to?: string | null; string?: string | null };
  duration?: string | null;
  rating?: string | null;
  score?: number | null;
  scored_by?: number | null;
  rank?: number | null;
  popularity?: number | null;
  members?: number | null;
  favorites?: number | null;
  synopsis?: string | null;
  season?: string | null;
  year?: number | null;
  studios?: { mal_id: number; name: string }[];
  producers?: { mal_id: number; name: string }[];
  genres?: { mal_id: number; name: string }[];
  themes?: { mal_id: number; name: string }[];
  demographics?: { mal_id: number; name: string }[];
};

export type Character = {
  mal_id: number;
  url: string;
  images: { jpg: { image_url: string }; webp?: { image_url: string } };
  name: string;
  name_kanji?: string | null;
  nicknames?: string[];
  favorites?: number;
  about?: string | null;
};

type Paged<T> = {
  data: T;
  pagination?: { has_next_page: boolean; current_page: number; last_visible_page: number };
};

const cache = new Map<string, { t: number; data: unknown }>();
const TTL = 5 * 60 * 1000;

// Jikan is a free, heavily rate-limited API (~3 req/sec burst, docs ask for
// ~4s spacing between requests). Home.tsx fires 5 queries at once on mount,
// which used to blow straight through that limit — some of the parallel
// requests would come back 429/5xx, the retry logic only covered a single
// 429 retry, and since nothing in the UI surfaces query errors, the affected
// row (often "Trending Now" / "Fan Favorites") would just render empty with
// no visible error. Fix: serialize all outgoing requests through a small
// queue with spacing, and retry more robustly with backoff.
const MIN_GAP_MS = 1200; // measured safe spacing; 400ms still drew 429s
let queue: Promise<unknown> = Promise.resolve();
let lastDispatch = 0;

function schedule<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = Math.max(0, lastDispatch + MIN_GAP_MS - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastDispatch = Date.now();
    return task();
  });
  // Keep the queue alive even if this task fails, so later tasks still run.
  queue = run.catch(() => undefined);
  return run;
}

async function requestWithRetry<T>(path: string, attempt = 0): Promise<T> {
  try {
    const res = await http.get<T>(path);
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    const retryable = status === 429 || (status >= 500 && status < 600) || !status;
    if (retryable && attempt < 2) {
      const backoff = 600 * Math.pow(2, attempt) + Math.random() * 200;
      await new Promise((r) => setTimeout(r, backoff));
      return requestWithRetry<T>(path, attempt + 1);
    }
    throw new Error(`Jikan ${status ?? "error"}: ${path}`);
  }
}

async function j<T>(path: string): Promise<T> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.t < TTL) return hit.data as T;
  const data = await schedule(() => requestWithRetry<T>(path));
  cache.set(path, { t: Date.now(), data });
  return data as T;
}

export const jikan = {
  top: (page = 1, filter?: "airing" | "upcoming" | "bypopularity" | "favorite") =>
    j<Paged<Anime[]>>(`/top/anime?page=${page}${filter ? `&filter=${filter}` : ""}`),
  seasonNow: (page = 1) => j<Paged<Anime[]>>(`/seasons/now?page=${page}`),
  seasonUpcoming: (page = 1) => j<Paged<Anime[]>>(`/seasons/upcoming?page=${page}`),
  recent: (page = 1) =>
    j<Paged<Anime[]>>(`/anime?order_by=start_date&sort=desc&status=airing&page=${page}`),
  search: (params: {
    q?: string;
    page?: number;
    limit?: number;
    genres?: string;
    type?: string;
    status?: string;
    rating?: string;
    min_score?: number;
    order_by?: string;
    sort?: "asc" | "desc";
    start_date?: string;
    end_date?: string;
    sfw?: boolean;
  }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) qs.set(k, String(v));
    });
    if (!qs.has("sfw")) qs.set("sfw", "true");
    return j<Paged<Anime[]>>(`/anime?${qs.toString()}`);
  },
  anime: (id: number) => j<Paged<Anime>>(`/anime/${id}/full`),
  characters: (id: number) =>
    j<
      Paged<
        {
          character: Character;
          role: string;
          voice_actors: {
            person: { mal_id: number; name: string; images: JikanImage };
            language: string;
          }[];
        }[]
      >
    >(`/anime/${id}/characters`),
  recommendations: (id: number) => j<Paged<{ entry: Anime }[]>>(`/anime/${id}/recommendations`),
  relations: (id: number) =>
    j<Paged<{ relation: string; entry: { mal_id: number; type: string; name: string; url: string }[] }[]>>(
      `/anime/${id}/relations`,
    ),
  genres: () => j<Paged<{ mal_id: number; name: string; count: number }[]>>(`/genres/anime`),
  character: (id: number) => j<Paged<Character & { about: string | null }>>(`/characters/${id}/full`),
  characterAnime: (id: number) => j<Paged<{ role: string; anime: Anime }[]>>(`/characters/${id}/anime`),
  characterVoices: (id: number) =>
    j<Paged<{ language: string; person: { mal_id: number; name: string; images: JikanImage } }[]>>(
      `/characters/${id}/voices`,
    ),
  topCharacters: (page = 1) => j<Paged<Character[]>>(`/top/characters?page=${page}`),
};

// --- Resilient home-page feeds -------------------------------------------
// `/top/anime?filter=airing` regularly answers 504 ("Jikan failed to connect
// to MyAnimeList"), which left the "Trending Now" row (and the hero, which is
// built from the same list) permanently blank. Likewise "Fan Favorites" was
// pulling `filter=bypopularity` (member count) instead of actual favorites.
// Both feeds now try their preferred endpoint and transparently fall back to
// a working one so the row always has content.

async function firstOk(sources: (() => Promise<Paged<Anime[]>>)[]): Promise<Anime[]> {
  let lastErr: unknown;
  for (const src of sources) {
    try {
      const res = await src();
      const list = res?.data ?? [];
      if (list.length) return list;
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) throw lastErr;
  return [];
}

/** Currently-airing shows people are watching right now. */
export function fetchTrending(): Promise<Anime[]> {
  // `/top/anime?filter=airing` is the semantically ideal source but answers
  // 504 most of the time, so the current season leads the chain instead.
  return firstOk([
    () => jikan.seasonNow(1),
    () => jikan.top(1, "airing"),
    () => jikan.search({ status: "airing", order_by: "popularity", sort: "asc", limit: 25 }),
  ]);
}

/** Titles with the most community favorites. */
export function fetchFanFavorites(): Promise<Anime[]> {
  // The filtered `/top/anime` variants 504 far more often than the plain
  // ranked list, so the unfiltered list re-sorted by favorite count is used
  // as the dependable second source.
  return firstOk([
    () => jikan.top(1, "favorite"),
    async () => {
      const res = await jikan.top(1);
      const data = [...(res.data ?? [])].sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0));
      return { ...res, data };
    },
    () => jikan.top(1, "bypopularity"),
  ]);
}
