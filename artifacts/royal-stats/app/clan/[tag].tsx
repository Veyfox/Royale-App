import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useClanSearch } from "@/contexts/ClanSearchContext";

type Member = {
  name: string;
  tag: string;
  role: string;
  trophies: number;
  donations: number;
  donationsReceived: number;
};

type ClanDetail = {
  name: string;
  tag: string;
  members: number;
  maxMembers: number;
  clanScore: number;
  clanWarTrophies: number;
  type: string;
  description: string;
  requiredTrophies: number;
  wins: number;
  losses: number;
  memberList: Member[];
  badgeColor: string;
};

const MOCK_CLAN: ClanDetail = {
  name: "Alpha Wolves",
  tag: "#2GQUV08Q",
  members: 45,
  maxMembers: 50,
  clanScore: 64200,
  clanWarTrophies: 12800,
  type: "inviteOnly",
  description:
    "Elite clan seeking active warriors. War mandatory. Donations 500/week min.",
  requiredTrophies: 5000,
  wins: 142,
  losses: 38,
  badgeColor: "#4A7DCA",
  memberList: [
    { name: "DarkWolf99", tag: "#YQL8R", role: "leader", trophies: 8200, donations: 1200, donationsReceived: 300 },
    { name: "IceQueen", tag: "#P2R9V", role: "coLeader", trophies: 7800, donations: 980, donationsReceived: 420 },
    { name: "FireStorm", tag: "#A1B2C", role: "coLeader", trophies: 7400, donations: 870, donationsReceived: 390 },
    { name: "NightOwl", tag: "#D3E4F", role: "elder", trophies: 6900, donations: 750, donationsReceived: 200 },
    { name: "ShadowBlade", tag: "#G5H6I", role: "elder", trophies: 6700, donations: 620, donationsReceived: 180 },
    { name: "ThunderK", tag: "#J7K8L", role: "member", trophies: 6400, donations: 530, donationsReceived: 150 },
    { name: "CrystalX", tag: "#M9N0O", role: "member", trophies: 6100, donations: 490, donationsReceived: 120 },
    { name: "RedDragon", tag: "#P1Q2R", role: "member", trophies: 5900, donations: 410, donationsReceived: 90 },
  ],
};

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
    case "leader": return "Leader";
    case "coLeader": return "Co-Leader";
    case "elder": return "Elder";
    default: return "Member";
  }
}

