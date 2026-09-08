import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { jikan } from "../lib/jikan";
import { AnimeCard } from "../components/anime/AnimeCard";

export default function CharacterDetail() {
  const { id: idParam } = useParams();
  const id = Number(idParam);

  const character = useQuery({
    queryKey: ["char", id],
    queryFn: () => jikan.character(id),
    enabled: !Number.isNaN(id),
  });
  const anime = useQuery({
    queryKey: ["char", id, "anime"],
    queryFn: () => jikan.characterAnime(id),
    enabled: !Number.isNaN(id),
  });
  const voices = useQuery({
    queryKey: ["char", id, "voices"],
    queryFn: () => jikan.characterVoices(id),
    enabled: !Number.isNaN(id),
  });

  const c = character.data?.data;
  if (character.isLoading || !c)
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <div className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-muted" />
          <div className="space-y-3">
            <div className="h-9 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="mt-6 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <img
          src={c.images.jpg.image_url}
          alt={c.name}
          className="w-full rounded-2xl border border-border shadow-2xl"
        />
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{c.name}</h1>
          {c.name_kanji && <div className="text-muted-foreground">{c.name_kanji}</div>}
          {typeof c.favorites === "number" && c.favorites > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
              <Heart className="h-3 w-3 fill-accent text-accent" />
              {c.favorites.toLocaleString()} favorites
            </div>
          )}
          {c.nicknames && c.nicknames.length > 0 && (
            <div className="mt-3 text-sm text-muted-foreground">
              Also known as: {c.nicknames.join(", ")}
            </div>
          )}
          {c.about && (
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{c.about}</p>
          )}
        </div>
      </div>

      {anime.data?.data && anime.data.data.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-xl font-semibold sm:text-2xl">Anime Appearances</h2>
          <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-4">
            {anime.data.data.map((a) => (
              <div key={a.anime.mal_id} className="shrink-0">
                <AnimeCard anime={a.anime} />
                <div className="mt-1 text-center text-xs text-muted-foreground">{a.role}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {voices.data?.data && voices.data.data.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-xl font-semibold sm:text-2xl">Voice Actors</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {voices.data.data.map((v, i) => (
              <div key={`${v.person.mal_id}-${i}`} className="glass flex items-center gap-3 rounded-xl p-3">
                <img
                  src={v.person.images?.jpg?.image_url}
                  alt=""
                  className="h-14 w-11 rounded object-cover"
                />
                <div>
                  <div className="text-sm font-medium">{v.person.name}</div>
                  <div className="text-xs text-muted-foreground">{v.language}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
