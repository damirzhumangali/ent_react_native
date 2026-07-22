import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Milestone {
  id: number;
  title: string;
  trophiesRequired: number;
  rewardType: "gold" | "gems" | "chest" | "league";
  rewardAmount: number;
  chestType?: string;
  iconName: any;
  leagueIcon?: string;
}

const milestonesList: Milestone[] = [
  { id: 1, title: "100 Золота", trophiesRequired: 100, rewardType: "gold", rewardAmount: 100, iconName: require("../../assets/images/shop_gold.png") },
  { id: 2, title: "10 Кристаллов", trophiesRequired: 200, rewardType: "gems", rewardAmount: 10, iconName: require("../../assets/images/shop_gem.png") },
  { id: 3, title: "Серебряная Лига", trophiesRequired: 300, rewardType: "league", rewardAmount: 0, iconName: "", leagueIcon: "🥈" },
  { id: 4, title: "Малый сундук", trophiesRequired: 450, rewardType: "chest", rewardAmount: 1, chestType: "chest_small", iconName: require("../../assets/images/shop_chest_small.png") },
  { id: 5, title: "200 Золота", trophiesRequired: 600, rewardType: "gold", rewardAmount: 200, iconName: require("../../assets/images/shop_gold.png") },
  { id: 6, title: "Золотая Лига", trophiesRequired: 800, rewardType: "league", rewardAmount: 0, iconName: "", leagueIcon: "🥇" },
  { id: 7, title: "Эпический сундук", trophiesRequired: 1000, rewardType: "chest", rewardAmount: 1, chestType: "chest_epic", iconName: require("../../assets/images/shop_chest_epic.png") },
  { id: 8, title: "25 Кристаллов", trophiesRequired: 1200, rewardType: "gems", rewardAmount: 25, iconName: require("../../assets/images/shop_gem.png") },
  { id: 9, title: "Чемпионская Лига", trophiesRequired: 1500, rewardType: "league", rewardAmount: 0, iconName: "", leagueIcon: "💎" },
  { id: 10, title: "Легендарный сундук", trophiesRequired: 1800, rewardType: "chest", rewardAmount: 1, chestType: "chest_legendary", iconName: require("../../assets/images/shop_chest_legendary.png") },
  { id: 11, title: "Кристальный сундук", trophiesRequired: 2000, rewardType: "chest", rewardAmount: 1, chestType: "chest_crystal", iconName: require("../../assets/images/shop_chest_crystal.png") },
];

