import { Feather, Ionicons } from "@expo/vector-icons";
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

type LogEntry = {
  id: string;
  type: "search" | "win" | "loss" | "trophy";
  title: string;
  subtitle: string;
  time: string;
  iconName: "search" | "trophy" | "trending-up" | "trending-down";
  iconColor: string;
};

const MOCK_LOG: LogEntry[] = [
  {
    id: "1",
    type: "search",
    title: "Searched Alpha Wolves",
    subtitle: "#2GQUV08Q",
    time: "2m ago",
    iconName: "search",
    iconColor: Colors.textSecondary,
  },
  {
    id: "2",
    type: "trophy",
    title: "Clan war trophies updated",
    subtitle: "Alpha Wolves +1,200",
    time: "1h ago",
    iconName: "trophy",
    iconColor: Colors.gold,
  },
  {
    id: "3",
    type: "search",
    title: "Searched Royal Kings",
    subtitle: "#8L0PC999",
    time: "3h ago",
    iconName: "search",
    iconColor: Colors.textSecondary,
  },
  {
    id: "4",
    type: "win",
    title: "War season ended",
    subtitle: "Season 47 – 1st place",
    time: "1d ago",
    iconName: "trending-up",
    iconColor: Colors.green,
  },
  {
    id: "5",
    type: "loss",
    title: "War season ended",
    subtitle: "Season 46 – 3rd place",
    time: "2d ago",
    iconName: "trending-down",
    iconColor: Colors.danger,
  },
];

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Feather name="clock" size={22} color={Colors.green} />
        <Text style={styles.title}>ACTIVITY LOG</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24, paddingHorizontal: 20 }}
      >
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>

        {MOCK_LOG.map((entry, index) => (
          <View key={entry.id} style={styles.logRow}>
            {/* Timeline line */}
            <View style={styles.timeline}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: entry.iconColor + "44", borderColor: entry.iconColor + "88" },
                ]}
              >
                <Feather name={entry.iconName} size={14} color={entry.iconColor} />
              </View>
              {index < MOCK_LOG.length - 1 && <View style={styles.timelineLine} />}
            </View>

            {/* Content */}
            <View style={styles.logContent}>
              <View style={styles.logCard}>
                <View style={styles.logCardInner}>
                  <Text style={styles.logTitle}>{entry.title}</Text>
                  <Text style={styles.logSubtitle}>{entry.subtitle}</Text>
                </View>
                <Text style={styles.logTime}>{entry.time}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.emptyHint}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.emptyHintText}>
            Activity from your searches and clan stats will appear here.
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
    fontSize: 20,
    color: Colors.text,
    letterSpacing: 2,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.green,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  logRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 2,
  },
  timeline: {
    alignItems: "center",
    width: 36,
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: Colors.border,
    minHeight: 20,
    marginVertical: 4,
  },
  logContent: {
    flex: 1,
    paddingBottom: 12,
  },
  logCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "space-between",
    gap: 8,
  },
  logCardInner: {
    flex: 1,
  },
  logTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  logSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  logTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  emptyHintText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
});
