import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

export default function CharactersScreen() {
  const router = useRouter();
  const appLanguage = useGameStore((state) => state.appLanguage);
  const gold = useGameStore((state) => state.userGold);
  const gems = useGameStore((state) => state.userGems);
  const heroes = useGameStore((state) => state.heroes);
  const upgradeHero = useGameStore((state) => state.upgradeHero);

  const getHeaderTitle = () => {
    return appLanguage === "kk" ? "КЕЙІПКЕРЛЕР" : "ПЕРСОНАЖИ";
  };

  const getSectionTitle = () => {
    return appLanguage === "kk" ? "СІЗДІҢ ЕНТ БАТЫРЛАРЫҢЫЗ" : "ВАШИ ГЕРОИ ЕНТ";
  };

  const handleHeroPress = (heroId: string) => {
    router.push({
      pathname: "/character-detail" as any,
      params: { id: heroId }
    } as any);
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

        <Text style={styles.titleText}>{getHeaderTitle()}</Text>

        <View style={styles.badgesRow}>
          {/* Gold Badge */}
          <Pressable onPress={() => router.push("/shop" as any)} style={styles.badge}>
            <Image
              source={require("../../assets/images/shop_gold.png")}
              style={styles.badgeIcon}
              resizeMode="contain"
            />
            <Text style={styles.badgeText}>{gold}</Text>
          </Pressable>

          {/* Gem Badge */}
          <Pressable onPress={() => router.push("/shop" as any)} style={styles.badge}>
            <Image
              source={require("../../assets/images/shop_gem.png")}
              style={styles.badgeIcon}
              resizeMode="contain"
            />
            <Text style={styles.badgeText}>{gems}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{getSectionTitle()}</Text>

        <View style={styles.listContainer}>
          {heroes.map((hero) => {
            const isUnlocked = !hero.isPremium; // premium flag in store indicates locked state
            const currentLevel = hero.level || 1;
            const damage = hero.baseDamage + (currentLevel - 1) * 5;
            const costToUpgrade = currentLevel * 150;
            const canUpgrade = gold >= costToUpgrade;

            return (
              <Pressable
                key={hero.id}
                onPress={() => handleHeroPress(hero.id)}
                style={styles.card}
              >
                <View style={styles.cardRow}>
                  {/* Hero Avatar Image */}
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={avatarImages[hero.id]}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                    {!isUnlocked && (
                      <View style={styles.lockOverlay}>
                        <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
                      </View>
                    )}
                  </View>

                  {/* Character Info */}
                  <View style={styles.infoWrapper}>
                    <View style={styles.nameRow}>
                      <Text style={styles.heroName}>{hero.name}</Text>
                      {hero.isPremium && (
                        <View style={styles.premiumTag}>
                          <Text style={styles.premiumTagText}>PREMIUM</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.subjectText}>
                      {hero.subject}
                    </Text>

                    {isUnlocked ? (
                      <View style={styles.statsRow}>
                        <Text style={styles.levelText}>
                          {appLanguage === "kk" ? `${currentLevel} деңгей` : `${currentLevel} уровень`}
                        </Text>
                        <Text style={styles.statDetail}>
                          ⚔️ {damage}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.lockedLabel}>
                        {appLanguage === "kk" ? "ҚҰЛЫПТАУЛЫ" : "ЗАБЛОКИРОВАН"}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Upgrade Button */}
                {isUnlocked && (
                  <View style={styles.upgradeSection}>
                    <Pressable
                      disabled={!canUpgrade}
                      onPress={(e) => {
                        e.stopPropagation();
                        upgradeHero(hero.id);
                      }}
                      style={[
                        styles.upgradeButton,
                        !canUpgrade && styles.upgradeButtonDisabled
                      ]}
                    >
                      <Image
                        source={require("../../assets/images/shop_gold.png")}
                        style={styles.upgradeGoldIcon}
                        resizeMode="contain"
                      />
                      <Text style={[styles.upgradeText, !canUpgrade && styles.upgradeTextDisabled]}>
                        {appLanguage === "kk"
                          ? `${costToUpgrade} Алтынға жақсарту`
                          : `Улучшить за ${costToUpgrade}`}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </Pressable>
            );
          })}
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
  badgesRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    shadowColor: "#0f325a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  badgeIcon: {
    width: 14,
    height: 14,
  },
  badgeText: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "bold",
    color: "#181E32",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    backgroundColor: "#045da9",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.18)",
    shadowColor: "#0f325a",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  cardRow: {
    flexDirection: "row",
    gap: 14,
  },
  avatarWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  lockOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  premiumTag: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumTagText: {
    color: "#181E32",
    fontSize: 8,
    fontWeight: "900",
  },
  subjectText: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  levelText: {
    color: "#FFD700",
    fontSize: 13,
    fontWeight: "900",
  },
  statDetail: {
    color: "#FF9F0A",
    fontSize: 13,
    fontWeight: "900",
  },
  lockedLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },
  upgradeSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingTop: 12,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  upgradeButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  upgradeGoldIcon: {
    width: 16,
    height: 16,
  },
  upgradeText: {
    color: "#181E32",
    fontSize: 14,
    fontWeight: "bold",
  },
  upgradeTextDisabled: {
    color: "rgba(24, 30, 50, 0.5)",
  },
});
