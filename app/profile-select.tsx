import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ProfileOption {
  id: string;
  nameKk: string;
  nameRu: string;
  nameEn: string;
  descKk: string;
  descRu: string;
  descEn: string;
  icons: string;
  startColor: string;
  endColor: string;
  glowColor: string;
}

const profiles: ProfileOption[] = [
  {
    id: "fizmat",
    nameRu: "Физика-Математика",
    nameKk: "Физика-Математика",
    nameEn: "Physics-Mathematics",
    descRu: "Физмат • Физика + Математика",
    descKk: "Физмат • Физика + Математика",
    descEn: "Phys-Math • Physics + Mathematics",
    icons: "⚛️ 📐",
    startColor: "#08203c",
    endColor: "#0096c8",
    glowColor: "rgba(0, 150, 200, 0.4)",
  },
  {
    id: "himbio",
    nameRu: "Химия-Биология",
    nameKk: "Химия-Биология",
    nameEn: "Chemistry-Biology",
    descRu: "Химбио • Химия + Биология",
    descKk: "Химбио • Химия + Биология",
    descEn: "Chem-Bio • Chemistry + Biology",
    icons: "🧪 🌿",
    startColor: "#052323",
    endColor: "#0f8255",
    glowColor: "rgba(15, 130, 85, 0.4)",
  },
  {
    id: "istgeo",
    nameRu: "История-География",
    nameKk: "Тарих-География",
    nameEn: "History-Geography",
    descRu: "История Казахстана + География",
    descKk: "Қазақстан тарихы + География",
    descEn: "History of Kazakhstan + Geography",
    icons: "📜 🌍",
    startColor: "#1c1010",
    endColor: "#c83c1e",
    glowColor: "rgba(200, 60, 30, 0.4)",
  },
  {
    id: "mathgeo",
    nameRu: "Математика-География",
    nameKk: "Математика-География",
    nameEn: "Mathematics-Geography",
    descRu: "Математика + География",
    descKk: "Математика + География",
    descEn: "Mathematics + Geography",
    icons: "📐 🌍",
    startColor: "#201c0c",
    endColor: "#be8c0a",
    glowColor: "rgba(190, 140, 10, 0.4)",
  },
  {
    id: "kazlit",
    nameRu: "Казахский язык-Литература",
    nameKk: "Қазақ тілі-Әдебиет",
    nameEn: "Kazakh Lang & Lit",
    descRu: "Казахский язык + Литература",
    descKk: "Қазақ тілі + Әдебиет",
    descEn: "Kazakh Language + Literature",
    icons: "💬 📖",
    startColor: "#180c30",
    endColor: "#8c1ea0",
    glowColor: "rgba(140, 30, 160, 0.4)",
  },
  {
    id: "mathinfo",
    nameRu: "Математика-Информатика",
    nameKk: "Математика-Информатика",
    nameEn: "Mathematics-Informatics",
    descRu: "Мат-Инфо • Математика + Информатика",
    descKk: "Мат-Инфо • Математика + Информатика",
    descEn: "Math-Info • Mathematics + Informatics",
    icons: "📐 💻",
    startColor: "#082828",
    endColor: "#00b48c",
    glowColor: "rgba(0, 180, 140, 0.4)",
  },
];

