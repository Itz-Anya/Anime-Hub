import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, Sparkles } from "lucide-react";
import { jikan } from "../../lib/jikan";

function daySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function WaifuOfTheDay() {
  const { data, isLoading } = useQuery({
    queryKey: ["top-characters", 1],
    queryFn: () => jikan.topCharacters(1),
    staleTime: 60 * 60 * 1000,
  });

  const list = data?.data ?? [];
  const pick = list.length ? list[daySeed() % list.length] : undefined;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Character of the Day
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            A fresh face every 24 hours — meet today&apos;s pick.
          </p>
        </div>
      </div>

      {isLoading || !pick ? (
        <div className="glass grid gap-4 rounded-2xl p-4 sm:grid-cols-[160px_1fr] sm:p-6">
          <div className="aspect-[3/4] w-full max-w-[160px] animate-pulse rounded-xl bg-muted" />
          <div className="space-y-3">
            <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ) : (
        <Link
          to={`/character/${pick.mal_id}`}
          className="glass group grid gap-4 overflow-hidden rounded-2xl p-4 transition hover:bg-white/[0.04] sm:grid-cols-[160px_1fr] sm:p-6"
        >
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={pick.images.webp?.image_url || pick.images.jpg.image_url}
              alt={pick.name}
              className="aspect-[3/4] w-full max-w-[160px] object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-primary">Today&apos;s pick</div>
            <div className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{pick.name}</div>
            {pick.name_kanji && (
              <div className="text-sm text-muted-foreground">{pick.name_kanji}</div>
            )}
            {typeof pick.favorites === "number" && pick.favorites > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs">
                <Heart className="h-3 w-3 fill-accent text-accent" />
                {pick.favorites.toLocaleString()} favorites
              </div>
            )}
            {pick.about && (
              <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-foreground/80">
                {pick.about}
              </p>
            )}
            <div className="mt-4 inline-flex text-xs text-primary group-hover:underline">
              View profile →
            </div>
          </div>
        </Link>
      )}
    </section>
  );
}
