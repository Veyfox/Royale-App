import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import Colors from "@/constants/colors";
import { useGlobalClanWarRankings, useGlobalClanRankings, useClanCurrentWar } from "@/hooks/useClashApi";

type RankTab = "warRankings" | "clanRankings" | "liveWar";

export default function WarScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [activeTab, setActiveTab] = useState<RankTab>("warRankings");
  const [clanTag, setClanTag] = useState("");
  const [searchTag, setSearchTag] = useState<string | undefined>(undefined);

  const { data: warRankings, isLoading: warLoading, error: warError, refetch: refetchWar } = useGlobalClanWarRankings(50);
  const { data: clanRankings, isLoading: clanRankingLoading } = useGlobalClanRankings(50);
  const { data: currentWar, isLoading: currentWarLoading, error: currentWarError } = useClanCurrentWar(searchTag);

  const handleSearchWar = () => {
    if (!clanTag.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const tag = clanTag.trim().startsWith("#") ? clanTag.trim() : `#${clanTag.trim().toUpperCase()}`;
    setSearchTag(tag);
  };

  const TABS = [
    { id: "warRankings" as RankTab, label: "Top Guerra" },
    { id: "clanRankings" as RankTab, label: "Top Clanes" },
    { id: "liveWar" as RankTab, label: "Guerra Actual" },
  ];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="sword-cross" size={24} color={Colors.green} />
        <Text style={styles.title}>GUERRA</Text>
      </View>

      {/* Sub-tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((t) => (
          <Pressable key={t.id} onPress={() => setActiveTab(t.id)}
            style={[styles.tab, activeTab === t.id && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* War Rankings */}
      {activeTab === "warRankings" && (
        <FlatList
          data={warRankings?.items ?? []}
          keyExtractor={(item: any) => item.tag}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: tabBarHeight + 24, paddingTop: 10 }}
          ListHeaderComponent={() =>
            warLoading ? (
              <View style={styles.centered}><ActivityIndicator color={Colors.green} /></View>
            ) : warError ? (
              <View style={styles.centered}>
                <Text style={styles.errorText}>Error al cargar rankings</Text>
                <Pressable onPress={() => refetchWar()} style={styles.retryBtn}>
                  <Text style={styles.retryText}>Reintentar</Text>
                </Pressable>
              </View>
            ) : null
          }
          ListEmptyComponent={() =>
            !warLoading ? <Text style={styles.emptyText}>Sin datos de rankings</Text> : null
          }
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => router.push({ pathname: "/clan/[tag]", params: { tag: item.tag } })}
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
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{item.name}</Text>
                <Text style={styles.rankTag}>{item.tag}</Text>
              </View>
              <View style={styles.rankStats}>
                <View style={styles.rankStatRow}>
                  <MaterialCommunityIcons name="sword-cross" size={12} color={Colors.green} />
                  <Text style={styles.rankStatValue}>{(item.clanWarTrophies ?? 0).toLocaleString()}</Text>
                </View>
                <View style={styles.rankStatRow}>
                  <Ionicons name="people" size={12} color={Colors.textSecondary} />
                  <Text style={styles.rankStatSmall}>{item.members ?? 0}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.textMuted} />
            </Pressable>
          )}
        />
      )}

      {/* Clan Rankings */}
      {activeTab === "clanRankings" && (
        <FlatList
          data={clanRankings?.items ?? []}
          keyExtractor={(item: any) => item.tag}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: tabBarHeight + 24, paddingTop: 10 }}
          ListHeaderComponent={() =>
            clanRankingLoading ? (
              <View style={styles.centered}><ActivityIndicator color={Colors.green} /></View>
            ) : null
          }
          ListEmptyComponent={() =>
            !clanRankingLoading ? <Text style={styles.emptyText}>Sin datos de rankings</Text> : null
          }
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => router.push({ pathname: "/clan/[tag]", params: { tag: item.tag } })}
              style={({ pressed }) => [styles.rankCard, pressed && { opacity: 0.8 }]}
            >
              <View style={[styles.rankBadge, {
                backgroundColor: index === 0 ? Colors.gold + "22" : Colors.surface2,
                borderColor: index === 0 ? Colors.gold + "66" : Colors.border,
              }]}>
                <Text style={[styles.rankNum, { color: index === 0 ? Colors.gold : Colors.textSecondary }]}>
                  #{item.rank}
                </Text>
              </View>
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{item.name}</Text>
                <Text style={styles.rankTag}>{item.tag} • {item.location?.name ?? "Global"}</Text>
              </View>
              <View style={styles.rankStats}>
                <View style={styles.rankStatRow}>
                  <Ionicons name="trophy" size={12} color={Colors.gold} />
                  <Text style={styles.rankStatValue}>{(item.clanScore ?? 0).toLocaleString()}</Text>
                </View>
                <View style={styles.rankStatRow}>
                  <Ionicons name="people" size={12} color={Colors.textSecondary} />
                  <Text style={styles.rankStatSmall}>{item.members ?? 0}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.textMuted} />
            </Pressable>
          )}
        />
      )}

      {/* Live War */}
      {activeTab === "liveWar" && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: tabBarHeight + 24, paddingHorizontal: 16 }}
        >
          <Text style={styles.liveWarLabel}>Busca la guerra actual de tu clan</Text>
          <View style={styles.searchRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.hashPrefix}>#</Text>
              <TextInput
                value={clanTag}
                onChangeText={setClanTag}
                placeholder="TAG DEL CLAN"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                autoCapitalize="characters"
                autoCorrect={false}
                onSubmitEditing={handleSearchWar}
                returnKeyType="search"
              />
            </View>
            <Pressable onPress={handleSearchWar} style={styles.searchBtn}>
              <Feather name="search" size={20} color="#000" />
            </Pressable>
          </View>

          {currentWarLoading && (
            <View style={styles.centered}>
              <ActivityIndicator color={Colors.green} />
              <Text style={styles.loadingText}>Cargando guerra...</Text>
            </View>
          )}

          {currentWarError && !currentWarLoading && searchTag && (
            <View style={styles.centered}>
              <Ionicons name="alert-circle" size={40} color={Colors.danger} />
              <Text style={styles.errorText}>No se encontró la guerra</Text>
            </View>
          )}

          {currentWar && !currentWarLoading && (
            <View style={{ marginTop: 16 }}>
              <View style={styles.warStateBanner}>
                <MaterialCommunityIcons name="sword-cross" size={20} color={Colors.green} />
                <Text style={styles.warStateText}>
                  {currentWar.state === "matchmaking" ? "Buscando rival" :
                   currentWar.state === "warDay" ? "Día de guerra activo" :
                   currentWar.state === "collectionDay" ? "Día de colección" :
                   currentWar.state ?? "En curso"}
                </Text>
              </View>

              {/* Clan info */}
              {currentWar.clan && (
                <View style={styles.warClanCard}>
                  <View style={styles.warClanInfo}>
                    <Text style={styles.warClanName}>{currentWar.clan.name}</Text>
                    <Text style={styles.warClanTag}>{currentWar.clan.tag}</Text>
                  </View>
                  <View style={styles.warClanStats}>
                    {currentWar.fame !== undefined && (
                      <View style={styles.rankStatRow}>
                        <Ionicons name="flash" size={14} color={Colors.gold} />
                        <Text style={styles.warStatBig}>{currentWar.fame} fama</Text>
                      </View>
                    )}
                    {currentWar.standing !== undefined && (
                      <Text style={styles.standingText}>Puesto #{currentWar.standing}</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Participants */}
              {currentWar.clan?.participants?.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.sectionTitle}>
                    PARTICIPANTES ({currentWar.clan.participants.length})
                  </Text>
                  {currentWar.clan.participants.map((p: any) => (
                    <Pressable
                      key={p.tag}
                      onPress={() => router.push({ pathname: "/player/[tag]", params: { tag: p.tag } })}
                      style={({ pressed }) => [styles.participantCard, pressed && { opacity: 0.8 }]}
                    >
                      <View style={styles.rankInfo}>
                        <Text style={styles.rankName}>{p.name}</Text>
                        <Text style={styles.rankTag}>{p.tag}</Text>
                      </View>
                      <View style={styles.rankStats}>
                        <View style={styles.rankStatRow}>
                          <MaterialCommunityIcons name="sword" size={12} color={Colors.green} />
                          <Text style={styles.rankStatValue}>{p.wins ?? 0}</Text>
                        </View>
                        <View style={styles.rankStatRow}>
                          <Ionicons name="flash" size={12} color={Colors.gold} />
                          <Text style={styles.rankStatSmall}>{p.fame ?? 0}</Text>
                        </View>
                      </View>
                      <Feather name="chevron-right" size={14} color={Colors.textMuted} />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          {!searchTag && !currentWarLoading && (
            <View style={[styles.centered, { marginTop: 40 }]}>
              <MaterialCommunityIcons name="sword-cross" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Ingresa el tag de tu clan{"\n"}para ver la guerra activa</Text>
            </View>
          )}
        </ScrollView>
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
  title: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.text, letterSpacing: 2 },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.green },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.textMuted },
  tabTextActive: { color: Colors.green, fontFamily: "Inter_600SemiBold" },
  centered: { alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  errorText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.danger },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center", marginTop: 40 },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  retryBtn: { backgroundColor: Colors.green, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#000" },
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
  rankInfo: { flex: 1 },
  rankName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  rankTag: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  rankStats: { alignItems: "flex-end", gap: 3 },
  rankStatRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rankStatValue: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  rankStatSmall: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary },
  liveWarLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textSecondary,
    marginTop: 16, marginBottom: 10,
  },
  searchRow: { flexDirection: "row", gap: 10 },
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
  warStateBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.green + "22", borderRadius: 12,
    padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.green + "44",
  },
  warStateText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.green },
  warClanCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  warClanInfo: { flex: 1 },
  warClanName: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text },
  warClanTag: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  warClanStats: { alignItems: "flex-end", gap: 4 },
  warStatBig: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.text },
  standingText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.gold },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.green,
    letterSpacing: 1.5, marginBottom: 10,
  },
  participantCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
});
