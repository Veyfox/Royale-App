const BASE_URL = "https://api.clashroyale.com/v1";

function getApiKey(): string {
  const key = process.env.CLASH_ROYALE_API_KEY;
  if (!key) throw new Error("CLASH_ROYALE_API_KEY is not set");
  return key;
}

function encodeTag(tag: string): string {
  return encodeURIComponent(tag.startsWith("#") ? tag : `#${tag}`);
}

async function crFetch<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw Object.assign(new Error(`Clash Royale API error ${res.status}`), {
      status: res.status,
      body,
    });
  }

  return res.json() as Promise<T>;
}

export async function getClan(tag: string) {
  return crFetch(`/clans/${encodeTag(tag)}`);
}

export async function getClanMembers(tag: string, limit = 50) {
  return crFetch(`/clans/${encodeTag(tag)}/members?limit=${limit}`);
}

export async function getClanWarLog(tag: string, limit = 10) {
  return crFetch(`/clans/${encodeTag(tag)}/riverracelog?limit=${limit}`);
}

export async function getClanCurrentWar(tag: string) {
  return crFetch(`/clans/${encodeTag(tag)}/currentriverrace`);
}

export async function getPlayer(tag: string) {
  return crFetch(`/players/${encodeTag(tag)}`);
}

export async function getPlayerBattleLog(tag: string) {
  return crFetch(`/players/${encodeTag(tag)}/battlelog`);
}

export async function getPlayerUpcomingChests(tag: string) {
  return crFetch(`/players/${encodeTag(tag)}/upcomingchests`);
}

export async function searchClans(params: {
  name?: string;
  minScore?: number;
  maxMembers?: number;
  minMembers?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.name) query.set("name", params.name);
  if (params.minScore) query.set("minScore", String(params.minScore));
  if (params.maxMembers) query.set("maxMembers", String(params.maxMembers));
  if (params.minMembers) query.set("minMembers", String(params.minMembers));
  query.set("limit", String(params.limit ?? 20));
  return crFetch(`/clans?${query.toString()}`);
}

export async function getGlobalClanWarRankings(limit = 20) {
  return crFetch(`/locations/global/rankings/clanwars?limit=${limit}`);
}

export async function getGlobalPlayerRankings(limit = 20) {
  return crFetch(`/locations/global/rankings/players?limit=${limit}`);
}

export async function getGlobalClanRankings(limit = 20) {
  return crFetch(`/locations/global/rankings/clans?limit=${limit}`);
}

export async function getTournaments(name: string, limit = 20) {
  return crFetch(`/tournaments?name=${encodeURIComponent(name)}&limit=${limit}`);
}

export async function getCards() {
  return crFetch(`/cards`);
}
