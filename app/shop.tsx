import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ShopChestItem {
  id: string;
  nameRu: string;
  nameKk: string;
  descRu: string;
  descKk: string;
  cost: number;
  currency: "gold" | "gem";
  iconSource: any;
  rarityColors: [string, string];
  trophyRequired: number;
}

const chestsConfig: ShopChestItem[] = [
  {
    id: "chest_small",
    nameRu: "Малый сундук",
    nameKk: "Кіші сандық",
    descRu: "1 случайная вещь",
    descKk: "1 кездейсоқ зат",
    cost: 100,
    currency: "gold",
    iconSource: require("../../assets/images/shop_chest_small.png"),
    rarityColors: ["#045DA9", "#034B88"],
    trophyRequired: 0,
  },
  {
    id: "chest_epic",
    nameRu: "Эпический сундук",
    nameKk: "Эпикалық сандық",
    descRu: "3 вещи + 1 способность",
    descKk: "3 зат + 1 қабілет",
    cost: 15,
    currency: "gem",
    iconSource: require("../../assets/images/shop_chest_epic.png"),
    rarityColors: ["#8033E6", "#4D1A99"],
    trophyRequired: 300,
  },
  {
    id: "chest_legendary",
    nameRu: "Легендарный сундук",
    nameKk: "Аңыздық сандық",
    descRu: "5 редких карт",
    descKk: "5 сирек карта",
    cost: 30,
    currency: "gem",
    iconSource: require("../../assets/images/shop_chest_legendary.png"),
    rarityColors: ["#FF9900", "#CC4400"],
    trophyRequired: 800,
  },
  {
    id: "chest_crystal",
    nameRu: "Кристальный сундук",
    nameKk: "Кристалл сандық",
    descRu: "Эксклюзивный скин героя",
    descKk: "Эксклюзивті кейіпкер скині",
    cost: 50,
    currency: "gem",
    iconSource: require("../../assets/images/shop_chest_crystal.png"),
    rarityColors: ["#00C9FF", "#0078FF"],
    trophyRequired: 1500,
  },
];

interface RealMoneyProduct {
  id: string;
  nameRu: string;
  nameKk: string;
  priceString: string;
  iconSource: any;
  actionType: "premium_math" | "premium_physics" | "mock_tests" | "gem" | "gold";
  amount?: number;
}

const realMoneyProducts: RealMoneyProduct[] = [
  {
    id: "premium_math",
    nameRu: "Премиум по Математике",
    nameKk: "Математикадан Премиум",
    priceString: "1 490 ₸",
    iconSource: require("../../assets/images/subject_math.png"),
    actionType: "premium_math",
  },
  {
    id: "premium_physics",
    nameRu: "Премиум по Физике",
    nameKk: "Физикадан Премиум",
    priceString: "1 490 ₸",
    iconSource: require("../../assets/images/subject_physics.png"),
    actionType: "premium_physics",
  },
  {
    id: "mock_tests",
    nameRu: "Полный доступ к тестам ЕНТ",
    nameKk: "ҰБТ тесттеріне толық рұқсат",
    priceString: "490 ₸",
    iconSource: require("../../assets/images/shop_test.png"),
    actionType: "mock_tests",
  },
  {
    id: "gems_20",
    nameRu: "20 Кристаллов",
    nameKk: "20 Кристалл",
    priceString: "99 ₸",
    iconSource: require("../../assets/images/shop_gem.png"),
    actionType: "gem",
    amount: 20,
  },
  {
    id: "gems_50",
    nameRu: "50 Кристаллов",
    nameKk: "50 Кристалл",
    priceString: "199 ₸",
    iconSource: require("../../assets/images/shop_gem.png"),
    actionType: "gem",
    amount: 50,
  },
  {
    id: "gems_150",
    nameRu: "150 Кристаллов",
    nameKk: "150 Кристалл",
    priceString: "499 ₸",
    iconSource: require("../../assets/images/shop_gem.png"),
    actionType: "gem",
    amount: 150,
  },
  {
    id: "gold_500",
    nameRu: "500 Золота",
    nameKk: "500 Алтын",
    priceString: "99 ₸",
    iconSource: require("../../assets/images/shop_gold.png"),
    actionType: "gold",
    amount: 500,
  },
  {
    id: "gold_1500",
    nameRu: "1 500 Золота",
    nameKk: "1 500 Алтын",
    priceString: "199 ₸",
    iconSource: require("../../assets/images/shop_gold.png"),
    actionType: "gold",
    amount: 1500,
  },
  {
    id: "gold_5000",
    nameRu: "5 000 Золота",
    nameKk: "5 000 Алтын",
    priceString: "499 ₸",
    iconSource: require("../../assets/images/shop_gold.png"),
    actionType: "gold",
    amount: 5000,
  },
];

