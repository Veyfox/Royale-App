import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useClan, useClanMembers, useClanCurrentWar, useClanWarLog } from "@/hooks/useClashApi";
import { useClanSearch } from "@/contexts/ClanSearchContext";

function StatBox({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.statBox}>
      {icon}
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function getRoleColor(role: string) {
  switch (role) {
    case "leader": return Colors.gold;
    case "coLeader": return Colors.warning;
    case "elder": return Colors.green;
    default: return Colors.textSecondary;
  }
}
function getRoleLabel(role: string) {
  switch (role) {
    case "leader": return "Líder";
    case "coLeader": return "Co-Líder";
    case "elder": return "Anciano";
    default: return "Miembro";
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "inviteOnly": return "Solo invitados";
    case "open": return "Abierto";
    case "closed": return "Cerrado";
    default: return type;
  }
}

type Tab = "info" | "members" | "war" | "warlog";

export default function ClanDetailScreen() {
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { addRecentSearch } = useClanSearch();
  const [activeTab, setActiveTab] = useState<Tab>("info");

  const { data: clan, isLoading: clanLoading, error: clanError, refetch: refetchClan } = useClan(tag);
  const { data: membersData, isLoading: membersLoading } = useClanMembers(tag);
  const { data: currentWar, isLoading: warLoading } = useClanCurrentWar(tag);
  const { data: warLog, isLoading: warLogLoading } = useClanWarLog(tag);

  React.useEffect(() => {
    if (clan) {
      addRecentSearch({
        tag: clan.tag,
        name: clan.name,
        members: clan.members,
        maxMembers: clan.maxMembers,
        clanScore: clan.clanScore ?? 0,
        badgeColor: "#4A7DCA",
        isPro: (clan.clanWarTrophies ?? 0) > 10000,
      });
    }
  }, [clan]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const members = membersData?.items ?? [];
  const warParticipants = currentWar?.clan?.participants ?? [];
  const warStanding = currentWar?.standing;

  const TABS: { id: Tab; label: string }[] = [
    { id: "info", label: "Info" },
    { id: "members", label: `Miembros${clan ? ` (${clan.members})` : ""}` },
    { id: "war", label: "Guerra" },
    { id: "warlog", label: "Historial" },
  ];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Nav Bar */}
      <View style={styles.navBar}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {clanLoading ? "Cargando..." : clan?.name ?? "Clan"}
        </Text>
        <Pressable onPress={() => refetchClan()} style={styles.backBtn}>
          <Feather name="refresh-cw" size={18} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {clanLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.green} />
          <Text style={styles.loadingText}>Buscando clan...</Text>
        </View>
      )}

      {clanError && !clanLoading && (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={48} color={Colors.danger} />
          <Text style={styles.errorText}>No se encontró el clan</Text>
          <Text style={styles.errorSub}>{tag}</Text>
          <Pressable onPress={() => refetchClan()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {clan && !clanLoading && (
        <>
          {/* Clan Header */}
          <View style={styles.clanHeader}>
            <View style={styles.bigBadge}>
              <Ionicons name="shield" size={44} color={Colors.green} />
            </View>
            <View style={styles.clanHeaderInfo}>
              <Text style={styles.clanName}>{clan.name}</Text>
              <Text style={styles.clanTag}>{clan.tag}</Text>
            </View>
            <View style={styles.clanScore}>
              <Ionicons name="trophy" size={14} color={Colors.gold} />
              <Text style={styles.clanScoreText}>{(clan.clanScore / 1000).toFixed(1)}k</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {TABS.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setActiveTab(t.id)}
                style={[styles.tab, activeTab === t.id && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === "info" && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
              {clan.description ? (
                <View style={styles.descCard}>
                  <Text style={styles.descText}>{clan.description}</Text>
                </View>
              ) : null}

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <StatBox label="MIEMBROS" value={`${clan.members}/${clan.maxMembers}`}
                  icon={<Ionicons name="people" size={18} color={Colors.green} />} />
                <StatBox label="TROFEOS CLAN" value={(clan.clanScore ?? 0).toLocaleString()}
                  icon={<Ionicons name="trophy" size={18} color={Colors.gold} />} />
                <StatBox label="TROFEOS GUERRA" value={(clan.clanWarTrophies ?? 0).toLocaleString()}
                  icon={<MaterialCommunityIcons name="sword-cross" size={18} color={Colors.green} />} />
                <StatBox label="REQUERIDOS" value={(clan.requiredTrophies ?? 0).toLocaleString()}
                  icon={<Ionicons name="star" size={18} color={Colors.warning} />} />
                <StatBox label="DONACIONES/SEM" value={(clan.donationsPerWeek ?? 0).toLocaleString()}
                  icon={<Feather name="gift" size={18} color={Colors.green} />} />
                <StatBox label="TIPO" value={getTypeLabel(clan.type ?? "")}
                  icon={<Feather name="lock" size={18} color={Colors.textSecondary} />} />
              </View>

              {/* War stats if available */}
              {(clan.wins !== undefined) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>RÉCORD DE GUERRA</Text>
                  <View style={styles.warRecord}>
                    <View style={styles.warStat}>
                      <Text style={[styles.warStatValue, { color: Colors.green }]}>{clan.wins}</Text>
                      <Text style={styles.warStatLabel}>VICTORIAS</Text>
                    </View>
                    <View style={styles.warStatDivider} />
                    <View style={styles.warStat}>
                      <Text style={[styles.warStatValue, { color: Colors.danger }]}>{clan.losses}</Text>
                      <Text style={styles.warStatLabel}>DERROTAS</Text>
                    </View>
                    <View style={styles.warStatDivider} />
                    <View style={styles.warStat}>
                      <Text style={[styles.warStatValue, { color: Colors.warning }]}>{clan.draws ?? 0}</Text>
                      <Text style={styles.warStatLabel}>EMPATES</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {activeTab === "members" && (
            <FlatList
              data={members}
              keyExtractor={(m: any) => m.tag}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40, paddingTop: 8 }}
              ListEmptyComponent={() =>
                membersLoading ? (
                  <View style={styles.centered}>
                    <ActivityIndicator color={Colors.green} />
                  </View>
                ) : (
                  <Text style={styles.emptyText}>Sin miembros</Text>
                )
              }
              renderItem={({ item: m, index }) => (
                <Pressable
                  onPress={() => router.push({ pathname: "/player/[tag]", params: { tag: m.tag } })}
                  style={({ pressed }) => [styles.memberCard, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.memberRank}>{index + 1}</Text>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{m.name}</Text>
                    <View style={styles.memberMeta}>
                      <Text style={[styles.memberRole, { color: getRoleColor(m.role) }]}>
                        {getRoleLabel(m.role)}
                      </Text>
                      <Text style={styles.memberTag}>{m.tag}</Text>
                    </View>
                  </View>
                  <View style={styles.memberStats}>
                    <View style={styles.memberStatRow}>
                      <Ionicons name="trophy" size={12} color={Colors.gold} />
                      <Text style={styles.memberStatValue}>{(m.trophies ?? 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.memberStatRow}>
                      <Feather name="arrow-up" size={12} color={Colors.green} />
                      <Text style={styles.memberStatSmall}>{m.donations ?? 0}</Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={16} color={Colors.textMuted} />
                </Pressable>
              )}
            />
          )}

          {activeTab === "war" && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
              {warLoading ? (
                <View style={styles.centered}>
                  <ActivityIndicator color={Colors.green} />
                  <Text style={styles.loadingText}>Cargando guerra...</Text>
                </View>
              ) : currentWar ? (
                <View style={{ paddingHorizontal: 16 }}>
                  {/* Current war state */}
                  <View style={styles.warStateBanner}>
                    <MaterialCommunityIcons name="sword-cross" size={20} color={Colors.green} />
                    <Text style={styles.warStateText}>
                      {currentWar.state === "matchmaking" ? "Buscando rival" :
                       currentWar.state === "warDay" ? "Día de guerra activo" :
                       currentWar.state === "collectionDay" ? "Día de colección" :
                       currentWar.state ?? "Guerra en curso"}
                    </Text>
                  </View>

                  {warStanding !== undefined && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>POSICIÓN</Text>
                      <View style={styles.warRecord}>
                        <View style={styles.warStat}>
                          <Text style={[styles.warStatValue, { color: Colors.gold }]}>#{warStanding}</Text>
                          <Text style={styles.warStatLabel}>PUESTO</Text>
                        </View>
                        {currentWar.periodPoints !== undefined && (
                          <>
                            <View style={styles.warStatDivider} />
                            <View style={styles.warStat}>
                              <Text style={styles.warStatValue}>{currentWar.periodPoints}</Text>
                              <Text style={styles.warStatLabel}>PUNTOS</Text>
                            </View>
                          </>
                        )}
                        {currentWar.fame !== undefined && (
                          <>
                            <View style={styles.warStatDivider} />
                            <View style={styles.warStat}>
                              <Text style={[styles.warStatValue, { color: Colors.green }]}>{currentWar.fame}</Text>
                              <Text style={styles.warStatLabel}>FAMA</Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  )}

                  {warParticipants.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>PARTICIPANTES ({warParticipants.length})</Text>
                      {warParticipants.map((p: any) => (
                        <View key={p.tag} style={styles.warParticipant}>
                          <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{p.name}</Text>
                            <Text style={styles.memberTag}>{p.tag}</Text>
                          </View>
                          <View style={styles.memberStats}>
                            <View style={styles.memberStatRow}>
                              <MaterialCommunityIcons name="sword" size={12} color={Colors.green} />
                              <Text style={styles.memberStatValue}>{p.wins ?? 0} wins</Text>
                            </View>
                            <View style={styles.memberStatRow}>
                              <Ionicons name="flash" size={12} color={Colors.gold} />
                              <Text style={styles.memberStatSmall}>{p.fame ?? 0} fama</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.centered}>
                  <MaterialCommunityIcons name="sword-cross" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>Sin guerra activa</Text>
                </View>
              )}
            </ScrollView>
          )}

          {activeTab === "warlog" && (
            <FlatList
              data={warLog?.items ?? []}
              keyExtractor={(_: any, i: number) => String(i)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40, paddingTop: 8 }}
              ListEmptyComponent={() =>
                warLogLoading ? (
                  <View style={styles.centered}><ActivityIndicator color={Colors.green} /></View>
                ) : (
                  <Text style={styles.emptyText}>Sin historial de guerras</Text>
                )
              }
              renderItem={({ item: war }: { item: any }) => {
                const clanEntry = war.standings?.find((s: any) => s.clan?.tag === clan.tag);
                const place = clanEntry?.rank;
                const trophyChange = clanEntry?.trophyChange;
                return (
                  <View style={styles.warLogCard}>
                    <View style={[styles.placementBadge, {
                      borderColor: place === 1 ? Colors.gold + "88" : Colors.border,
                      backgroundColor: place === 1 ? Colors.gold + "22" : Colors.surface2,
                    }]}>
                      <Text style={[styles.placementText, { color: place === 1 ? Colors.gold : Colors.textSecondary }]}>
                        {place ? `#${place}` : "?"}
                      </Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>
                        Temporada {war.seasonId ?? ""}
                      </Text>
                      <Text style={styles.memberTag}>
                        {war.standings?.length ?? 0} clanes participaron
                      </Text>
                    </View>
                    {trophyChange !== undefined && (
                      <View style={styles.memberStats}>
                        <View style={styles.memberStatRow}>
                          <Ionicons name="trophy" size={12} color={trophyChange >= 0 ? Colors.green : Colors.danger} />
                          <Text style={[styles.memberStatValue, { color: trophyChange >= 0 ? Colors.green : Colors.danger }]}>
                            {trophyChange >= 0 ? "+" : ""}{trophyChange}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              }}
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  navTitle: {
    fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.text,
    flex: 1, textAlign: "center", marginHorizontal: 8,
  },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  errorText: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  errorSub: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  retryBtn: {
    backgroundColor: Colors.green, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  retryText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#000" },
  clanHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: 12,
  },
  bigBadge: {
    width: 54, height: 54, borderRadius: 14,
    backgroundColor: Colors.green + "22", borderWidth: 1, borderColor: Colors.green + "44",
    alignItems: "center", justifyContent: "center",
  },
  clanHeaderInfo: { flex: 1 },
  clanName: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.text },
  clanTag: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.green, marginTop: 2 },
  clanScore: { flexDirection: "row", alignItems: "center", gap: 4 },
  clanScoreText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.green },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textMuted },
  tabTextActive: { color: Colors.green, fontFamily: "Inter_600SemiBold" },
  descCard: {
    margin: 16, backgroundColor: Colors.surface,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border,
  },
  descText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  statsGrid: {
    flexDirection: "row", flexWrap: "wrap",
    paddingHorizontal: 16, gap: 10, marginTop: 8, marginBottom: 8,
  },
  statBox: {
    flex: 1, minWidth: "45%", backgroundColor: Colors.surface,
    borderRadius: 14, padding: 14, alignItems: "center", gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 9, color: Colors.textSecondary, letterSpacing: 1 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.green,
    letterSpacing: 1.5, marginBottom: 12,
  },
  warRecord: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface,
    borderRadius: 14, padding: 16, gap: 0, borderWidth: 1, borderColor: Colors.border,
    justifyContent: "space-around",
  },
  warStat: { alignItems: "center", flex: 1 },
  warStatValue: { fontFamily: "Inter_700Bold", fontSize: 24 },
  warStatLabel: { fontFamily: "Inter_500Medium", fontSize: 9, color: Colors.textSecondary, letterSpacing: 1, marginTop: 2 },
  warStatDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  memberCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  memberRank: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textMuted, width: 24, textAlign: "center" },
  memberInfo: { flex: 1 },
  memberName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  memberMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  memberRole: { fontFamily: "Inter_500Medium", fontSize: 11 },
  memberTag: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  memberStats: { alignItems: "flex-end", gap: 3 },
  memberStatRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  memberStatValue: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  memberStatSmall: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.green },
  emptyText: {
    fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted,
    textAlign: "center", marginTop: 40,
  },
  warStateBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.green + "22", borderRadius: 12,
    padding: 14, marginTop: 12, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.green + "44",
  },
  warStateText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.green },
  warParticipant: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  warLogCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, gap: 12,
  },
  placementBadge: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },
  placementText: { fontFamily: "Inter_700Bold", fontSize: 14 },
});
