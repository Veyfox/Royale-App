import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type RecentClan = {
  tag: string;
  name: string;
  members: number;
  maxMembers: number;
  clanScore: number;
  isPro?: boolean;
  badgeColor?: string;
};

type ClanSearchContextType = {
  recentSearches: RecentClan[];
  addRecentSearch: (clan: RecentClan) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (tag: string) => void;
};

const ClanSearchContext = createContext<ClanSearchContextType | undefined>(
  undefined
);

const STORAGE_KEY = "royal_stats_recent_clans";
const MAX_RECENT = 10;

export function ClanSearchProvider({ children }: { children: React.ReactNode }) {
  const [recentSearches, setRecentSearches] = useState<RecentClan[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setRecentSearches(JSON.parse(data));
        } catch {
          setRecentSearches([]);
        }
      } else {
        const initial: RecentClan[] = [
          {
            tag: "#2GQUV08Q",
            name: "Alpha Wolves",
            members: 45,
            maxMembers: 50,
            clanScore: 64200,
            isPro: true,
            badgeColor: "#4A7DCA",
          },
          {
            tag: "#8L0PC999",
            name: "Royal Kings",
            members: 50,
            maxMembers: 50,
            clanScore: 58900,
            badgeColor: "#CA4A4A",
          },
        ];
        setRecentSearches(initial);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    });
  }, []);

  const addRecentSearch = useCallback((clan: RecentClan) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((c) => c.tag !== clan.tag);
      const updated = [clan, ...filtered].slice(0, MAX_RECENT);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const removeRecentSearch = useCallback((tag: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((c) => c.tag !== tag);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <ClanSearchContext.Provider
      value={{ recentSearches, addRecentSearch, clearRecentSearches, removeRecentSearch }}
    >
      {children}
    </ClanSearchContext.Provider>
  );
}

export function useClanSearch() {
  const ctx = useContext(ClanSearchContext);
  if (!ctx) throw new Error("useClanSearch must be used within ClanSearchProvider");
  return ctx;
}