export default function ProfileSelectionScreen() {
  const router = useRouter();
  const appLanguage = useGameStore((state) => state.appLanguage);
  const setUserProfile = useGameStore((state) => state.setUserProfile);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Anim states
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const compassOpacity = useRef(new Animated.Value(1)).current;
  const pressScales = useRef<{ [key: string]: Animated.Value }>({
    fizmat: new Animated.Value(1),
    himbio: new Animated.Value(1),
    istgeo: new Animated.Value(1),
    mathgeo: new Animated.Value(1),
    kazlit: new Animated.Value(1),
    mathinfo: new Animated.Value(1),
  }).current;

  const getLocalizedTitle = () => {
    switch (appLanguage) {
      case "kk": return "ПРОФИЛЬ ТАНДАУ";
      default:   return "ВЫБОР ПРОФИЛЯ";
    }
  };

  const getLocalizedSubtitle = () => {
    switch (appLanguage) {
      case "kk": return "БАҒЫТТЫ ТАНДАУ";
      default:   return "ВЫБЕРИТЕ НАПРАВЛЕНИЕ";
    }
  };

  const getProfileName = (p: ProfileOption) => {
    switch (appLanguage) {
      case "kk": return p.nameKk;
      default:   return p.nameRu;
    }
  };

  const getProfileDesc = (p: ProfileOption) => {
    switch (appLanguage) {
      case "kk": return p.descKk;
      default:   return p.descRu;
    }
  };

  const handleProfileSelect = (p: ProfileOption) => {
    if (isSuccess) return;
    setIsSuccess(true);
    setSelectedId(p.id);

    // Save profile to Zustand store
    const selectedName = p.nameRu + " (" + (p.id === "fizmat" ? "Физмат" : p.id === "himbio" ? "Химбио" : p.id === "mathinfo" ? "Мат-Инфо" : "Профиль") + ")";
    setUserProfile(selectedName);

    // Spring button click
    Animated.spring(pressScales[p.id], { toValue: 0.96, useNativeDriver: true }).start();

    // Icon circle animation
    Animated.timing(compassOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });

    // Goback to menu after short delay
    setTimeout(() => {
      Animated.spring(pressScales[p.id], { toValue: 1, useNativeDriver: true }).start();
      router.back();
      
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedId(null);
        checkmarkScale.setValue(0);
        compassOpacity.setValue(1);
      }, 500);
    }, 950);
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={["#045da9", "#0ea5e9"]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Radial Light Glow */}
      <View style={styles.radialGlow} />

      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Disc Icon */}
        <View style={styles.centerSection}>
          <View style={[styles.disc, isSuccess && styles.discSuccess]}>
            {isSuccess ? (
              <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
                <Ionicons name="checkmark-circle" size={46} color="#30d158" />
              </Animated.View>
            ) : (
              <Animated.View style={{ opacity: compassOpacity }}>
                <Ionicons name="compass" size={42} color="#eb9f28" />
              </Animated.View>
            )}
          </View>

          {/* Titles */}
          <Text style={styles.subtitle}>{getLocalizedSubtitle()}</Text>
          <Text style={styles.title}>{getLocalizedTitle()}</Text>
        </View>

        {/* Profile Options List */}
        <View style={styles.list}>
          {profiles.map((p) => {
            const isSelected = selectedId === p.id;
            
            return (
              <Animated.View
                key={p.id}
                style={{
                  transform: [{ scale: pressScales[p.id] }],
                  width: "100%",
                }}
              >
                <Pressable
                  onPress={() => handleProfileSelect(p)}
                  style={({ pressed }) => [
                    styles.card,
                    pressed && styles.cardPressed,
                    isSelected && {
                      shadowColor: p.glowColor,
                      shadowOpacity: 0.8,
                      shadowRadius: 15,
                      elevation: 8,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[p.startColor, p.endColor]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <View style={styles.cardContent}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardIcons}>{p.icons}</Text>
                      
                      <View style={styles.textStack}>
                        <Text style={styles.cardName}>{getProfileName(p)}</Text>
                        <Text style={styles.cardDesc}>{getProfileDesc(p)}</Text>
                      </View>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="rgba(255, 255, 255, 0.4)"
                    />
                  </View>
                </Pressable>
              </Animated.View>
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
  radialGlow: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    opacity: 0.6,
  },
  headerBar: {
    width: "100%",
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  centerSection: {
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  disc: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(10, 15, 30, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#eb9f28",
    shadowColor: "#eb9f28",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 16,
  },
  discSuccess: {
    borderColor: "#30d158",
    shadowColor: "#30d158",
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#5CA2FF",
    letterSpacing: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  list: {
    width: "100%",
    gap: 14,
  },
  card: {
    width: "100%",
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    width: "100%",
    height: "100%",
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardIcons: {
    fontSize: 28,
    marginRight: 16,
  },
  textStack: {
    flex: 1,
    justifyContent: "center",
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  cardDesc: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },
});
