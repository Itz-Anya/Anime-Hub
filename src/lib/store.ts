import { useSyncExternalStore } from "react";

export type ListStatus = "watching" | "completed" | "plan" | "dropped" | "hold";

export type WatchEntry = {
  id: number;
  title: string;
  image: string;
  score?: number | null;
  episodes?: number | null;
  status: ListStatus;
  progress: number;
  addedAt: number;
  updatedAt: number;
};

export type FavoriteEntry = { id: number; title: string; image: string };
export type RecentEntry = FavoriteEntry & { viewedAt: number };

type State = {
  list: Record<number, WatchEntry>;
  favorites: Record<number, FavoriteEntry>;
  recent: RecentEntry[];
};

const KEY = "animehub:v1";
const listeners = new Set<() => void>();
let state: State = load();

function load(): State {
  if (typeof window === "undefined") return { list: {}, favorites: {}, recent: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { list: {}, favorites: {}, recent: [] };
    const parsed = JSON.parse(raw);
    return {
      list: parsed.list ?? {},
      favorites: parsed.favorites ?? {},
      recent: parsed.recent ?? [],
    };
  } catch {
    return { list: {}, favorites: {}, recent: [] };
  }
}

function save() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useStoreState(): State {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => ({ list: {}, favorites: {}, recent: [] }) as State,
  );
}

export function useStore<T>(sel: (s: State) => T): T {
  return sel(useStoreState());
}

export const store = {
  get: () => state,
  addOrUpdate: (id: number, patch: Partial<WatchEntry> & Pick<WatchEntry, "title" | "image">) => {
    const existing = state.list[id];
    const now = Date.now();
    const entry: WatchEntry = {
      id,
      title: patch.title,
      image: patch.image,
      score: patch.score ?? existing?.score ?? null,
      episodes: patch.episodes ?? existing?.episodes ?? null,
      status: patch.status ?? existing?.status ?? "plan",
      progress: patch.progress ?? existing?.progress ?? 0,
      addedAt: existing?.addedAt ?? now,
      updatedAt: now,
    };
    state = { ...state, list: { ...state.list, [id]: entry } };
    save();
  },
  remove: (id: number) => {
    const { [id]: _removed, ...rest } = state.list;
    void _removed;
    state = { ...state, list: rest };
    save();
  },
  setStatus: (id: number, status: ListStatus) => {
    const e = state.list[id];
    if (!e) return;
    store.addOrUpdate(id, { title: e.title, image: e.image, status });
  },
  setProgress: (id: number, progress: number) => {
    const e = state.list[id];
    if (!e) return;
    const p = Math.max(0, e.episodes ? Math.min(progress, e.episodes) : progress);
    const status: ListStatus =
      e.episodes && p >= e.episodes ? "completed" : e.status === "plan" && p > 0 ? "watching" : e.status;
    store.addOrUpdate(id, { title: e.title, image: e.image, progress: p, status });
  },
  toggleFavorite: (fav: FavoriteEntry) => {
    const has = !!state.favorites[fav.id];
    const favorites = { ...state.favorites };
    if (has) delete favorites[fav.id];
    else favorites[fav.id] = fav;
    state = { ...state, favorites };
    save();
  },
  pushRecent: (r: FavoriteEntry) => {
    const filtered = state.recent.filter((x) => x.id !== r.id);
    const next = [{ ...r, viewedAt: Date.now() }, ...filtered].slice(0, 24);
    state = { ...state, recent: next };
    save();
  },
};

export const STATUS_LABEL: Record<ListStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  plan: "Plan to Watch",
  dropped: "Dropped",
  hold: "On Hold",
};