function StatBox({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.statBox}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ClanDetailScreen() {
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [clan, setClan] = useState<ClanDetail | null>(null);
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const { addRecentSearch } = useClanSearch();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(() => {
      const data = { ...MOCK_CLAN, tag: tag ?? MOCK_CLAN.tag };
      setClan(data);
      setLoading(false);
      addRecentSearch({
        tag: data.tag,
        name: data.name,
        members: data.members,
        maxMembers: data.maxMembers,
        clanScore: data.clanScore,
        badgeColor: data.badgeColor,
        isPro: data.clanWarTrophies > 10000,
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [tag]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const winRate = clan ? Math.round((clan.wins / (clan.wins + clan.losses)) * 100) : 0;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.navBar}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.navTitle}>Loading...</Text>
          <View style={{ width: 40 }} />
        </View>
        {[1, 2, 3].map((i) => (
          <Animated.View key={i} style={[styles.skeleton, { opacity: pulseAnim }]} />
        ))}
      </View>
    );
  }

  if (!clan) return null;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Nav Bar */}
      <View style={styles.navBar}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>{clan.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Clan Header */}
        <View style={styles.clanHeader}>
          <View style={[styles.bigBadge, { backgroundColor: clan.badgeColor + "22", borderColor: clan.badgeColor + "55" }]}>
            <Ionicons name="shield" size={48} color={clan.badgeColor} />
          </View>
          <Text style={styles.clanName}>{clan.name}</Text>
          <Text style={styles.clanTag}>{clan.tag}</Text>
          <Text style={styles.clanDescription}>{clan.description}</Text>

          <View style={styles.typeBadge}>
            <Feather name="lock" size={12} color={Colors.textSecondary} />
            <Text style={styles.typeText}>
              {clan.type === "inviteOnly" ? "Invite Only" : clan.type}
            </Text>
            <Text style={styles.typeText}>•</Text>
            <Ionicons name="trophy" size={12} color={Colors.gold} />
            <Text style={styles.typeText}>{clan.requiredTrophies.toLocaleString()} req.</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatBox
            label="MEMBERS"
            value={`${clan.members}/${clan.maxMembers}`}
            icon={<Ionicons name="people" size={18} color={Colors.green} />}
          />
          <StatBox
            label="CLAN SCORE"
            value={(clan.clanScore / 1000).toFixed(1) + "k"}
            icon={<Ionicons name="trophy" size={18} color={Colors.gold} />}
          />
          <StatBox
            label="WAR TROPHIES"
            value={(clan.clanWarTrophies / 1000).toFixed(1) + "k"}
            icon={<MaterialCommunityIcons name="sword-cross" size={18} color={Colors.green} />}
          />
          <StatBox
            label="WIN RATE"
            value={`${winRate}%`}
            icon={<Ionicons name="trending-up" size={18} color={Colors.green} />}
          />
        </View>

        {/* War Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WAR RECORD</Text>
          <View style={styles.warRecord}>
            <View style={styles.warStat}>
              <Text style={[styles.warStatValue, { color: Colors.green }]}>{clan.wins}</Text>
              <Text style={styles.warStatLabel}>WINS</Text>
            </View>
            <View style={styles.warBarContainer}>
              <View style={styles.warBar}>
                <View
                  style={[
                    styles.warBarFill,
                    { width: `${winRate}%` as any },
                  ]}
                />
              </View>
              <Text style={styles.winRateLabel}>{winRate}%</Text>
            </View>
            <View style={styles.warStat}>
              <Text style={[styles.warStatValue, { color: Colors.danger }]}>{clan.losses}</Text>
              <Text style={styles.warStatLabel}>LOSSES</Text>
            </View>
          </View>
        </View>

        {/* Member List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            MEMBERS ({clan.members}/{clan.maxMembers})
          </Text>
          {clan.memberList.map((member, i) => (
            <View key={member.tag} style={styles.memberCard}>
              <View style={styles.memberRank}>
                <Text style={styles.memberRankText}>{i + 1}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={[styles.memberRole, { color: getRoleColor(member.role) }]}>
                  {getRoleLabel(member.role)}
                </Text>
              </View>
              <View style={styles.memberStats}>
                <View style={styles.memberStatRow}>
                  <Ionicons name="trophy" size={12} color={Colors.gold} />
                  <Text style={styles.memberStatValue}>{member.trophies.toLocaleString()}</Text>
                </View>
                <View style={styles.memberStatRow}>
                  <Feather name="arrow-up" size={12} color={Colors.green} />
                  <Text style={styles.memberStatSmall}>{member.donations}</Text>
                </View>
              </View>
            </View>
          ))}
          {clan.members > clan.memberList.length && (
            <View style={styles.moreMembers}>
              <Text style={styles.moreMembersText}>
                +{clan.members - clan.memberList.length} more members
              </Text>
            </View>
          )}
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
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  skeleton: {
    height: 80,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  clanHeader: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  bigBadge: {
    width: 90,
    height: 90,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  clanName: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.text,
    textAlign: "center",
  },
  clanTag: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.green,
    marginTop: 4,
    marginBottom: 12,
  },
  clanDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
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
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.green,
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  warRecord: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  warStat: {
    alignItems: "center",
    minWidth: 50,
  },
  warStatValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  warStatLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  warBarContainer: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  warBar: {
    width: "100%",
    height: 8,
    backgroundColor: Colors.danger + "44",
    borderRadius: 4,
    overflow: "hidden",
  },
  warBarFill: {
    height: "100%",
    backgroundColor: Colors.green,
    borderRadius: 4,
  },
  winRateLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.textSecondary,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  memberRank: {
    width: 28,
    alignItems: "center",
  },
  memberRankText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.textMuted,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
  memberRole: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 1,
  },
  memberStats: {
    alignItems: "flex-end",
    gap: 2,
  },
  memberStatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  memberStatValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.text,
  },
  memberStatSmall: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.green,
  },
  moreMembers: {
    alignItems: "center",
    paddingVertical: 12,
  },
  moreMembersText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
  },
});
