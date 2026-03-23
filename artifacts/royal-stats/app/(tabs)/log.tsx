import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import Colors from "@/constants/colors";
import { usePlayer, usePlayerBattleLog, useGlobalPlayerRankings } from "@/hooks/useClashApi";

type Tab = "playerSearch" | "rankings";

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [activeTab, setActiveTab] = useState<Tab>("playerSearch");
  const [inputTag, setInputTag] = useState("");
  const [searchedTag, setSearchedTag] = useState<string | undefined>(undefined);

  const { data: player, isLoading: playerLoading, error: playerError } = usePlayer(searchedTag);
  const { data: battleLog, isLoading: battlesLoading } = usePlayerBattleLog(searchedTag);
  const { data: playerRankings, isLoading: rankingsLoading } = useGlobalPlayerRankings(50);

  const battles: any[] = Array.isArray(battleLog) ? battleLog.slice(0, 15) : [];

  const handleSearch = () => {
    if (!inputTag.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const tag = inputTag.trim().startsWith("#") ? inputTag.trim() : `#${inputTag.trim().toUpperCase()}`;
    setSearchedTag(tag);
  };

  const formatBattleResult = (battle: any): { label: string; color: string } => {
    try {
      const myTeam = battle.team ?? [];
      const oppTeam = battle.opponent ?? [];
      const myEntry = myTeam.find((t: any) => t.tag === searchedTag) ?? myTeam[0];
      const oppEntry = oppTeam[0];
      if (!myEntry || !oppEntry) return { label: "?", color: Colors.textMuted };
      const myC = myEntry.crowns ?? 0;
      const oppC = oppEntry.crowns ?? 0;
      if (myC > oppC) return { label: "Victoria", color: Colors.green };
      if (myC < oppC) return { label: "Derrota", color: Colors.danger };
      return { label: "Empate", color: Colors.warning };
    } catch { return { label: "?", color: Colors.textMuted }; }
  };

  const TABS = [
    { id: "playerSearch" as Tab, label: "Jugador" },
    { id: "rankings" as Tab, label: "Top Jugadores" },
  ];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Feather name="user" size={22} color={Colors.green} />
        <Text style={styles.title}>JUGADORES</Text>
      </View>

      <View style={styles.tabsRow}>
        {TABS.map((t) => (
          <Pressable key={t.id} onPress={() => setActiveTab(t.id)}
            style={[styles.tab, activeTab === t.id && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "playerSearch" && (
        <FlatList
          data={battles}
          keyExtractor={(_: any, i: number) => String(i)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: tabBarHeight + 24 }}
          ListHeaderComponent={() => (
            <View>
              {/* Search */}
              <View style={styles.searchRow}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.hashPrefix}>#</Text>
                  <TextInput
                    value={inputTag}
                    onChangeText={setInputTag}
                    placeholder="TAG DEL JUGADOR"
                    placeholderTextColor={Colors.textMuted}
                    style={styles.input}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                  />
                  {inputTag.length > 0 && (
                    <Pressable onPress={() => setInputTag("")} hitSlop={8}>
                      <Feather name="x-circle" size={16} color={Colors.textMuted} />
                    </Pressable>
                  )}
                </View>
                <Pressable onPress={handleSearch} style={styles.searchBtn}>
                  <Feather name="search" size={20} color="#000" />
                </Pressable>
              </View>

              {playerLoading && (
                <View style={styles.centered}>
                  <ActivityIndicator color={Colors.green} />
                  <Text style={styles.loadingText}>Buscando jugador...</Text>
                </View>
              )}

              {playerError && !playerLoading && searchedTag && (
                <View style={styles.centered}>
                  <Ionicons name="alert-circle" size={40} color={Colors.danger} />
                  <Text style={styles.errorText}>Jugador no encontrado</Text>
                </View>
              )}

              {player && !playerLoading && (
                <Pressable
                  onPress={() => router.push({ pathname: "/player/[tag]", params: { tag: player.tag } })}
                  style={styles.playerCard}
                >
                  <View style={styles.playerAvatar}>
                    <Text style={styles.playerInitial}>{player.name?.[0] ?? "?"}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerTag}>{player.tag}</Text>
                    {player.clan && (
                      <View style={styles.clanRow}>
                        <Ionicons name="shield" size={11} color={Colors.green} />
                        <Text style={styles.clanText}>{player.clan.name}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.playerStats}>
                    <View style={styles.statRow}>
                      <Ionicons name="trophy" size={13} color={Colors.gold} />
                      <Text style={styles.statVal}>{(player.trophies ?? 0).toLocaleString()}</Text>
                    </View>
                    <Text style={styles.statSub}>Niv. {player.expLevel ?? 0}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={Colors.textMuted} />
                </Pressable>
              )}

              {battles.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.sectionTitle}>BATALLAS RECIENTES</Text>
                </View>
              )}

              {battlesLoading && player && (
                <ActivityIndicator color={Colors.green} style={{ marginTop: 12 }} />
              )}
            </View>
          )}
          ListEmptyComponent={() =>
            !playerLoading && !battlesLoading && !player && !searchedTag ? (
              <View style={[styles.centered, { marginTop: 32 }]}>
                <Feather name="user" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>Ingresa un tag de jugador{"\n"}para buscar estadísticas</Text>
              </View>
            ) : null
          }
          renderItem={({ item: battle }) => {
            const result = formatBattleResult(battle);
            const opponent = battle.opponent?.[0];
            const myEntry = battle.team?.find((t: any) => t.tag === searchedTag) ?? battle.team?.[0];
            return (
              <View style={styles.battleCard}>
                <View style={[styles.resultBadge, {
                  backgroundColor: result.color + "22",
                  borderColor: result.color + "55",
                }]}>
                  <Text style={[styles.resultText, { color: result.color }]}>{result.label}</Text>
                </View>
                <View style={styles.playerInfo}>
                  <Text style={styles.battleType}>{battle.type ?? "Batalla"}</Text>
                  <Text style={styles.battleOpp}>vs {opponent?.name ?? "Oponente"}</Text>
                </View>
                <View style={styles.crownRow}>
                  <Text style={styles.crownText}>
                    {myEntry?.crowns ?? 0} - {opponent?.crowns ?? 0}
                  </Text>
                  <Ionicons name="crown" size={13} color={Colors.gold} />
                </View>
              </View>
            );
          }}
        />
      )}

      {activeTab === "rankings" && (
        <FlatList
          data={playerRankings?.items ?? []}
          keyExtractor={(item: any) => item.tag}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: tabBarHeight + 24, paddingTop: 10 }}
          ListHeaderComponent={() =>
            rankingsLoading ? (
              <View style={styles.centered}><ActivityIndicator color={Colors.green} /></View>
            ) : null
          }
          ListEmptyComponent={() =>
            !rankingsLoading ? <Text style={styles.emptyText}>Sin datos de rankings</Text> : null
          }
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => router.push({ pathname: "/player/[tag]", params: { tag: item.tag } })}
              style={({ pressed }) => [styles.rankCard, pressed && { opacity: 0.8 }]}
            >
              <View style={[styles.rankBadge, {
                backgroundColor: index === 0 ? Colors.gold + "22" : index === 1 ? "#C0C0C022" : index === 2 ? "#CD7F3222" : Colors.surface2,
                borderColor: index === 0 ? Colors.gold + "66" : index === 1 ? "#C0C0C066" : index === 2 ? "#CD7F3266" : Colors.border,
              }]}>
                <Text style={[styles.rankNum, {
                  color: index === 0 ? Colors.gold : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : Colors.textSecondary,
                }]}>#{item.rank}</Text>
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={styles.playerTag}>{item.tag}</Text>
                {item.clan && (
                  <View style={styles.clanRow}>
                    <Ionicons name="shield" size={11} color={Colors.green} />
                    <Text style={styles.clanText}>{item.clan.name}</Text>
                  </View>
                )}
              </View>
              <View style={styles.playerStats}>
                <View style={styles.statRow}>
                  <Ionicons name="trophy" size={13} color={Colors.gold} />
                  <Text style={styles.statVal}>{(item.trophies ?? 0).toLocaleString()}</Text>
                </View>
                <Text style={styles.statSub}>Niv. {item.expLevel ?? 0}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.textMuted} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 24, paddingVertical: 16, gap: 10,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.text, letterSpacing: 2 },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.green },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textMuted },
  tabTextActive: { color: Colors.green, fontFamily: "Inter_600SemiBold" },
  centered: { alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 32 },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  errorText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.danger },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center", marginTop: 20 },
  searchRow: { flexDirection: "row", gap: 10, paddingTop: 12, paddingBottom: 4 },
  inputWrapper: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 12, gap: 6,
  },
  hashPrefix: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.green },
  input: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text, padding: 0, letterSpacing: 1 },
  searchBtn: {
    backgroundColor: Colors.green, borderRadius: 12,
    width: 50, alignItems: "center", justifyContent: "center",
  },
  playerCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 14, marginTop: 12, borderWidth: 1, borderColor: Colors.green + "55", gap: 12,
  },
  playerAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.green + "33", alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: Colors.green + "66",
  },
  playerInitial: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.green },
  playerInfo: { flex: 1 },
  playerName: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.text },
  playerTag: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  clanRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  clanText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.green },
  playerStats: { alignItems: "flex-end", gap: 4 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text },
  statSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textSecondary },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.green,
    letterSpacing: 1.5, marginBottom: 8,
  },
  battleCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  resultBadge: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, minWidth: 72, alignItems: "center",
  },
  resultText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  battleType: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  battleOpp: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  crownRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  crownText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.text },
  rankCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  rankBadge: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },
  rankNum: { fontFamily: "Inter_700Bold", fontSize: 13 },
});
