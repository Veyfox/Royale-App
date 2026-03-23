import { useQuery } from "@tanstack/react-query";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api/clash`;

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── CLAN ─────────────────────────────────────────────────────────────────────

export function useClan(tag: string | undefined) {
  return useQuery({
    queryKey: ["clan", tag],
    queryFn: () => apiFetch<any>(`/clans/${encodeURIComponent(tag!)}`),
    enabled: !!tag,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useClanMembers(tag: string | undefined) {
  return useQuery({
    queryKey: ["clanMembers", tag],
    queryFn: () => apiFetch<any>(`/clans/${encodeURIComponent(tag!)}/members?limit=50`),
    enabled: !!tag,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useClanWarLog(tag: string | undefined) {
  return useQuery({
    queryKey: ["clanWarLog", tag],
    queryFn: () => apiFetch<any>(`/clans/${encodeURIComponent(tag!)}/warlog?limit=10`),
    enabled: !!tag,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useClanCurrentWar(tag: string | undefined) {
  return useQuery({
    queryKey: ["clanCurrentWar", tag],
    queryFn: () => apiFetch<any>(`/clans/${encodeURIComponent(tag!)}/currentwar`),
    enabled: !!tag,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useSearchClans(name: string) {
  return useQuery({
    queryKey: ["searchClans", name],
    queryFn: () => apiFetch<any>(`/clans/search?name=${encodeURIComponent(name)}&limit=20`),
    enabled: name.length >= 3,
    staleTime: 30_000,
    retry: 1,
  });
}

// ─── PLAYER ───────────────────────────────────────────────────────────────────

export function usePlayer(tag: string | undefined) {
  return useQuery({
    queryKey: ["player", tag],
    queryFn: () => apiFetch<any>(`/players/${encodeURIComponent(tag!)}`),
    enabled: !!tag,
    staleTime: 60_000,
    retry: 1,
  });
}

export function usePlayerBattleLog(tag: string | undefined) {
  return useQuery({
    queryKey: ["playerBattleLog", tag],
    queryFn: () => apiFetch<any>(`/players/${encodeURIComponent(tag!)}/battlelog`),
    enabled: !!tag,
    staleTime: 60_000,
    retry: 1,
  });
}

export function usePlayerChests(tag: string | undefined) {
  return useQuery({
    queryKey: ["playerChests", tag],
    queryFn: () => apiFetch<any>(`/players/${encodeURIComponent(tag!)}/chests`),
    enabled: !!tag,
    staleTime: 60_000,
    retry: 1,
  });
}

// ─── RANKINGS ─────────────────────────────────────────────────────────────────

export function useGlobalClanWarRankings(limit = 20) {
  return useQuery({
    queryKey: ["globalClanWarRankings", limit],
    queryFn: () => apiFetch<any>(`/rankings/clanwars?limit=${limit}`),
    staleTime: 120_000,
    retry: 1,
  });
}

export function useGlobalPlayerRankings(limit = 20) {
  return useQuery({
    queryKey: ["globalPlayerRankings", limit],
    queryFn: () => apiFetch<any>(`/rankings/players?limit=${limit}`),
    staleTime: 120_000,
    retry: 1,
  });
}

export function useGlobalClanRankings(limit = 20) {
  return useQuery({
    queryKey: ["globalClanRankings", limit],
    queryFn: () => apiFetch<any>(`/rankings/clans?limit=${limit}`),
    staleTime: 120_000,
    retry: 1,
  });
}
