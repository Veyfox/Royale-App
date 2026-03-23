import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import Colors from "@/constants/colors";
import { useClanSearch, RecentClan } from "@/contexts/ClanSearchContext";

function ClanBadge({ color, size = 44 }: { color: string; size?: number }) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, backgroundColor: color + "33", borderColor: color + "66" },
      ]}
    >
      <Ionicons name="shield" size={size * 0.55} color={color} />
    </View>
  );
}

function formatTrophies(score: number): string {
  if (score >= 1000) return (score / 1000).toFixed(1) + "k";
  return score.toString();
}

function RecentClanCard({
  clan,
  onPress,
  onRemove,
}: {
  clan: RecentClan;
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.clanCard, pressed && styles.clanCardPressed]}
    >
      <ClanBadge color={clan.badgeColor ?? "#4A7DCA"} size={50} />
      <View style={styles.clanInfo}>
        <View style={styles.clanNameRow}>
          {clan.isPro && (
            <View style={styles.proBadge}>
              <Text style={styles.proText}>PRO</Text>
            </View>
          )}
          <Text style={styles.clanName}>{clan.name}</Text>
        </View>
        <Text style={styles.clanTag}>
          {clan.tag} • {clan.members}/{clan.maxMembers}
        </Text>
        <Text style={styles.membersLabel}>Members</Text>
      </View>
      <View style={styles.clanStats}>
        <View style={styles.trophyRow}>
          <Ionicons name="trophy" size={14} color={Colors.green} />
          <Text style={styles.trophyCount}>{formatTrophies(clan.clanScore)}</Text>
        </View>
        <Text style={styles.trophiesLabel}>TROPHIES</Text>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        hitSlop={8}
        style={styles.removeBtn}
      >
        <Feather name="x" size={14} color={Colors.textMuted} />
      </Pressable>
    </Pressable>
  );
}

export default function ClanScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { recentSearches, clearRecentSearches, removeRecentSearch } = useClanSearch();

  const handleSearch = () => {
    const tag = query.trim().replace(/^#/, "");
    if (!tag) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/clan/[tag]", params: { tag: `#${tag.toUpperCase()}` } });
  };

  const handleRecentPress = (clan: RecentClan) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/clan/[tag]", params: { tag: clan.tag } });
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearRecentSearches();
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trophy" size={22} color={Colors.green} />
          <Text style={styles.appName}>ROYAL STATS</Text>
        </View>
        <View style={styles.avatarBtn}>
          <Ionicons name="person" size={20} color={Colors.green} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>FIND YOUR{"\n"}CLAN</Text>
          <Text style={styles.heroSubtitle}>
            Enter the unique clan tag to see stats
          </Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchSection}>
          <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
            <Text style={styles.hashPrefix}>#</Text>
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder="CLAN TAG"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              autoCapitalize="characters"
              autoCorrect={false}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <Feather name="x-circle" size={18} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={handleSearch}
            style={({ pressed }) => [
              styles.searchBtn,
              pressed && styles.searchBtnPressed,
            ]}
          >
            <Feather name="search" size={20} color="#000" />
            <Text style={styles.searchBtnText}>SEARCH CLAN</Text>
          </Pressable>
        </View>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>RECENT SEARCHES</Text>
              <TouchableOpacity onPress={handleClear}>
                <Text style={styles.clearAll}>CLEAR ALL</Text>
              </TouchableOpacity>
            </View>

            {recentSearches.map((clan) => (
              <RecentClanCard
                key={clan.tag}
                clan={clan}
                onPress={() => handleRecentPress(clan)}
                onRemove={() => removeRecentSearch(clan.tag)}
              />
            ))}
          </View>
        )}

        {/* Search Tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={24} color={Colors.green} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>SEARCH TIP</Text>
            <Text style={styles.tipText}>
              Ensure the tag starts with{" "}
              <Text style={styles.tipBold}>#</Text> and double-check for the
              number <Text style={styles.tipBold}>0</Text> vs the letter{" "}
              <Text style={styles.tipBold}>O</Text>.
            </Text>
          </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.green,
    letterSpacing: 1.5,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.green + "44",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 48,
    color: Colors.text,
    lineHeight: 54,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 12,
    lineHeight: 22,
  },
  searchSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  inputWrapperFocused: {
    borderColor: Colors.green + "88",
  },
  hashPrefix: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.green,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
    letterSpacing: 1,
    padding: 0,
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  searchBtnPressed: {
    backgroundColor: Colors.greenDim,
    transform: [{ scale: 0.98 }],
  },
  searchBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#000",
    letterSpacing: 1,
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  recentTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.green,
    letterSpacing: 1.5,
  },
  clearAll: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  clanCard: {
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
  clanCardPressed: {
    backgroundColor: Colors.surface2,
  },
  badge: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  clanInfo: {
    flex: 1,
  },
  clanNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  proBadge: {
    backgroundColor: Colors.green + "22",
    borderWidth: 1,
    borderColor: Colors.green + "66",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  proText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    color: Colors.green,
    letterSpacing: 0.5,
  },
  clanName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  clanTag: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  membersLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.green,
    marginTop: 1,
  },
  clanStats: {
    alignItems: "flex-end",
  },
  trophyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trophyCount: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  trophiesLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  removeBtn: {
    padding: 4,
  },
  tipCard: {
    flexDirection: "row",
    margin: 20,
    marginTop: 24,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.green + "33",
    gap: 14,
    alignItems: "flex-start",
  },
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.green + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.green,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  tipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tipBold: {
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
});
