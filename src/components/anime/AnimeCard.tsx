import { Link } from "react-router-dom";
import { Star, Tv } from "lucide-react";
import type { Anime } from "../../lib/jikan";
import { cn } from "../../lib/utils";

type Props = {
  anime: Pick<
    Anime,
    "mal_id" | "title" | "images" | "score" | "episodes" | "status" | "genres" | "type" | "year"
  >;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function AnimeCard({ anime, className, size = "md" }: Props) {
  const img =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url;
  const w = size === "sm" ? "w-32 sm:w-36" : size === "lg" ? "w-48 sm:w-56" : "w-40 sm:w-44";
  return (
    <Link to={`/anime/${anime.mal_id}`} className={cn("group relative block shrink-0", w, className)}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-muted shadow-lg transition-all duration-300 group-hover:shadow-glow group-hover:-translate-y-1">
        {img ? (
          <img
            src={img}
            alt={anime.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Tv className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />
        {typeof anime.score === "number" && anime.score > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {anime.score.toFixed(1)}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="line-clamp-2 text-sm font-semibold text-white drop-shadow">{anime.title}</div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-white/70">
            {anime.type && <span>{anime.type}</span>}
            {anime.episodes ? <span>· {anime.episodes} ep</span> : null}
            {anime.year ? <span>· {anime.year}</span> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function AnimeCardSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const w = size === "sm" ? "w-32 sm:w-36" : size === "lg" ? "w-48 sm:w-56" : "w-40 sm:w-44";
  return (
    <div className={cn("shrink-0", w)}>
      <div className="aspect-[2/3] animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
