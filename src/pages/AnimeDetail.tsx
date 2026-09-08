import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Heart, Minus, Plus, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { jikan } from "../lib/jikan";
import { fetchAnilistTrailer } from "../lib/anilist";
import { AnimeCard } from "../components/anime/AnimeCard";
import { STATUS_LABEL, store, useStore, type ListStatus } from "../lib/store";

export default function AnimeDetail() {
  const { id: idParam } = useParams();
  const id = Number(idParam);

  const anime = useQuery({
    queryKey: ["anime", id],
    queryFn: async () => {
      const r = await jikan.anime(id);
      if (!r.data) throw new Error("Not found");
      return r.data;
    },
    enabled: !Number.isNaN(id),
  });
  const characters = useQuery({
    queryKey: ["anime", id, "chars"],
    queryFn: () => jikan.characters(id),
    enabled: !Number.isNaN(id),
  });
  const recs = useQuery({
    queryKey: ["anime", id, "recs"],
    queryFn: () => jikan.recommendations(id),
    enabled: !Number.isNaN(id),
  });
  const relations = useQuery({
    queryKey: ["anime", id, "rel"],
    queryFn: () => jikan.relations(id),
    enabled: !Number.isNaN(id),
  });
  const anilistTrailer = useQuery({
    queryKey: ["anime", id, "anilist-trailer"],
    queryFn: () => fetchAnilistTrailer(id),
    enabled: !Number.isNaN(id),
    staleTime: 30 * 60 * 1000,
  });

  const a = anime.data;

  useEffect(() => {
    if (a) store.pushRecent({ id: a.mal_id, title: a.title, image: a.images.jpg.image_url });
  }, [a]);

  useEffect(() => {
    if (a) document.title = `${a.title} — Anime Hub`;
  }, [a]);

  if (anime.isError)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">
        Couldn&apos;t load this anime.
      </div>
    );
  if (anime.isLoading || !a) return <DetailSkeleton />;

  return (
    <div>
      <div className="relative h-[160px] w-full overflow-hidden sm:h-[220px]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-accent/15 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto -mt-24 max-w-7xl px-4 sm:-mt-32 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <div className="relative z-10">
            <img
              src={a.images.webp?.large_image_url || a.images.jpg.large_image_url}
              alt={a.title}
              className="w-full rounded-2xl border border-border shadow-2xl"
            />
            <ActionPanel
              id={a.mal_id}
              title={a.title}
              image={a.images.jpg.image_url}
              episodes={a.episodes ?? null}
              score={a.score ?? null}
            />
          </div>
          <div className="pt-4 md:pt-32">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {a.type && <span className="rounded-full bg-white/10 px-2 py-0.5">{a.type}</span>}
              {a.status && <span className="rounded-full bg-white/10 px-2 py-0.5">{a.status}</span>}
              {a.year && (
                <span>
                  {a.season ? `${a.season} ` : ""}
                  {a.year}
                </span>
              )}
              {a.episodes && <span>· {a.episodes} episodes</span>}
              {a.rating && <span>· {a.rating}</span>}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{a.title}</h1>
            {a.title_english && a.title_english !== a.title && (
              <div className="text-sm text-muted-foreground">{a.title_english}</div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <ScoreBadge score={a.score ?? null} scoredBy={a.scored_by ?? null} />
              {a.rank && <StatPill label="Ranked" value={`#${a.rank}`} />}
              {a.popularity && <StatPill label="Popularity" value={`#${a.popularity}`} />}
              {a.members && <StatPill label="Members" value={a.members.toLocaleString()} />}
              {a.favorites && <StatPill label="Favorites" value={a.favorites.toLocaleString()} />}
            </div>

            {a.genres && a.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {a.genres.concat(a.themes ?? []).map((g) => (
                  <Link
                    key={g.mal_id}
                    to={`/search?genres=${g.mal_id}`}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {a.synopsis && (
              <ExpandableText text={a.synopsis} className="mt-6 text-sm leading-relaxed text-foreground/90" />
            )}

            {(a.studios?.length || a.producers?.length) && (
              <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                {a.studios?.length ? (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Studios</div>
                    <div className="mt-1">{a.studios.map((s) => s.name).join(", ")}</div>
                  </div>
                ) : null}
                {a.producers?.length ? (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Producers</div>
                    <div className="mt-1 line-clamp-2">{a.producers.map((s) => s.name).join(", ")}</div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {(() => {
          const ytId = a.trailer?.youtube_id || anilistTrailer.data || null;
          if (!ytId) return null;
          return (
            <section className="mt-12">
              <SectionTitle title="Trailer" />
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title="Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          );
        })()}

        {characters.data?.data && characters.data.data.length > 0 && (
          <section className="mt-12">
            <SectionTitle title="Characters & Voice Actors" icon={<Users className="h-4 w-4" />} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {characters.data.data.slice(0, 12).map((c) => {
                const va = c.voice_actors.find((v) => v.language === "Japanese") ?? c.voice_actors[0];
                return (
                  <Link
                    key={c.character.mal_id}
                    to={`/character/${c.character.mal_id}`}
                    className="glass flex items-center gap-3 rounded-xl p-2 hover:bg-white/5"
                  >
                    <img
                      src={c.character.images.jpg.image_url}
                      alt=""
                      className="h-16 w-12 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{c.character.name}</div>
                      <div className="text-xs text-muted-foreground">{c.role}</div>
                    </div>
                    {va && (
                      <div className="flex items-center gap-2 text-right">
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium">{va.person.name}</div>
                          <div className="text-[10px] text-muted-foreground">{va.language}</div>
                        </div>
                        <img
                          src={va.person.images?.jpg?.image_url}
                          alt=""
                          className="h-12 w-9 rounded object-cover"
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {recs.data?.data && recs.data.data.length > 0 && (
          <section className="mt-12">
            <SectionTitle title="Recommendations" />
            <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-4">
              {recs.data.data.slice(0, 15).map((r) => (
                <AnimeCard key={r.entry.mal_id} anime={r.entry} />
              ))}
            </div>
          </section>
        )}

        {relations.data?.data && relations.data.data.length > 0 && (
          <section className="mt-12">
            <SectionTitle title="Related" />
            <div className="grid gap-3 sm:grid-cols-2">
              {relations.data.data.map((rel) => (
                <div key={rel.relation} className="glass rounded-xl p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{rel.relation}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    {rel.entry.map((e) =>
                      e.type === "anime" ? (
                        <Link key={e.mal_id} to={`/anime/${e.mal_id}`} className="hover:text-primary">
                          {e.name}
                        </Link>
                      ) : (
                        <span key={`${e.type}-${e.mal_id}`} className="text-muted-foreground">
                          {e.name} <span className="text-xs">({e.type})</span>
                        </span>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold sm:text-2xl">
      {icon}
      {title}
    </h2>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/40 px-3 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function ScoreBadge({ score, scoredBy }: { score: number | null; scoredBy: number | null }) {
  if (!score) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-1.5">
      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      <div>
        <div className="text-sm font-semibold">{score.toFixed(2)}</div>
        {scoredBy && <div className="text-[10px] text-muted-foreground">{scoredBy.toLocaleString()} votes</div>}
      </div>
    </div>
  );
}

function ExpandableText({ text, className }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const short = text.length > 380 && !open;
  return (
    <div className={className}>
      <p className="whitespace-pre-line">{short ? text.slice(0, 380).trimEnd() + "…" : text}</p>
      {text.length > 380 && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-2 inline-flex items-center gap-1 text-xs text-primary"
        >
          {open ? "Show less" : "Read more"}{" "}
          <ChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}

function ActionPanel({
  id,
  title,
  image,
  episodes,
  score,
}: {
  id: number;
  title: string;
  image: string;
  episodes: number | null;
  score: number | null;
}) {
  const entry = useStore((s) => s.list[id]);
  const isFav = useStore((s) => !!s.favorites[id]);
  const statuses: ListStatus[] = ["watching", "completed", "plan", "dropped", "hold"];
  const progress = entry?.progress ?? 0;
  const pct = useMemo(
    () => (episodes ? Math.min(100, (progress / episodes) * 100) : 0),
    [progress, episodes],
  );

  return (
    <div className="mt-4 space-y-3">
      {!entry ? (
        <button
          onClick={() => {
            store.addOrUpdate(id, { title, image, episodes, score, status: "plan" });
            toast.success("Added to Plan to Watch");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          <Plus className="h-4 w-4" /> Add to Watchlist
        </button>
      ) : (
        <div className="glass rounded-xl p-3 space-y-3">
          <div className="grid grid-cols-2 gap-1">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => {
                  store.setStatus(id, s);
                  toast.success(`Marked as ${STATUS_LABEL[s]}`);
                }}
                className={`rounded-lg px-2 py-1 text-xs ${
                  entry.status === s
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {progress}
                {episodes ? ` / ${episodes}` : ""} ep
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => store.setProgress(id, Math.max(0, progress - 1))}
                className="flex-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-white/5"
              >
                <Minus className="mx-auto h-3 w-3" />
              </button>
              <button
                onClick={() => store.setProgress(id, progress + 1)}
                className="flex-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-white/5"
              >
                <Plus className="mx-auto h-3 w-3" />
              </button>
              {episodes && (
                <button
                  onClick={() => store.setProgress(id, episodes)}
                  className="flex-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-white/5"
                  title="Mark completed"
                >
                  <Check className="mx-auto h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              store.remove(id);
              toast.success("Removed from watchlist");
            }}
            className="w-full text-xs text-muted-foreground hover:text-destructive"
          >
            Remove
          </button>
        </div>
      )}
      <button
        onClick={() => {
          store.toggleFavorite({ id, title, image });
          toast.success(isFav ? "Removed from favorites" : "Added to favorites");
        }}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
          isFav
            ? "border-accent bg-accent/20 text-foreground"
            : "border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        <Heart className={`h-4 w-4 ${isFav ? "fill-accent text-accent" : ""}`} />
        {isFav ? "Favorited" : "Add to favorites"}
      </button>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div>
      <div className="h-[160px] w-full bg-gradient-to-br from-primary/25 via-accent/15 to-transparent sm:h-[220px]" />
      <div className="relative z-10 mx-auto -mt-24 max-w-7xl px-4 sm:-mt-32 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <div>
            <div className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-muted" />
            <div className="mt-4 h-11 animate-pulse rounded-xl bg-muted" />
            <div className="mt-3 h-10 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="space-y-3 pt-4 md:pt-32">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-9 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="mt-4 flex gap-2">
              <div className="h-12 w-24 animate-pulse rounded-xl bg-muted" />
              <div className="h-12 w-24 animate-pulse rounded-xl bg-muted" />
              <div className="h-12 w-24 animate-pulse rounded-xl bg-muted" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
