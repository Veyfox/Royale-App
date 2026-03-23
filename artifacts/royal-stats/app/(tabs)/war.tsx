import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import Colors from "@/constants/colors";

const MOCK_WAR_LOG = [
  {
    id: "1",
    season: "Season 47",
    placement: 1,
    wins: 18,
    battles: 20,
    trophiesEarned: 1200,
    status: "victory",
  },
  {
    id: "2",
    season: "Season 46",
    placement: 3,
    wins: 14,
    battles: 20,
    trophiesEarned: 900,
    status: "good",
  },
  {
    id: "3",
    season: "Season 45",
    placement: 2,
    wins: 16,
    battles: 20,
    trophiesEarned: 1050,
    status: "good",
  },
  {
    id: "4",
    season: "Season 44",
    placement: 7,
    wins: 9,
    battles: 20,
    trophiesEarned: 450,
    status: "average",
  },
];

function PlacementBadge({ placement }: { placement: number }) {
  const color =
    placement === 1
      ? Colors.gold
      : placement <= 3
      ? "#C0C0C0"
      : Colors.textSecondary;
  return (
    <View style={[styles.placementBadge, { borderColor: color + "55", backgroundColor: color + "22" }]}>
      <Text style={[styles.placementText, { color }]}>#{placement}</Text>
    </View>
  );
}

export default function WarScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalWins = MOCK_WAR_LOG.reduce((s, w) => s + w.wins, 0);
  const totalBattles = MOCK_WAR_LOG.reduce((s, w) => s + w.battles, 0);
  const totalTrophies = MOCK_WAR_LOG.reduce((s, w) => s + w.trophiesEarned, 0);
  const winRate = Math.round((totalWins / totalBattles) * 100);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="sword-cross" size={24} color={Colors.green} />
        <Text style={styles.title}>WAR</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
      >
        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>WIN RATE</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalWins}</Text>
            <Text style={styles.statLabel}>TOTAL WINS</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.trophyInline}>
              <Ionicons name="trophy" size={14} color={Colors.green} />
              <Text style={styles.statValue}>{(totalTrophies / 1000).toFixed(1)}k</Text>
            </View>
            <Text style={styles.statLabel}>TROPHIES</Text>
          </View>
        </View>

        {/* War Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WAR LOG</Text>

          {MOCK_WAR_LOG.map((war) => (
            <View key={war.id} style={styles.warCard}>
              <PlacementBadge placement={war.placement} />
              <View style={styles.warInfo}>
                <Text style={styles.warSeason}>{war.season}</Text>
                <View style={styles.warStats}>
                  <View style={styles.warStat}>
                    <Text style={styles.warStatValue}>{war.wins}</Text>
                    <Text style={styles.warStatLabel}>Wins</Text>
                  </View>
                  <View style={styles.warStatDivider} />
                  <View style={styles.warStat}>
                    <Text style={styles.warStatValue}>{war.battles}</Text>
                    <Text style={styles.warStatLabel}>Battles</Text>
                  </View>
                </View>
              </View>
              <View style={styles.warTrophies}>
                <Ionicons name="trophy" size={14} color={Colors.green} />
                <Text style={styles.warTrophyCount}>+{war.trophiesEarned}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Placeholder notice */}
        <View style={styles.noticeBanner}>
          <Ionicons name="information-circle" size={16} color={Colors.green} />
          <Text style={styles.noticeText}>
            Search a clan to load its real war stats from the API.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 10,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.text,
    letterSpacing: 2,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginTop: 4,
  },
  trophyInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.green,
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  warCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  placementBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  placementText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  warInfo: {
    flex: 1,
  },
  warSeason: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
  },
  warStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  warStat: {
    alignItems: "center",
  },
  warStatValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.text,
  },
  warStatLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: Colors.textSecondary,
  },
  warStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  warTrophies: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  warTrophyCount: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.green,
  },
  noticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    marginTop: 12,
    backgroundColor: Colors.green + "11",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.green + "33",
  },
  noticeText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
