import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { jikan } from "../lib/jikan";
import { AnimeCard, AnimeCardSkeleton } from "../components/anime/AnimeCard";

const TYPES = ["tv", "movie", "ova", "special", "ona", "music"];
const STATUSES = [
  { v: "airing", l: "Airing" },
  { v: "complete", l: "Finished" },
  { v: "upcoming", l: "Upcoming" },
];
const RATINGS = [
  { v: "g", l: "G" },
  { v: "pg", l: "PG" },
  { v: "pg13", l: "PG-13" },
  { v: "r17", l: "R-17+" },
];
const ORDERS = [
  { v: "popularity", l: "Popularity" },
  { v: "score", l: "Score" },
  { v: "start_date", l: "Start date" },
  { v: "title", l: "Title" },
];

type SearchState = {
  q?: string;
  genres?: string;
  type?: string;
  status?: string;
  rating?: string;
  min_score?: number;
  order_by?: string;
  sort?: "asc" | "desc";
  year?: number;
  page?: number;
};

function parseParams(sp: URLSearchParams): SearchState {
  const get = (k: string) => sp.get(k) || undefined;
  return {
    q: get("q"),
    genres: get("genres"),
    type: get("type"),
    status: get("status"),
    rating: get("rating"),
    min_score: sp.get("min_score") ? Number(sp.get("min_score")) : undefined,
    order_by: get("order_by"),
    sort: (get("sort") as "asc" | "desc" | undefined) ?? undefined,
    year: sp.get("year") ? Number(sp.get("year")) : undefined,
    page: sp.get("page") ? Number(sp.get("page")) : 1,
  };
}

