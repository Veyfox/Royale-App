import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { usePlayer, usePlayerBattleLog, usePlayerChests } from "@/hooks/useClashApi";

type Tab = "info" | "battles" | "chests";

function StatBox({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.statBox}>
      {icon}
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatBattleResult(battle: any, playerTag: string): { label: string; color: string } {
  try {
    const myTeam = battle.team ?? [];
    const myEntry = myTeam.find((t: any) => t.tag === playerTag) ?? myTeam[0];
    const oppTeam = battle.opponent ?? [];
    const oppEntry = oppTeam[0];
    if (!myEntry || !oppEntry) return { label: "?", color: Colors.textMuted };
    const myTowers = myEntry.crowns ?? 0;
    const oppTowers = oppEntry.crowns ?? 0;
    if (myTowers > oppTowers) return { label: "Victoria", color: Colors.green };
    if (myTowers < oppTowers) return { label: "Derrota", color: Colors.danger };
    return { label: "Empate", color: Colors.warning };
  } catch {
    return { label: "?", color: Colors.textMuted };
  }
}

export default function PlayerDetailScreen() {
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [activeTab, setActiveTab] = useState<Tab>("info");

  const { data: player, isLoading, error, refetch } = usePlayer(tag);
  const { data: battleLogData, isLoading: battlesLoading } = usePlayerBattleLog(tag);
  const { data: chestsData, isLoading: chestsLoading } = usePlayerChests(tag);

  const battles: any[] = Array.isArray(battleLogData) ? battleLogData.slice(0, 20) : [];
  const chests: any[] = chestsData?.items ?? [];

  const TABS: { id: Tab; label: string }[] = [
    { id: "info", label: "Perfil" },
    { id: "battles", label: "Batallas" },
    { id: "chests", label: "Cofres" },
  ];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {isLoading ? "Cargando..." : player?.name ?? "Jugador"}
        </Text>
        <Pressable onPress={() => refetch()} style={styles.backBtn}>
          <Feather name="refresh-cw" size={18} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.green} />
          <Text style={styles.loadingText}>Cargando jugador...</Text>
        </View>
      )}

      {error && !isLoading && (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={48} color={Colors.danger} />
          <Text style={styles.errorText}>Jugador no encontrado</Text>
          <Text style={styles.errorSub}>{tag}</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {player && !isLoading && (
        <>
          {/* Player Header */}
          <View style={styles.playerHeader}>
            <View style={styles.playerAvatar}>
              <Text style={styles.playerInitial}>{player.name?.[0] ?? "?"}</Text>
            </View>
            <View style={styles.playerHeaderInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerTag}>{player.tag}</Text>
              {player.clan && (
                <Pressable
                  onPress={() => router.push({ pathname: "/clan/[tag]", params: { tag: player.clan.tag } })}
                  style={styles.clanLink}
                >
                  <Ionicons name="shield" size={12} color={Colors.green} />
                  <Text style={styles.clanLinkText}>{player.clan.name}</Text>
                  <Feather name="external-link" size={11} color={Colors.green} />
                </Pressable>
              )}
            </View>
            <View style={styles.playerTrophies}>
              <Ionicons name="trophy" size={14} color={Colors.gold} />
              <Text style={styles.playerTrophyNum}>{(player.trophies ?? 0).toLocaleString()}</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {TABS.map((t) => (
              <Pressable key={t.id} onPress={() => setActiveTab(t.id)}
                style={[styles.tab, activeTab === t.id && styles.tabActive]}>
                <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          {activeTab === "info" && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
              <View style={styles.statsGrid}>
                <StatBox label="TROFEOS" value={(player.trophies ?? 0).toLocaleString()}
                  icon={<Ionicons name="trophy" size={18} color={Colors.gold} />} />
                <StatBox label="TROFEOS MÁX" value={(player.bestTrophies ?? 0).toLocaleString()}
                  icon={<Ionicons name="trophy" size={18} color={Colors.warning} />} />
                <StatBox label="NIVEL" value={String(player.expLevel ?? 0)}
                  icon={<Ionicons name="star" size={18} color={Colors.green} />} />
                <StatBox label="VICTORIAS" value={(player.wins ?? 0).toLocaleString()}
                  icon={<Ionicons name="checkmark-circle" size={18} color={Colors.green} />} />
                <StatBox label="DERROTAS" value={(player.losses ?? 0).toLocaleString()}
                  icon={<Ionicons name="close-circle" size={18} color={Colors.danger} />} />
                <StatBox label="BATALLAS" value={(player.battleCount ?? 0).toLocaleString()}
                  icon={<MaterialCommunityIcons name="sword-cross" size={18} color={Colors.textSecondary} />} />
                <StatBox label="DONACIONES" value={(player.donations ?? 0).toLocaleString()}
                  icon={<Feather name="arrow-up" size={18} color={Colors.green} />} />
                <StatBox label="RECIBIDAS" value={(player.donationsReceived ?? 0).toLocaleString()}
                  icon={<Feather name="arrow-down" size={18} color={Colors.textSecondary} />} />
                <StatBox label="CARTAS GANADAS" value={(player.totalDonations ?? 0).toLocaleString()}
                  icon={<Ionicons name="gift" size={18} color={Colors.warning} />} />
                <StatBox label="TROFEOS GUERRA" value={(player.warDayWins ?? 0).toLocaleString()}
                  icon={<MaterialCommunityIcons name="shield-sword" size={18} color={Colors.green} />} />
              </View>

              {/* Favourite card */}
              {player.currentFavouriteCard && (
                <View style={[styles.section]}>
                  <Text style={styles.sectionTitle}>CARTA FAVORITA</Text>
                  <View style={styles.favCard}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="layers" size={24} color={Colors.green} />
                    </View>
                    <View>
                      <Text style={styles.memberName}>{player.currentFavouriteCard.name}</Text>
                      <Text style={styles.memberTag}>ID: {player.currentFavouriteCard.id}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Arena */}
              {player.arena && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>ARENA ACTUAL</Text>
                  <View style={styles.arenaBadge}>
                    <Ionicons name="location" size={16} color={Colors.green} />
                    <Text style={styles.arenaName}>{player.arena.name}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {activeTab === "battles" && (
            <FlatList
              data={battles}
              keyExtractor={(_: any, i: number) => String(i)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40, paddingTop: 8 }}
              ListEmptyComponent={() =>
                battlesLoading ? (
                  <View style={styles.centered}><ActivityIndicator color={Colors.green} /></View>
                ) : (
                  <Text style={styles.emptyText}>Sin batallas recientes</Text>
                )
              }
              renderItem={({ item: battle }) => {
                const result = formatBattleResult(battle, tag ?? "");
                const opponent = battle.opponent?.[0];
                const myEntry = battle.team?.find((t: any) => t.tag === tag) ?? battle.team?.[0];
                return (
                  <View style={styles.battleCard}>
                    <View style={[styles.resultBadge, { backgroundColor: result.color + "22", borderColor: result.color + "55" }]}>
                      <Text style={[styles.resultText, { color: result.color }]}>{result.label}</Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{battle.type ?? "Batalla"}</Text>
                      <Text style={styles.memberTag}>vs {opponent?.name ?? "Oponente"}</Text>
                    </View>
                    <View style={styles.crownRow}>
                      <Text style={styles.crownText}>
                        {myEntry?.crowns ?? 0} - {opponent?.crowns ?? 0}
                      </Text>
                      <Ionicons name="crown" size={14} color={Colors.gold} />
                    </View>
                  </View>
                );
              }}
            />
          )}

          {activeTab === "chests" && (
            <FlatList
              data={chests}
              keyExtractor={(_: any, i: number) => String(i)}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40, paddingTop: 8 }}
              columnWrapperStyle={{ gap: 10 }}
              ListEmptyComponent={() =>
                chestsLoading ? (
                  <View style={styles.centered}><ActivityIndicator color={Colors.green} /></View>
                ) : (
                  <Text style={styles.emptyText}>Sin cofres próximos</Text>
                )
              }
              renderItem={({ item: chest }) => (
                <View style={styles.chestCard}>
                  <Ionicons name="cube" size={30} color={Colors.green} />
                  <Text style={styles.chestName}>{chest.name}</Text>
                  <Text style={styles.chestIndex}>En {chest.index} batallas</Text>
                </View>
              )}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, justifyContent: "space-between",
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  navTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.text, flex: 1, textAlign: "center", marginHorizontal: 8 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  errorText: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  errorSub: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  retryBtn: { backgroundColor: Colors.green, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  retryText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#000" },
  playerHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12,
  },
  playerAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.green + "33", borderWidth: 2, borderColor: Colors.green + "66",
    alignItems: "center", justifyContent: "center",
  },
  playerInitial: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.green },
  playerHeaderInfo: { flex: 1 },
  playerName: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text },
  playerTag: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  clanLink: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  clanLinkText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.green },
  playerTrophies: { alignItems: "center", gap: 2 },
  playerTrophyNum: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.green },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textMuted },
  tabTextActive: { color: Colors.green, fontFamily: "Inter_600SemiBold" },
  statsGrid: {
    flexDirection: "row", flexWrap: "wrap",
    paddingHorizontal: 16, gap: 10, marginTop: 12,
  },
  statBox: {
    flex: 1, minWidth: "45%", backgroundColor: Colors.surface,
    borderRadius: 14, padding: 14, alignItems: "center", gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 9, color: Colors.textSecondary, letterSpacing: 1 },
  section: { paddingHorizontal: 16, marginTop: 12 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.green, letterSpacing: 1.5, marginBottom: 10 },
  favCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: Colors.green + "22", alignItems: "center", justifyContent: "center",
  },
  arenaBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  arenaName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text },
  memberInfo: { flex: 1 },
  memberName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  memberTag: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  battleCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  resultBadge: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, minWidth: 72, alignItems: "center",
  },
  resultText: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.5 },
  crownRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  crownText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.text },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center", marginTop: 40 },
  chestCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, alignItems: "center", gap: 8, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  chestName: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text, textAlign: "center" },
  chestIndex: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textSecondary },
});
