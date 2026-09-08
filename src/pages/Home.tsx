import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Play, Star, TrendingUp } from "lucide-react";
import { jikan, fetchTrending, fetchFanFavorites, type Anime } from "../lib/jikan";
import { SITE } from "../lib/site";
import { AnimeRow } from "../components/anime/AnimeRow";
import { AnimeCard } from "../components/anime/AnimeCard";
import { WaifuOfTheDay } from "../components/home/WaifuOfTheDay";
import { AnimeQuotes } from "../components/home/AnimeQuotes";

const MIN_YEAR = new Date().getFullYear() - 3;

function isRecent(a: Anime) {
  const y = a.year ?? (a.aired?.from ? new Date(a.aired.from).getFullYear() : undefined);
  return typeof y === "number" ? y >= MIN_YEAR : true;
}

function recent(list?: Anime[], n = 14) {
  return list?.filter(isRecent).slice(0, n);
}

export default function Home() {
  const trending = useQuery({ queryKey: ["home", "trending"], queryFn: fetchTrending, retry: 1 });
  const topRated = useQuery({ queryKey: ["top", "all"], queryFn: () => jikan.top(1) });
  const season = useQuery({ queryKey: ["season", "now"], queryFn: () => jikan.seasonNow(1) });
  const popular = useQuery({ queryKey: ["home", "favorites"], queryFn: fetchFanFavorites, retry: 1 });
  const upcoming = useQuery({ queryKey: ["season", "upcoming"], queryFn: () => jikan.seasonUpcoming(1) });

  const trendingAll = trending.data ?? [];
  const trendingRecent = trendingAll.filter(isRecent);
  // Fall back to the unfiltered trending list if the recent-years filter
  // leaves too little to show (e.g. long-running franchises dominating the
  // "top airing" chart) so the row never renders empty.
  const trendingItems = trendingRecent.length >= 4 ? trendingRecent : trendingAll;
  const hero = trendingItems[0];

  return (
    <div className="space-y-14">
      <Hero anime={hero} loading={trending.isLoading} />
      <AnimeRow
        title="Trending Now"
        subtitle="Anime everyone is watching this week"
        items={trendingItems.slice(1, 15)}
        loading={trending.isLoading}
        error={trending.isError}
        onRetry={() => trending.refetch()}
        action={<RowLink to="/search?order_by=popularity">Explore</RowLink>}
      />
      <AnimeRow
        title="This Season"
        subtitle={seasonLabel()}
        items={recent(season.data?.data)}
        loading={season.isLoading}
      />
      <AnimeQuotes />
      <AnimeRow
        title="Top Rated Recently"
        subtitle="Highest scored shows from the last few years"
        items={recent(topRated.data?.data)}
        loading={topRated.isLoading}
      />
      <WaifuOfTheDay />
      <AnimeRow
        title="Fan Favorites"
        subtitle="Sorted by community popularity"
        items={popular.data?.slice(0, 14)}
        loading={popular.isLoading}
        error={popular.isError}
        onRetry={() => popular.refetch()}
      />
      <AnimeRow
        title="Coming Soon"
        subtitle="Upcoming shows you shouldn't miss"
        items={upcoming.data?.data?.slice(0, 14)}
        loading={upcoming.isLoading}
      />
      <GenrePicker />
    </div>
  );
}

function seasonLabel() {
  const m = new Date().getMonth();
  const s = m < 3 ? "Winter" : m < 6 ? "Spring" : m < 9 ? "Summer" : "Fall";
  return `${s} ${new Date().getFullYear()} · Currently airing`;
}

function Hero({ anime, loading }: { anime?: Anime; loading?: boolean }) {
  return (
    <section className="relative isolate overflow-hidden" style={{ backgroundImage: "var(--gradient-hero)" }}>
      {anime?.images && (
        <div className="absolute inset-0 -z-10">
          <img
            src={anime.images.webp?.large_image_url || anime.images.jpg.large_image_url}
            alt=""
            className="h-full w-full object-cover object-center opacity-30 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>
      )}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 pb-16 sm:px-6 md:grid-cols-[1fr_auto] md:pt-16 md:pb-24 lg:px-8">
        <div className="max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-border/60 shadow-glow ring-1 ring-white/5">
            <img
              src={SITE.hero}
              alt="Anime Hub — Discover, track & love anime"
              className="h-auto w-full object-cover"
              loading="eager"
            />
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90"
            >
              <Play className="h-4 w-4" /> Start exploring
            </Link>
            {anime && (
              <Link
                to={`/anime/${anime.mal_id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-2.5 text-sm font-medium hover:bg-card"
              >
                <TrendingUp className="h-4 w-4 text-primary" /> Trending: {anime.title.slice(0, 26)}
                {anime.title.length > 26 ? "…" : ""}
              </Link>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-xs text-muted-foreground">
            <Stat label="Anime titles" value="30,000+" />
            <Stat label="Characters" value="200,000+" />
            <Stat label="Crafted by" value="Anya & Murali" />
          </div>
        </div>
        {loading && (
          <div className="hidden aspect-[2/3] w-56 shrink-0 animate-pulse rounded-2xl bg-muted md:block" />
        )}
        {anime && (
          <div className="hidden md:block">
            <div className="relative">
              <AnimeCard anime={anime} size="lg" />
              {typeof anime.score === "number" && (
                <div className="absolute -left-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {anime.score.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
      <div>{label}</div>
    </div>
  );
}

function RowLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="hidden items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:inline-flex"
    >
      {children} <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

const GENRES = [
  { id: 1, name: "Action", from: "#ec4899", to: "#8b5cf6" },
  { id: 2, name: "Adventure", from: "#8b5cf6", to: "#3b82f6" },
  { id: 4, name: "Comedy", from: "#f59e0b", to: "#ef4444" },
  { id: 8, name: "Drama", from: "#0ea5e9", to: "#8b5cf6" },
  { id: 10, name: "Fantasy", from: "#a855f7", to: "#ec4899" },
  { id: 22, name: "Romance", from: "#f43f5e", to: "#a855f7" },
  { id: 24, name: "Sci-Fi", from: "#06b6d4", to: "#3b82f6" },
  { id: 27, name: "Shounen", from: "#ef4444", to: "#f59e0b" },
];

function GenrePicker() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 className="text-xl font-semibold sm:text-2xl">Browse by genre</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">Jump straight into your favorite category.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GENRES.map((g) => (
          <Link
            key={g.id}
            to={`/search?genres=${g.id}`}
            className="group relative overflow-hidden rounded-xl border border-border p-4 transition-transform hover:-translate-y-0.5"
            style={{ backgroundImage: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
          >
            <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:opacity-20" />
            <div className="relative text-lg font-semibold text-white drop-shadow">{g.name}</div>
            <div className="relative mt-1 text-xs text-white/80">Explore →</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