export default function SearchPage() {
  const [sp, setSp] = useSearchParams();
  const search = parseParams(sp);
  const [input, setInput] = useState(search.q ?? "");

  useEffect(() => setInput(search.q ?? ""), [search.q]);

  const patch = useCallback(
    (obj: Partial<SearchState>, resetPage = true) => {
      const next = new URLSearchParams(sp);
      Object.entries(obj).forEach(([k, v]) => {
        if (v === undefined || v === "" || v === null) next.delete(k);
        else next.set(k, String(v));
      });
      if (resetPage) next.set("page", "1");
      setSp(next, { replace: false });
    },
    [sp, setSp],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if ((search.q ?? "") !== input) patch({ q: input || undefined });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const genresQ = useQuery({ queryKey: ["genres"], queryFn: () => jikan.genres() });

  const results = useQuery({
    queryKey: ["search", search],
    queryFn: () =>
      jikan.search({
        q: search.q,
        genres: search.genres,
        type: search.type,
        status: search.status,
        rating: search.rating,
        min_score: search.min_score,
        order_by: search.order_by,
        sort: search.sort ?? (search.order_by ? "desc" : undefined),
        start_date: search.year ? `${search.year}-01-01` : undefined,
        end_date: search.year ? `${search.year}-12-31` : undefined,
        page: search.page ?? 1,
        limit: 24,
      }),
    placeholderData: (prev) => prev,
  });

  const suggestions = useQuery({
    enabled: !!input && input.length >= 2 && input !== search.q,
    queryKey: ["suggest", input],
    queryFn: () => jikan.search({ q: input, limit: 6, order_by: "popularity", sort: "asc" }),
  });

  const activeGenres = (search.genres ?? "").split(",").filter(Boolean).map(Number);

  const clearAll = () => {
    const next = new URLSearchParams();
    if (search.q) next.set("q", search.q);
    next.set("page", "1");
    setSp(next);
  };

  const gotoPage = (p: number) => {
    const next = new URLSearchParams(sp);
    next.set("page", String(p));
    setSp(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search anime by title..."
          className="glass w-full rounded-2xl py-4 pl-12 pr-12 text-base text-foreground outline-none transition focus:border-primary focus:shadow-glow"
        />
        {input && (
          <button
            onClick={() => setInput("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {suggestions.data?.data && suggestions.data.data.length > 0 && input !== search.q && (
          <div className="glass absolute z-30 mt-2 w-full overflow-hidden rounded-xl">
            {suggestions.data.data.slice(0, 6).map((a) => (
              <Link
                key={a.mal_id}
                to={`/anime/${a.mal_id}`}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5"
              >
                <img
                  src={a.images.jpg.small_image_url || a.images.jpg.image_url}
                  alt=""
                  className="h-12 w-9 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.type} · {a.year ?? "—"} {a.score ? `· ★ ${a.score}` : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
        </div>
        <Select label="Type" value={search.type} onChange={(v) => patch({ type: v })} options={TYPES.map((t) => ({ v: t, l: t.toUpperCase() }))} />
        <Select label="Status" value={search.status} onChange={(v) => patch({ status: v })} options={STATUSES} />
        <Select label="Rating" value={search.rating} onChange={(v) => patch({ rating: v })} options={RATINGS} />
        <Select label="Sort" value={search.order_by} onChange={(v) => patch({ order_by: v })} options={ORDERS} />
        <YearSelect value={search.year} onChange={(y) => patch({ year: y })} />
        <ScoreSelect value={search.min_score} onChange={(s) => patch({ min_score: s })} />
        {(search.genres || search.type || search.status || search.rating || search.min_score || search.year || search.order_by) && (
          <button
            onClick={clearAll}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      {genresQ.data?.data && (
        <div className="scrollbar-hide -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
          {genresQ.data.data.slice(0, 24).map((g) => {
            const active = activeGenres.includes(g.mal_id);
            return (
              <button
                key={g.mal_id}
                onClick={() => {
                  const next = active
                    ? activeGenres.filter((x) => x !== g.mal_id)
                    : [...activeGenres, g.mal_id];
                  patch({ genres: next.length ? next.join(",") : undefined });
                }}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs transition ${
                  active
                    ? "border-transparent bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        {results.isLoading && !results.data ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        ) : results.data?.data?.length ? (
          <>
            <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {results.data.pagination?.last_visible_page
                  ? `Page ${search.page} of ${results.data.pagination.last_visible_page}`
                  : ""}
              </span>
              {results.isFetching && <span className="h-2 w-16 animate-pulse rounded bg-muted" />}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {results.data.data.map((a) => (
                <AnimeCard key={a.mal_id} anime={a} className="w-full" />
              ))}
            </div>
            <Pagination
              page={search.page ?? 1}
              hasNext={!!results.data.pagination?.has_next_page}
              onGo={gotoPage}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <label className="glass inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="bg-transparent text-foreground outline-none"
      >
        <option value="" className="bg-popover">
          Any
        </option>
        {options.map((o) => (
          <option key={o.v} value={o.v} className="bg-popover">
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}

function YearSelect({ value, onChange }: { value?: number; onChange: (v: number | undefined) => void }) {
  const now = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => now - i);
  return (
    <label className="glass inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs">
      <span className="text-muted-foreground">Year</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        className="bg-transparent outline-none"
      >
        <option value="" className="bg-popover">
          Any
        </option>
        {years.map((y) => (
          <option key={y} value={y} className="bg-popover">
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}

function ScoreSelect({ value, onChange }: { value?: number; onChange: (v: number | undefined) => void }) {
  return (
    <label className="glass inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs">
      <span className="text-muted-foreground">Min ★</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        className="bg-transparent outline-none"
      >
        <option value="" className="bg-popover">
          Any
        </option>
        {[6, 7, 7.5, 8, 8.5, 9].map((s) => (
          <option key={s} value={s} className="bg-popover">
            {s}+
          </option>
        ))}
      </select>
    </label>
  );
}

function Pagination({ page, hasNext, onGo }: { page: number; hasNext: boolean; onGo: (p: number) => void }) {
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => onGo(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-sm text-muted-foreground">Page {page}</span>
      <button
        onClick={() => onGo(page + 1)}
        disabled={!hasNext}
        className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass mt-6 rounded-2xl p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
        <SearchIcon className="h-5 w-5 text-primary-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No anime found</h3>
      <p className="mt-1 text-sm text-muted-foreground">Try broadening your filters or a different keyword.</p>
    </div>
  );
}
