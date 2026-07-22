import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView, TextInput, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";
import MenuArenaSceneView from "@/components/MenuArenaSceneView";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Helper to resolve avatar source statically for Metro
export const getAvatarSource = (avatar: string) => {
  switch (avatar) {
    case "math_avatar": return require("../../assets/images/math_avatar.png");
    case "physics_avatar": return require("../../assets/images/physics_avatar.png");
    case "chemistry_avatar": return require("../../assets/images/chemistry_avatar.png");
    case "biology_avatar": return require("../../assets/images/biology_avatar.png");
    case "history_avatar": return require("../../assets/images/history_avatar.png");
    case "geography_avatar": return require("../../assets/images/geography_avatar.png");
    case "reading_avatar": return require("../../assets/images/reading_avatar.png");
    case "logic_avatar": return require("../../assets/images/logic_avatar.png");
    case "language_avatar": return require("../../assets/images/language_avatar.png");
    default: return require("../../assets/images/math_avatar.png");
  }
};

const avatarList = [
  "math_avatar", "physics_avatar", "chemistry_avatar",
  "biology_avatar", "history_avatar", "geography_avatar",
  "reading_avatar", "logic_avatar", "language_avatar"
];

const profileOptions = [
  "Физика-Математика (Физмат)",
  "Химия-Биология (Химбио)",
  "История-География",
  "Математика-География",
  "Математика-Информатика (Мат-Инфо)",
  "Казахский язык-Литература"
];

const classOptions = [
  "6 класс", "7 класс", "8 класс", "9 класс", "10 класс", "11 класс"
];

const wallpapers = [
  { id: "battle",  name: "Битва героев",  colors: ["#0a0f1e", "#400c2a"] },
  { id: "cosmic",  name: "Космический",   colors: ["#070c18", "#111c30"] },
  { id: "neon",    name: "Неоновый",      colors: ["#200838", "#941966"] },
  { id: "emerald", name: "Изумрудный",    colors: ["#051919", "#0f4b37"] },
  { id: "volcano", name: "Вулканический", colors: ["#181818", "#5a0a0a"] }
];