export default function ShopScreen() {
  const router = useRouter();
  const appLanguage = useGameStore((state) => state.appLanguage);
  const gold = useGameStore((state) => state.userGold);
  const gems = useGameStore((state) => state.userGems);
  const trophies = useGameStore((state) => state.userTrophies);
  const addGold = useGameStore((state) => state.addGold);
  const addGems = useGameStore((state) => state.addGems);
  const subtractGold = useGameStore((state) => state.subtractGold);
  const subtractGems = useGameStore((state) => state.subtractGems);

  const lastFreeChestClaimed = useGameStore((state) => state.lastFreeChestClaimed);
  const lastDailyChestClaimed = useGameStore((state) => state.lastDailyChestClaimed);
  const claimFreeChestAction = useGameStore((state) => state.claimFreeChest);
  const claimDailyChestAction = useGameStore((state) => state.claimDailyChest);

  const unlockedPremiumMath = useGameStore((state) => state.unlockedPremiumMath);
  const unlockedPremiumPhysics = useGameStore((state) => state.unlockedPremiumPhysics);
  const mockTestStatus = useGameStore((state) => state.mockTestStatus);

  const unlockPremiumMath = useGameStore((state) => state.unlockPremiumMath);
  const unlockPremiumPhysics = useGameStore((state) => state.unlockPremiumPhysics);
  const setMockTestStatus = useGameStore((state) => state.setMockTestStatus);

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const getRemainingTime = (lastClaimed: number, cooldownHours: number) => {
    if (!lastClaimed) return 0;
    const diff = lastClaimed + cooldownHours * 3600 * 1000 - currentTime;
    return diff > 0 ? diff : 0;
  };

  const formatRemainingTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const freeTimeLeft = getRemainingTime(lastFreeChestClaimed, 8);
  const dailyTimeLeft = getRemainingTime(lastDailyChestClaimed, 24);

  const handleClaimFree = () => {
    if (freeTimeLeft === 0) {
      claimFreeChestAction();
      addGold(50);
      addGems(2);
      showToast(appLanguage === "kk" ? "Тегін сандық ашылды! +50 🪙, +2 💎" : "Свободный сундук открыт! +50 🪙, +2 💎");
    }
  };

  const handleClaimDaily = () => {
    if (dailyTimeLeft === 0) {
      claimDailyChestAction();
      addGold(150);
      addGems(5);
      showToast(appLanguage === "kk" ? "Күнделікті сандық ашылды! +150 🪙, +5 💎" : "Сундук дня открыт! +150 🪙, +5 💎");
    }
  };

  const handleBuyChest = (item: ShopChestItem) => {
    if (trophies < item.trophyRequired) {
      showToast(appLanguage === "kk" ? `Бұл сандық үшін ${item.trophyRequired} кубок керек` : `Требуется ${item.trophyRequired} кубков`);
      return;
    }
    if (item.currency === "gold") {
      if (gold < item.cost) {
        showToast(appLanguage === "kk" ? "Алтын жеткіліксіз!" : "Недостаточно золота!");
        return;
      }
      subtractGold(item.cost);
      showToast(appLanguage === "kk" ? `${item.nameKk} сатып алынды!` : `${item.nameRu} куплен!`);
    } else {
      if (gems < item.cost) {
        showToast(appLanguage === "kk" ? "Кристалл жеткіліксіз!" : "Недостаточно кристаллов!");
        return;
      }
      subtractGems(item.cost);
      showToast(appLanguage === "kk" ? `${item.nameKk} сатып алынды!` : `${item.nameRu} куплен!`);
    }
  };

  const handleBuyProduct = (product: RealMoneyProduct) => {
    if (product.actionType === "premium_math") unlockPremiumMath();
    if (product.actionType === "premium_physics") unlockPremiumPhysics();
    if (product.actionType === "mock_tests") setMockTestStatus("purchasedFull");
    if (product.actionType === "gold" && product.amount) addGold(product.amount);
    if (product.actionType === "gem" && product.amount) addGems(product.amount);
    showToast(appLanguage === "kk" ? `${product.nameKk} сатып алынды!` : `${product.nameRu} куплено!`);
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient matching ShopView.swift */}
      <LinearGradient
        colors={["#045DA9", "#0EA5E9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Header */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backButtonCircle}>
          <Ionicons name="chevron-back" size={22} color="#181E32" />
        </Pressable>

        <Text style={styles.headerTitle}>
          {appLanguage === "kk" ? "ДҮКЕН" : "МАГАЗИН"}
        </Text>

        {/* Currency Pills */}
        <View style={styles.currencyBox}>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>🪙</Text>
            <Text style={styles.pillText}>{gold}</Text>
          </View>

          <View style={styles.pill}>
            <Text style={styles.pillIcon}>💎</Text>
            <Text style={styles.pillText}>{gems}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. League Status Banner */}
        <View style={styles.leagueCard}>
          <LinearGradient
            colors={["#045DA9", "#034B88"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={{ fontSize: 32 }}>🏆</Text>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.leagueTitle}>
              {trophies >= 1500
                ? appLanguage === "kk" ? "Чемпиондар Лигасы" : "Чемпионская Лига"
                : trophies >= 800
                ? appLanguage === "kk" ? "Алтын Лига" : "Золотая Лига"
                : trophies >= 300
                ? appLanguage === "kk" ? "Күміс Лига" : "Серебряная Лига"
                : appLanguage === "kk" ? "Қола Лигасы" : "Бронзовая Лига"}
            </Text>
            <Text style={styles.leagueSub}>
              {appLanguage === "kk" ? `Сізде ${trophies} кубок бар` : `У вас ${trophies} кубков`}
            </Text>
          </View>
        </View>

        {/* 2. Daily Gifts Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>
            {appLanguage === "kk" ? "КҮНДЕЛІКТІ СЫЙЛЫҚТАР" : "ЕЖЕДНЕВНЫЕ ПОДАРКИ"}
          </Text>

          <View style={styles.dailyGrid}>
            {/* Free Chest */}
            <Pressable
              onPress={handleClaimFree}
              disabled={freeTimeLeft > 0}
              style={({ pressed }) => [
                styles.dailyCard,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <Image source={require("../../assets/images/shop_chest_free.png")} style={styles.chestImg} />
              <Text style={styles.dailyCardTitle}>
                {appLanguage === "kk" ? "Тегін сандық" : "Свободный сундук"}
              </Text>
              <Text style={styles.dailyCardReward}>50 🪙 + 2 💎</Text>

              {freeTimeLeft > 0 ? (
                <View style={styles.timerBadge}>
                  <Text style={styles.timerText}>{formatRemainingTime(freeTimeLeft)}</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={["#22C55E", "#15803D"]}
                  style={styles.openBtnGradient}
                >
                  <Text style={styles.openBtnText}>
                    {appLanguage === "kk" ? "АШУ" : "ОТКРЫТЬ"}
                  </Text>
                </LinearGradient>
              )}
            </Pressable>

            {/* Daily Chest */}
            <Pressable
              onPress={handleClaimDaily}
              disabled={dailyTimeLeft > 0}
              style={({ pressed }) => [
                styles.dailyCard,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <Image source={require("../../assets/images/shop_chest_epic.png")} style={styles.chestImg} />
              <Text style={styles.dailyCardTitle}>
                {appLanguage === "kk" ? "Күнделікті сандық" : "Сундук дня"}
              </Text>
              <Text style={styles.dailyCardReward}>150 🪙 + 5 💎</Text>

              {dailyTimeLeft > 0 ? (
                <View style={styles.timerBadge}>
                  <Text style={styles.timerText}>{formatRemainingTime(dailyTimeLeft)}</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={["#22C55E", "#15803D"]}
                  style={styles.openBtnGradient}
                >
                  <Text style={styles.openBtnText}>
                    {appLanguage === "kk" ? "АШУ" : "ОТКРЫТЬ"}
                  </Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>
        </View>

        {/* 3. Chests Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>
            {appLanguage === "kk" ? "САНДЫҚТАР МЕН ГЕРОЙЛАР" : "СУНДУКИ И ГЕРОИ"}
          </Text>

          <View style={styles.chestsGrid}>
            {chestsConfig.map((item) => {
              const isLocked = trophies < item.trophyRequired;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleBuyChest(item)}
                  style={({ pressed }) => [
                    styles.chestCard,
                    pressed && { transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <LinearGradient
                    colors={item.rarityColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  {isLocked ? (
                    <View style={styles.lockedCenter}>
                      <Ionicons name="lock-closed" size={32} color="#FFFFFF" />
                      <Text style={styles.lockTrophyText}>{item.trophyRequired} 🏆</Text>
                    </View>
                  ) : (
                    <>
                      <Image source={item.iconSource} style={styles.chestCardImg} />
                      <Text style={styles.chestCardName}>
                        {appLanguage === "kk" ? item.nameKk : item.nameRu}
                      </Text>
                      <Text style={styles.chestCardDesc}>
                        {appLanguage === "kk" ? item.descKk : item.descRu}
                      </Text>

                      <View style={styles.pricePill}>
                        <Text style={styles.pricePillText}>
                          {item.currency === "gold" ? `🪙 ${item.cost}` : `💎 ${item.cost}`}
                        </Text>
                      </View>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 4. Real Money Purchases Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>
            {appLanguage === "kk" ? "ПАКЕТТЕР ЖӘНЕ ВАЛЮТА" : "ПАКЕТЫ И ВАЛЮТА"}
          </Text>

          <View style={styles.productsList}>
            {realMoneyProducts.map((prod) => (
              <Pressable
                key={prod.id}
                onPress={() => handleBuyProduct(prod)}
                style={({ pressed }) => [
                  styles.productRow,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <LinearGradient
                  colors={["#045DA9", "#034B88"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                <Image source={prod.iconSource} style={styles.prodImg} />

                <Text style={styles.prodTitle}>
                  {appLanguage === "kk" ? prod.nameKk : prod.nameRu}
                </Text>

                <View style={styles.buyBtn}>
                  <Text style={styles.buyBtnText}>{prod.priceString}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Toast Banner */}
      {toastMessage && (
        <View style={styles.toastBox}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#045DA9",
  },
  topHeader: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  currencyBox: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pillIcon: {
    fontSize: 14,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#181E32",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
  },
  leagueCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.18)",
    gap: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  leagueTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  leagueSub: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.75)",
  },
  sectionContainer: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: 1.2,
  },
  dailyGrid: {
    flexDirection: "row",
    gap: 12,
  },
  dailyCard: {
    flex: 1,
    height: 180,
    backgroundColor: "#045DA9",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.18)",
    padding: 14,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  chestImg: {
    width: 64,
    height: 64,
    resizeMode: "contain",
  },
  dailyCardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  dailyCardReward: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.75)",
  },
  timerBadge: {
    width: "100%",
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    alignItems: "center",
  },
  timerText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  openBtnGradient: {
    width: "100%",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  openBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  chestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chestCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    padding: 14,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.18)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  chestCardImg: {
    width: 64,
    height: 64,
    resizeMode: "contain",
  },
  chestCardName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  chestCardDesc: {
    fontSize: 10,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
  },
  pricePill: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pricePillText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  lockedCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  lockTrophyText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  productsList: {
    gap: 12,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.18)",
    gap: 14,
  },
  prodImg: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },
  prodTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  buyBtn: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buyBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  toastBox: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  toastText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
