import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeCard, AnimeCardSkeleton } from "./AnimeCard";
import type { Anime } from "../../lib/jikan";

type Props = {
  title: string;
  subtitle?: string;
  items?: Anime[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  action?: ReactNode;
};

// Jikan feeds can repeat the same mal_id (e.g. recommendation/relation
// overlaps), which triggers React duplicate-key warnings and dropped cards.
function dedupe(items?: Anime[]): Anime[] {
  const seen = new Set<number>();
  return (items ?? []).filter((a) => (seen.has(a.mal_id) ? false : (seen.add(a.mal_id), true)));
}

export function AnimeRow({ title, subtitle, items, loading, error, onRetry, action }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.85), behavior: "smooth" });
  };
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {action}
          <div className="hidden gap-1 sm:flex">
            <button
              onClick={() => scroll(-1)}
              className="rounded-full border border-border bg-card/60 p-2 hover:bg-card"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="rounded-full border border-border bg-card/60 p-2 hover:bg-card"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={ref}
        className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth px-4 pb-4 sm:px-6 lg:px-8"
      >
        {loading && Array.from({ length: 8 }).map((_, i) => <AnimeCardSkeleton key={i} />)}
        {!loading && error && (
          <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-6 text-sm text-muted-foreground">
            <span>Couldn't load this row right now.</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-card"
              >
                Try again
              </button>
            )}
          </div>
        )}
        {!loading && !error && items && items.length === 0 && (
          <div className="w-full rounded-xl border border-border bg-card/60 px-4 py-6 text-sm text-muted-foreground">
            Nothing to show here yet.
          </div>
        )}
        {dedupe(items).map((a) => <AnimeCard key={a.mal_id} anime={a} />)}
      </div>
    </section>
  );
}
