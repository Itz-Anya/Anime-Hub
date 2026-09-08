const ENDPOINT = "https://graphql.anilist.co";

const cache = new Map<number, { t: number; id: string | null }>();
const TTL = 30 * 60 * 1000;

export async function fetchAnilistTrailer(malId: number): Promise<string | null> {
  const hit = cache.get(malId);
  if (hit && Date.now() - hit.t < TTL) return hit.id;
  const query = `query ($idMal: Int) {
    Media(idMal: $idMal, type: ANIME) {
      trailer { id site }
    }
  }`;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables: { idMal: malId } }),
    });
    if (!res.ok) throw new Error(`AniList ${res.status}`);
    const json = await res.json();
    const t = json?.data?.Media?.trailer;
    const id = t && t.site === "youtube" && t.id ? String(t.id) : null;
    cache.set(malId, { t: Date.now(), id });
    return id;
  } catch {
    cache.set(malId, { t: Date.now(), id: null });
    return null;
  }
}
