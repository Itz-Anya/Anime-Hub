import { Link } from "react-router-dom";
import { useState } from "react";
import { Heart, ListVideo, PlayCircle, Sparkles, Trash2 } from "lucide-react";
import { STATUS_LABEL, store, useStore, type ListStatus } from "../lib/store";

type Tab = ListStatus | "all" | "favorites";
const TABS: Tab[] = ["all", "watching", "plan", "completed", "hold", "dropped", "favorites"];

const TAB_LABEL: Record<Tab, string> = {
  all: "All",
  favorites: "Favorites",
  ...STATUS_LABEL,
};

export default function Watchlist() {
  const list = useStore((s) => s.list);
  const favoritesMap = useStore((s) => s.favorites);
  const [tab, setTab] = useState<Tab>("all");

  const entries = Object.values(list).sort((a, b) => b.updatedAt - a.updatedAt);
  const favorites = Object.values(favoritesMap);
  const filtered = tab === "all" || tab === "favorites" ? entries : entries.filter((e) => e.status === tab);

  const counts: Record<Tab, number> = {
    all: entries.length,
    favorites: favorites.length,
    watching: entries.filter((e) => e.status === "watching").length,
    plan: entries.filter((e) => e.status === "plan").length,
    completed: entries.filter((e) => e.status === "completed").length,
    hold: entries.filter((e) => e.status === "hold").length,
    dropped: entries.filter((e) => e.status === "dropped").length,
  };

  const totalEpisodes = entries.reduce((sum, e) => sum + (e.progress || 0), 0);
  const completedCount = counts.completed;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
            <ListVideo className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">My Watchlist</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Track what you&apos;re watching and revisit your favorites.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
          <Stat label="Total" value={entries.length} />
          <Stat label="Completed" value={completedCount} />
          <Stat label="Episodes" value={totalEpisodes} />
        </div>
      </div>

      <div className="scrollbar-hide mt-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors ${
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {TAB_LABEL[t]}
            <span className="ml-1 text-xs text-muted-foreground">({counts[t]})</span>
          </button>
        ))}
      </div>

      {tab === "favorites" ? (
        favorites.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-6 w-6 text-accent" />}
            title="No favorites yet"
            body="Tap the heart on any anime to save it here."
          />
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {favorites.map((f) => (
              <Link
                key={f.id}
                to={`/anime/${f.id}`}
                className="group relative block overflow-hidden rounded-xl border border-border bg-muted"
              >
                <div className="aspect-[2/3] overflow-hidden">
                  <img
                    src={f.image}
                    alt={f.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <div className="line-clamp-2 text-xs font-semibold text-white sm:text-sm">
                    {f.title}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    store.toggleFavorite(f);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-accent backdrop-blur transition hover:bg-black/80"
                  aria-label="Remove from favorites"
                >
                  <Heart className="h-3.5 w-3.5 fill-current" />
                </button>
              </Link>
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6 text-primary" />}
          title="Your list is empty"
          body="Browse anime and tap 'Add to Watchlist' to see them here."
          cta
        />
      ) : (
        <div className="mt-6 grid gap-3">
          {filtered.map((e) => {
            const pct = e.episodes ? Math.min(100, (e.progress / e.episodes) * 100) : 0;
            return (
              <div
                key={e.id}
                className="glass flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <Link to={`/anime/${e.id}`} className="shrink-0 self-start">
                  <img
                    src={e.image}
                    alt={e.title}
                    className="h-28 w-20 rounded-lg object-cover sm:h-24 sm:w-16"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/anime/${e.id}`}
                      className="truncate font-semibold hover:text-primary"
                    >
                      {e.title}
                    </Link>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {STATUS_LABEL[e.status]}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="tabular-nums">
                      {e.progress}
                      {e.episodes ? ` / ${e.episodes}` : ""} ep
                    </span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => store.setProgress(e.id, e.progress + 1)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-white/5"
                    >
                      <PlayCircle className="h-3 w-3" /> +1 ep
                    </button>
                    <select
                      value={e.status}
                      onChange={(ev) => store.setStatus(e.id, ev.target.value as ListStatus)}
                      className="rounded-lg border border-border bg-transparent px-2 py-1 text-xs"
                    >
                      {(Object.keys(STATUS_LABEL) as ListStatus[]).map((s) => (
                        <option key={s} value={s} className="bg-popover">
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => store.remove(e.id)}
                      className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:text-destructive"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-xl px-3 py-2 text-center sm:min-w-[92px]">
      <div className="text-lg font-bold tabular-nums text-foreground sm:text-xl">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta?: boolean;
}) {
  return (
    <div className="glass mt-10 rounded-2xl p-10 text-center sm:p-12">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {cta && (
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Discover anime
        </Link>
      )}
    </div>
  );
}