export default function MenuScreen() {
  const router = useRouter();

  // Zustand Store values
  const username = useGameStore((state) => state.username);
  const setUsername = useGameStore((state) => state.setUsername);
  const selectedAvatar = useGameStore((state) => state.selectedAvatar);
  const setSelectedAvatar = useGameStore((state) => state.setSelectedAvatar);
  const userProfile = useGameStore((state) => state.userProfile);
  const setUserProfile = useGameStore((state) => state.setUserProfile);
  const userClass = useGameStore((state) => state.userClass);
  const setUserClass = useGameStore((state) => state.setUserClass);
  const selectedWallpaper = useGameStore((state) => state.selectedWallpaper);
  const setSelectedWallpaper = useGameStore((state) => state.setSelectedWallpaper);
  const appLanguage = useGameStore((state) => state.appLanguage);
  const setAppLanguage = useGameStore((state) => state.setAppLanguage);
  const userGold = useGameStore((state) => state.userGold);
  const userGems = useGameStore((state) => state.userGems);
  const userTrophies = useGameStore((state) => state.userTrophies);

  // Modal sheets presentation state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPlayModeSelection, setShowPlayModeSelection] = useState(false);

  // Calculate current League properties
  const getCurrentLeague = () => {
    if (userTrophies >= 1500) {
      return { name: appLanguage === "kk" ? "Чемпиондар лигасы" : "Чемпионская Лига", icon: "💎" };
    }
    if (userTrophies >= 800) {
      return { name: appLanguage === "kk" ? "Алтын лига" : "Золотая Лига", icon: "🥇" };
    }
    if (userTrophies >= 300) {
      return { name: appLanguage === "kk" ? "Күміс лига" : "Серебряная Лига", icon: "🥈" };
    }
    return { name: appLanguage === "kk" ? "Қола лига" : "Бронзовая Лига", icon: "🏆" };
  };

  const currentLeague = getCurrentLeague();

  // Load wallpaper color arrays dynamically
  const getWallpaperColors = () => {
    const w = wallpapers.find((item) => item.id === selectedWallpaper);
    return (w ? w.colors : ["#0a0f1e", "#111c30"]) as [string, string];
  };

  return (
    <View style={styles.container}>
      {/* 1. Dynamic Wallpaper Gradient */}
      <LinearGradient
        colors={getWallpaperColors()}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Menu Arena Scene View (HTML5 Canvas inside WebView) */}
      <MenuArenaSceneView wallpaperId={selectedWallpaper} />

      {/* 3. Top Header Status Bar */}
      <View style={styles.topBar}>
        {/* Level Box */}
        <View style={styles.headerInfoBox}>
          <Ionicons name="trophy" size={14} color="#FFFFFF" />
          <Text style={styles.headerInfoText}>
            Ур. {Math.max(1, Math.floor(userTrophies / 100))}
          </Text>
        </View>

        {/* Gold Box */}
        <Pressable onPress={() => router.push("/shop" as any)} style={styles.headerInfoBox}>
          <Image source={require("../../assets/images/shop_gold.png")} style={styles.currencyIcon} />
          <Text style={styles.headerInfoText}>{userGold}</Text>
        </Pressable>

        {/* Gem Box */}
        <Pressable onPress={() => router.push("/shop" as any)} style={styles.headerInfoBox}>
          <Image source={require("../../assets/images/shop_gem.png")} style={styles.currencyIcon} />
          <Text style={styles.headerInfoText}>{userGems}</Text>
        </Pressable>

        <Spacer />

        {/* Avatar Trigger Button */}
        <Pressable onPress={() => setShowProfileModal(true)} style={styles.avatarButton}>
          <Image source={getAvatarSource(selectedAvatar)} style={styles.avatarImg} />
        </Pressable>
      </View>

      {/* Arisaka.ai Brand Badge */}
      <View style={styles.brandBadgeContainer}>
        <View style={styles.brandBadge}>
          <Ionicons name="sparkles" size={14} color="#38BDF8" />
          <Text style={styles.brandTitle}>Arisaka</Text>
          <Text style={styles.brandAi}>.ai</Text>
          <View style={styles.brandEntTag}>
            <Text style={styles.brandEntText}>ENT</Text>
          </View>
        </View>
      </View>

      {/* 4. Center-Bottom Dashboard Panels */}
      <View style={styles.dashboard}>
        {/* Trophy Road Widget */}
        <Pressable onPress={() => router.push("/trophy-road" as any)} style={styles.trophyRoadWidget}>
          <View style={styles.trophyHeader}>
            <Text style={styles.leagueText}>
              {currentLeague.icon} {currentLeague.name}
            </Text>
            <Text style={styles.trophiesText}>🏆 {userTrophies}</Text>
          </View>

          {/* Progress bar tube */}
          <View style={styles.trophyTubeBack}>
            <View
              style={[
                styles.trophyTubeActive,
                { width: `${Math.min(100, (userTrophies / 2000) * 100)}%` },
              ]}
            >
              <LinearGradient
                colors={["#FFD700", "#FF8C00"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          </View>

          {/* League Steps Markers */}
          <View style={styles.leagueSteps}>
            <Text style={styles.stepText}>0</Text>
            <Text style={styles.stepText}>300 🥈</Text>
            <Text style={styles.stepText}>800 🥇</Text>
            <Text style={styles.stepText}>1500 💎</Text>
            <Text style={styles.stepText}>2000+</Text>
          </View>
        </Pressable>

        {/* Big "Play" Button with 3D Shadow */}
        <Pressable onPress={() => setShowPlayModeSelection(true)} style={styles.playButtonWrapper}>
          {/* 3D bottom shadow block */}
          <View style={styles.playButton3dShadow} />
          <View style={styles.playButtonInner}>
            <LinearGradient
              colors={["#297DFF", "#1767FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Top Gloss Reflection */}
            <LinearGradient
              colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0.0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.playButtonGloss}
            />
            <Text style={styles.playButtonText}>
              {appLanguage === "kk" ? "Ойнау" : "Играть"}
            </Text>
          </View>
        </Pressable>

        {/* Bottom Navigation Dock Menu */}
        <View style={styles.dock}>
          <Pressable onPress={() => router.push("/shop" as any)} style={styles.dockItem}>
            <Ionicons name="bag" size={22} color="#FFFFFF" />
            <Text style={styles.dockText}>{appLanguage === "kk" ? "Дүкен" : "Магазин"}</Text>
          </Pressable>

          <View style={styles.dockDivider} />

          <Pressable onPress={() => router.push("/characters" as any)} style={styles.dockItem}>
            <Ionicons name="people" size={22} color="#FFFFFF" />
            <Text style={styles.dockText}>{appLanguage === "kk" ? "Кейіпкерлер" : "Персонажи"}</Text>
          </Pressable>

          <View style={styles.dockDivider} />

          <Pressable onPress={() => router.push("/themes" as any)} style={styles.dockItem}>
            <Ionicons name="briefcase" size={22} color="#FFFFFF" />
            <Text style={styles.dockText}>{appLanguage === "kk" ? "Пәндер" : "Предметы"}</Text>
          </Pressable>

          <View style={styles.dockDivider} />

          <Pressable onPress={() => alert("Клан скоро откроется!")} style={styles.dockItem}>
            <Ionicons name="shield" size={22} color="#FFFFFF" />
            <Text style={styles.dockText}>Клан</Text>
          </Pressable>
        </View>
      </View>

      {/* 5. PLAY MODE SELECTION MODAL */}
      {showPlayModeSelection && (
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowPlayModeSelection(false)} />
          
          <View style={styles.modeCard}>
            <View style={styles.modeHeader}>
              <Text style={styles.modeTitle}>
                {appLanguage === "kk" ? "Ойын режимін таңдаңыз" : "Выберите режим игры"}
              </Text>
              <Pressable onPress={() => setShowPlayModeSelection(false)} style={styles.closeRoundButton}>
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Solo Offline Mode */}
            <Pressable
              onPress={() => {
                setShowPlayModeSelection(false);
                router.push("/themes" as any);
              }}
              style={styles.modeButton}
            >
              <View style={[styles.modeCircle, { backgroundColor: "rgba(33, 150, 243, 0.15)" }]}>
                <Ionicons name="person" size={20} color="#2196F3" />
              </View>
              <View style={styles.modeDetails}>
                <Text style={styles.modeBtnName}>
                  {appLanguage === "kk" ? "Жалғыз ойын (Офлайн)" : "Одиночный режим (Офлайн)"}
                </Text>
                <Text style={styles.modeBtnDesc}>
                  {appLanguage === "kk" ? "2D платформалық кезеңді жалғыз өту" : "Одиночное прохождение 2D платформера"}
                </Text>
              </View>
            </Pressable>

            {/* Cooperative Multiplayer Mode */}
            <Pressable
              onPress={() => {
                setShowPlayModeSelection(false);
                router.push("/coop" as any);
              }}
              style={styles.modeButton}
            >
              <View style={[styles.modeCircle, { backgroundColor: "rgba(23, 163, 152, 0.15)" }]}>
                <Ionicons name="people" size={20} color="#17A398" />
              </View>
              <View style={styles.modeDetails}>
                <Text style={styles.modeBtnName}>
                  {appLanguage === "kk" ? "Бірлескен ойын (Онлайн)" : "Совместная игра (Онлайн)"}
                </Text>
                <Text style={styles.modeBtnDesc}>
                  {appLanguage === "kk" ? "Деңгейді басқа ойыншылармен бірге өту" : "Совместное прохождение уровня по сети"}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      )}

      {/* 6. USER PROFILE MODAL */}
      {showProfileModal && (
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowProfileModal(false)} />
          
          <View style={styles.profileModal}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileTitle}>ПРОФИЛЬ УЧЕНИКА</Text>
              <Pressable onPress={() => setShowProfileModal(false)}>
                <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.6)" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.profileModalScroll} showsVerticalScrollIndicator={false}>
              {/* Avatar + TextInput */}
              <View style={styles.profileAvatarSection}>
                <View style={styles.bigAvatarFrame}>
                  <Image source={getAvatarSource(selectedAvatar)} style={styles.bigAvatarImg} />
                </View>
                <TextInput
                  style={styles.usernameInput}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Имя пользователя"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </View>

              {/* Avatar Chooser Row */}
              <View style={styles.selectorSection}>
                <Text style={styles.sectionHeading}>ВЫБОР АВАТАРА</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarScroll}>
                  {avatarList.map((avatar) => {
                    const isSel = selectedAvatar === avatar;
                    return (
                      <Pressable
                        key={avatar}
                        onPress={() => setSelectedAvatar(avatar)}
                        style={[styles.avatarThumbFrame, isSel && styles.avatarThumbSelected]}
                      >
                        <Image source={getAvatarSource(avatar)} style={styles.avatarThumb} />
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Direction Picker Section */}
              <View style={styles.selectorSection}>
                <Text style={styles.sectionHeading}>ВЫБОР НАПРАВЛЕНИЯ (ЕНТ)</Text>
                <View style={styles.profileOptionsList}>
                  {profileOptions.map((option) => {
                    const isSel = userProfile === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setUserProfile(option)}
                        style={[styles.optionRow, isSel && styles.optionRowSelected]}
                      >
                        <Text style={styles.optionRowText}>{option}</Text>
                        <Ionicons
                          name={isSel ? "checkmark-circle" : "ellipse-outline"}
                          size={18}
                          color={isSel ? "#eb9f28" : "rgba(255,255,255,0.3)"}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Class Selection Section */}
              <View style={styles.selectorSection}>
                <Text style={styles.sectionHeading}>КЛАСС ОБУЧЕНИЯ</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classScroll}>
                  {classOptions.map((cls) => {
                    const isSel = userClass === cls;
                    return (
                      <Pressable
                        key={cls}
                        onPress={() => setUserClass(cls)}
                        style={[styles.classChip, isSel && styles.classChipSelected]}
                      >
                        <Text style={[styles.classChipText, isSel && styles.classChipTextSelected]}>{cls}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Wallpaper Picker Section */}
              <View style={styles.selectorSection}>
                <Text style={styles.sectionHeading}>ОБОИ АРЕНЫ</Text>
                <View style={styles.wallpaperOptionsList}>
                  {wallpapers.map((w) => {
                    const isSel = selectedWallpaper === w.id;
                    return (
                      <Pressable
                        key={w.id}
                        onPress={() => setSelectedWallpaper(w.id)}
                        style={[styles.wallpaperRow, isSel && styles.wallpaperRowSelected]}
                      >
                        <LinearGradient
                          colors={w.colors as [string, string]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.wallpaperPreview}
                        />
                        <Text style={styles.wallpaperRowText}>{w.name}</Text>
                        <Ionicons
                          name={isSel ? "checkmark-circle" : "ellipse-outline"}
                          size={18}
                          color={isSel ? "#eb9f28" : "rgba(255,255,255,0.3)"}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

// Simple spacer component helper
const Spacer = () => <View style={{ flex: 1 }} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1e",
  },
  arenaScene: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  cloud: {
    position: "absolute",
  },
  spark: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  castleContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  castleEmoji: {
    fontSize: 110,
    textShadowColor: "rgba(235, 159, 40, 0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    zIndex: 2,
  },
  castleGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(235, 159, 40, 0.08)",
    zIndex: 1,
  },
  groundGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    zIndex: 10,
  },
  headerInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.20)",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  headerInfoText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  currencyIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  dashboard: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    gap: 16,
    zIndex: 10,
  },
  trophyRoadWidget: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.20)",
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  trophyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leagueText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  trophiesText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFD700",
  },
  trophyTubeBack: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginTop: 10,
    overflow: "hidden",
  },
  trophyTubeActive: {
    height: 8,
    borderRadius: 4,
  },
  leagueSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  stepText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.7)",
  },
  playButtonWrapper: {
    width: "100%",
    height: 56,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton3dShadow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 52,
    backgroundColor: "#105BC6",
    borderRadius: 26,
  },
  playButtonInner: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.35)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    bottom: 4,
  },
  playButtonGloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 22,
  },
  playButtonText: {
    fontSize: 19,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.2,
    fontFamily: "System",
  },
  dock: {
    flexDirection: "row",
    backgroundColor: "rgba(20, 24, 38, 0.75)",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.20)",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "space-evenly",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  dockItem: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  dockText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  dockDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modeCard: {
    width: SCREEN_WIDTH - 56,
    backgroundColor: "#0E1726",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 24,
    gap: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modeTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeRoundButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 18,
    padding: 16,
    gap: 16,
  },
  modeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  modeDetails: {
    flex: 1,
  },
  modeBtnName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  modeBtnDesc: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
  },
  profileModal: {
    width: SCREEN_WIDTH - 40,
    maxHeight: SCREEN_HEIGHT - 120,
    backgroundColor: "#0E1726",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  profileModalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileAvatarSection: {
    alignItems: "center",
    marginVertical: 20,
    gap: 14,
  },
  bigAvatarFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#eb9f28",
    shadowColor: "#eb9f28",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  bigAvatarImg: {
    width: "100%",
    height: "100%",
  },
  usernameInput: {
    width: "80%",
    height: 44,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  selectorSection: {
    marginTop: 20,
    gap: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1,
    marginBottom: 4,
  },
  avatarScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  avatarThumbFrame: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  avatarThumbSelected: {
    borderColor: "#eb9f28",
  },
  avatarThumb: {
    width: "100%",
    height: "100%",
  },
  profileOptionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionRowSelected: {
    backgroundColor: "rgba(235, 159, 40, 0.12)",
    borderColor: "rgba(235, 159, 40, 0.4)",
  },
  optionRowText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  classScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  classChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  classChipSelected: {
    backgroundColor: "#eb9f28",
    borderColor: "transparent",
  },
  classChipText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.6)",
  },
  classChipTextSelected: {
    color: "#FFFFFF",
  },
  wallpaperOptionsList: {
    gap: 8,
  },
  wallpaperRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },
  wallpaperRowSelected: {
    backgroundColor: "rgba(235, 159, 40, 0.12)",
    borderColor: "rgba(235, 159, 40, 0.4)",
  },
  wallpaperPreview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  wallpaperRowText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  brandBadgeContainer: {
    alignItems: "center",
    marginTop: 8,
    zIndex: 10,
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "rgba(56, 189, 248, 0.4)",
    gap: 5,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  brandAi: {
    fontSize: 17,
    fontWeight: "900",
    color: "#38BDF8",
  },
  brandEntTag: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  brandEntText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});
