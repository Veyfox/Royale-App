import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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

const SEARCH_CATEGORIES = [
  { id: "clan", label: "Clan", icon: "people" as const, route: "/clan/" },
  { id: "player", label: "Player", icon: "person" as const, route: "/player/" },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("clan");
  const [isFocused, setIsFocused] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSearch = () => {
    const tag = query.trim().replace(/^#/, "");
    if (!tag) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (category === "clan") {
      router.push({ pathname: "/clan/[tag]", params: { tag: `#${tag.toUpperCase()}` } });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
      >
        {/* Category Selector */}
        <View style={styles.categoryRow}>
          {SEARCH_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setCategory(cat.id)}
              style={[
                styles.categoryBtn,
                category === cat.id && styles.categoryBtnActive,
              ]}
            >
              <Ionicons
                name={cat.icon}
                size={18}
                color={category === cat.id ? Colors.green : Colors.textMuted}
              />
              <Text
                style={[
                  styles.categoryLabel,
                  category === cat.id && styles.categoryLabelActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Search Input */}
        <View style={styles.searchSection}>
          <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
            <Text style={styles.hashPrefix}>#</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={category === "clan" ? "CLAN TAG" : "PLAYER TAG"}
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
            <Text style={styles.searchBtnText}>SEARCH</Text>
          </Pressable>
        </View>

        {/* Tips */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="information-circle" size={24} color={Colors.green} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>HOW TO FIND YOUR TAG</Text>
            <Text style={styles.tipText}>
              Open Clash Royale → Profile → tap your tag to copy it. Tags always start with{" "}
              <Text style={styles.tipBold}>#</Text>.
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
  },
  categoryRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBtnActive: {
    backgroundColor: Colors.green + "22",
    borderColor: Colors.green + "66",
  },
  categoryLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.textMuted,
  },
  categoryLabelActive: {
    color: Colors.green,
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
  tipCard: {
    flexDirection: "row",
    margin: 20,
    marginTop: 28,
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