export default function TrophyRoadScreen() {
  const router = useRouter();
  
  const userTrophies = useGameStore((state) => state.userTrophies);
  const claimedTrophyMilestones = useGameStore((state) => state.claimedTrophyMilestones);
  const claimTrophyMilestone = useGameStore((state) => state.claimTrophyMilestone);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIcon, setToastIcon] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const toastY = useRef(new Animated.Value(100)).current;

  // Active League calculator
  const getCurrentLeague = () => {
    if (userTrophies >= 1500) return { name: "Чемпионская Лига", icon: "💎" };
    if (userTrophies >= 800) return { name: "Золотая Лига", icon: "🥇" };
    if (userTrophies >= 300) return { name: "Серебряная Лига", icon: "🥈" };
    return { name: "Бронзовая Лига", icon: "🏆" };
  };

  const getNextLeagueThresholds = () => {
    if (userTrophies >= 1500) return { prev: 1500, next: 2000 };
    if (userTrophies >= 800) return { prev: 800, next: 1500 };
    if (userTrophies >= 300) return { prev: 300, next: 800 };
    return { prev: 0, next: 300 };
  };

  const { name: leagueName, icon: leagueIcon } = getCurrentLeague();
  const { prev: prevLeague, next: nextLeague } = getNextLeagueThresholds();

  // Progress computation
  const range = nextLeague - prevLeague;
  const relativeProgress = userTrophies - prevLeague;
  const progressRatio = Math.max(0, Math.min(1.0, relativeProgress / range));

  const isMilestoneClaimed = (id: number) => {
    return claimedTrophyMilestones.split(",").includes(String(id));
  };

  const triggerToast = (message: string, icon: any) => {
    setToastMessage(message);
    setToastIcon(icon);
    setShowToast(true);

    // Slide up toast
    Animated.spring(toastY, {
      toValue: 0,
      tension: 40,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Fade and slide down after delay
    setTimeout(() => {
      Animated.timing(toastY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowToast(false);
        setToastMessage(null);
        setToastIcon(null);
      });
    }, 2500);
  };

  const handleClaimReward = (m: Milestone) => {
    if (userTrophies < m.trophiesRequired || isMilestoneClaimed(m.id)) return;

    claimTrophyMilestone(m.id);

    // Toast message generation
    let msg = "";
    let icon = m.iconName;

    if (m.rewardType === "gold") {
      msg = `Получено: +${m.rewardAmount} Золота!`;
    } else if (m.rewardType === "gems") {
      msg = `Получено: +${m.rewardAmount} Кристаллов!`;
    } else if (m.rewardType === "chest") {
      if (m.chestType === "chest_small") {
        msg = "Получен Малый сундук! (+100 Золота, +2 Кристалла)";
      } else if (m.chestType === "chest_epic") {
        msg = "Получен Эпический сундук! (+300 Золота, +10 Кристаллов)";
      } else if (m.chestType === "chest_legendary") {
        msg = "Получен Легендарный сундук! (+500 Золота, +20 Кристаллов)";
      } else {
        msg = "Получен Кристальный сундук! (+1000 Золота, +50 Кристаллов)";
      }
    } else {
      msg = `Достигнута лига ${m.title}!`;
      icon = null;
    }

    triggerToast(msg, icon);
  };

  return (
    <View style={styles.container}>
      {/* 1. Background Theme */}
      <LinearGradient
        colors={["#045da9", "#0ea5e9"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#eb9f28" />
          <Text style={styles.backText}>Главная</Text>
        </Pressable>
        
        <Text style={styles.headerTitle}>ПУТЬ К СЛАВЕ</Text>
        <View style={{ width: 80 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title / League Card */}
        <View style={styles.leagueCard}>
          <Text style={styles.bigIcon}>{leagueIcon}</Text>
          <View style={styles.leagueInfo}>
            <Text style={styles.leagueName}>{leagueName}</Text>
            <Text style={styles.leagueDesc}>
              Набирайте кубки в боях, чтобы продвигаться по лигам и получать ценные награды.
            </Text>
          </View>
        </View>

        {/* Progress Bar Widget */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Ваш прогресс: {userTrophies} 🏆</Text>
            {userTrophies < 2000 ? (
              <Text style={styles.nextLeagueLabel}>
                До следующей лиги: {nextLeague - userTrophies} 🏆
              </Text>
            ) : (
              <Text style={styles.maxLeagueLabel}>Максимальный уровень лиги!</Text>
            )}
          </View>

          {/* Tube */}
          <View style={styles.tubeBackground}>
            <View style={[styles.tubeActive, { width: `${progressRatio * 100}%` }]}>
              <LinearGradient
                colors={["#eb9f28", "#60a5fa"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          </View>
        </View>

        {/* Milestones List */}
        <View style={styles.milestonesList}>
          {milestonesList.map((m) => {
            const isUnlocked = userTrophies >= m.trophiesRequired;
            const isClaimed = isMilestoneClaimed(m.id);
            const isLeague = m.rewardType === "league";

            return (
              <View
                key={m.id}
                style={[
                  styles.milestoneCard,
                  isUnlocked && !isClaimed && styles.milestoneCardUnlocked,
                ]}
              >
                {/* Left Badge */}
                <View style={styles.rewardBadge}>
                  {isLeague ? (
                    <Text style={styles.leagueIconText}>{m.leagueIcon}</Text>
                  ) : (
                    <Image
                      source={m.iconName}
                      style={[
                        styles.rewardIcon,
                        isClaimed && { opacity: 0.4 },
                      ]}
                    />
                  )}
                </View>

                {/* Center Title / Req */}
                <View style={styles.milestoneDetails}>
                  <Text
                    style={[
                      styles.milestoneTitle,
                      isClaimed && styles.textClaimed,
                    ]}
                  >
                    {m.title}
                  </Text>
                  <Text
                    style={[
                      styles.milestoneReq,
                      isUnlocked ? styles.reqUnlocked : styles.reqLocked,
                    ]}
                  >
                    Требуется: {m.trophiesRequired} 🏆
                  </Text>
                </View>

                {/* Right Action Button */}
                <View style={styles.actionContainer}>
                  {isClaimed ? (
                    <View style={styles.claimedBadge}>
                      <Text style={styles.claimedText}>Забрано</Text>
                      <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    </View>
                  ) : isUnlocked ? (
                    isLeague ? (
                      <View style={styles.unlockedBadge}>
                        <Text style={styles.unlockedText}>Достигнуто</Text>
                        <Ionicons name="star" size={12} color="#FFD700" />
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => handleClaimReward(m)}
                        style={styles.claimButton}
                      >
                        <Text style={styles.claimButtonText}>Забрать</Text>
                        <Ionicons name="gift" size={12} color="#FFFFFF" />
                      </Pressable>
                    )
                  ) : (
                    <View style={styles.lockedBadge}>
                      <Text style={styles.lockedText}>Закрыто</Text>
                      <Ionicons name="lock-closed" size={12} color="rgba(255, 255, 255, 0.3)" />
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Toast Notification */}
      {showToast && toastMessage && (
        <Animated.View style={[styles.toast, { transform: [{ translateY: toastY }] }]}>
          <View style={styles.toastContent}>
            {toastIcon ? (
              <Image source={toastIcon} style={styles.toastIcon} />
            ) : (
              <Ionicons name="star" size={24} color="#FFD700" />
            )}
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#045da9",
  },
  headerBar: {
    width: "100%",
    paddingTop: 50,
    height: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    width: 90,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#eb9f28",
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#eb9f28",
    letterSpacing: 1.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  leagueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(24, 30, 50, 0.4)",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginTop: 24,
    gap: 16,
  },
  bigIcon: {
    fontSize: 40,
    padding: 12,
    backgroundColor: "rgba(235, 159, 40, 0.12)",
    borderRadius: 36,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  leagueDesc: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 4,
    lineHeight: 16,
  },
  progressSection: {
    marginTop: 24,
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  nextLeagueLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  maxLeagueLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFD700",
  },
  tubeBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(24, 30, 50, 0.6)",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  tubeActive: {
    height: 8,
    borderRadius: 4,
  },
  milestonesList: {
    marginTop: 24,
    gap: 12,
  },
  milestoneCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(24, 30, 50, 0.45)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  milestoneCardUnlocked: {
    borderColor: "rgba(235, 159, 40, 0.4)",
  },
  rewardBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(10, 15, 30, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  leagueIconText: {
    fontSize: 26,
  },
  rewardIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  milestoneDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  textClaimed: {
    color: "rgba(255, 255, 255, 0.4)",
  },
  milestoneReq: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },
  reqUnlocked: {
    color: "#FFD700",
  },
  reqLocked: {
    color: "rgba(255, 255, 255, 0.4)",
  },
  actionContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  claimedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderRadius: 12,
  },
  claimedText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#10B981",
  },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 215, 0, 0.12)",
    borderRadius: 12,
  },
  unlockedText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFD700",
  },
  claimButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#eb9f28",
    borderRadius: 12,
    shadowColor: "#eb9f28",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  claimButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 12,
  },
  lockedText: {
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.3)",
  },
  toast: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: "center",
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "rgba(24, 30, 50, 0.95)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.18)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  toastIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  toastText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
