import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Hero avatars mapping to project assets
const avatarImages: { [key: string]: any } = {
  math: require("../../assets/images/math_avatar.png"),
  history: require("../../assets/images/history_avatar.png"),
  reading: require("../../assets/images/reading_avatar.png"),
  logic: require("../../assets/images/logic_avatar.png"),
  physics: require("../../assets/images/physics_avatar.png"),
  chemistry: require("../../assets/images/chemistry_avatar.png"),
  biology: require("../../assets/images/biology_avatar.png"),
  geography: require("../../assets/images/geography_avatar.png"),
  linguist: require("../../assets/images/language_avatar.png"),
};

export default function CharacterDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const heroId = (params.id as string) || "math";

  const appLanguage = useGameStore((state) => state.appLanguage);
  const gold = useGameStore((state) => state.userGold);
  const heroes = useGameStore((state) => state.heroes);
  const upgradeHero = useGameStore((state) => state.upgradeHero);

  const hero = heroes.find((h) => h.id === heroId) || heroes[0];
  const isUnlocked = !hero.isPremium;
  const currentLevel = hero.level || 1;
  const damage = hero.baseDamage + (currentLevel - 1) * 5;
  const costToUpgrade = currentLevel * 150;
  const canUpgrade = gold >= costToUpgrade;

  const handleUpgrade = () => {
    if (isUnlocked && canUpgrade) {
      upgradeHero(hero.id);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#045da9", "#0ea5e9"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Stardust particles */}
      <View style={styles.stardustContainer}>
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.stardust,
              {
                left: Math.random() * SCREEN_WIDTH,
                top: Math.random() * 600,
                opacity: Math.random() * 0.15 + 0.05,
              },
            ]}
          />
        ))}
      </View>

      {/* Header Bar */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#181E32" />
        </Pressable>

        <Text style={styles.titleText}>{hero.name.toUpperCase()}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Large Character Portrait Card */}
        <View style={styles.portraitCard}>
          <Image
            source={avatarImages[hero.id]}
            style={styles.portraitImage}
            resizeMode="cover"
          />
          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={48} color="#FFFFFF" />
              <Text style={styles.lockText}>
                {appLanguage === "kk" ? "ҚҰЛЫПТАУЛЫ" : "ЗАБЛОКИРОВАН"}
              </Text>
            </View>
          )}
        </View>

        {/* Stats & Info Card */}
        <View style={styles.statsCard}>
          <View style={styles.nameRow}>
            <View>
              <Text style={styles.cardHeroName}>{hero.name}</Text>
              <Text style={styles.cardSubjectName}>{hero.subject}</Text>
            </View>

            {isUnlocked ? (
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>
                  {appLanguage === "kk" ? `${currentLevel} деңгей` : `${currentLevel} уровень`}
                </Text>
              </View>
            ) : (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedBadgeText}>
                  {appLanguage === "kk" ? "ҚҰЛЫПТАУЛЫ" : "ЗАБЛОКИРОВАН"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Model Stats */}
          <View style={styles.statsMetricsRow}>
            <View style={styles.metricColumn}>
              <Text style={styles.metricLabel}>⚔️ СИЛА АТАКИ</Text>
              <Text style={styles.metricValue}>{damage}</Text>
            </View>

            <View style={styles.metricColumn}>
              <Text style={styles.metricLabel}>🔋 ЗАРЯД СПОСОБНОСТИ</Text>
              <Text style={[styles.metricValue, { color: "#30D158" }]}>100%</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Ability Info */}
          <View style={styles.abilitySection}>
            <Text style={styles.abilityHeader}>ОСОБАЯ СПОСОБНОСТЬ:</Text>
            <Text style={styles.abilityTitle}>{hero.ability.name}</Text>
            <Text style={styles.abilityDesc}>{hero.ability.description}</Text>
          </View>

          {/* Action Upgrade Button */}
          {isUnlocked && (
            <Pressable
              disabled={!canUpgrade}
              onPress={handleUpgrade}
              style={({ pressed }) => [
                styles.upgradeButton,
                !canUpgrade && styles.upgradeButtonDisabled,
                pressed && canUpgrade && styles.upgradeButtonPressed,
              ]}
            >
              <Image
                source={require("../../assets/images/shop_gold.png")}
                style={styles.goldIcon}
                resizeMode="contain"
              />
              <Text style={[styles.upgradeText, !canUpgrade && styles.upgradeTextDisabled]}>
                {appLanguage === "kk"
                  ? `${costToUpgrade} Алтынға жақсарту`
                  : `Улучшить за ${costToUpgrade}`}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#045da9",
  },
  stardustContainer: {
    ...StyleSheet.absoluteFill,
    pointerEvents: "none",
  },
  stardust: {
    position: "absolute",
    width: 2,
    height: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
  header: {
    height: 100,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: "center",
  },
  portraitCard: {
    width: SCREEN_WIDTH - 40,
    height: 360,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    position: "relative",
    marginTop: 10,
    marginBottom: 20,
  },
  portraitImage: {
    width: "100%",
    height: "100%",
  },
  lockOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 10,
    letterSpacing: 1.5,
  },
  statsCard: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: "#045da9",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.18)",
    shadowColor: "#0f325a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeroName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  cardSubjectName: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  levelBadgeText: {
    color: "#FFD700",
    fontSize: 13,
    fontWeight: "900",
  },
  lockedBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  lockedBadgeText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11,
    fontWeight: "900",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    marginVertical: 14,
  },
  statsMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricColumn: {
    flex: 1,
  },
  metricLabel: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  metricValue: {
    color: "#FF9F0A",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
  },
  abilitySection: {
    marginBottom: 16,
  },
  abilityHeader: {
    color: "#FFD700",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  abilityTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },
  abilityDesc: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 2,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginTop: 10,
  },
  upgradeButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  upgradeButtonPressed: {
    opacity: 0.9,
  },
  goldIcon: {
    width: 18,
    height: 18,
  },
  upgradeText: {
    color: "#181E32",
    fontSize: 15,
    fontWeight: "bold",
  },
  upgradeTextDisabled: {
    color: "rgba(24, 30, 50, 0.5)",
  },
});
