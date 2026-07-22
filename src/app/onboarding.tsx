import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SubjectCard {
  id: string;
  icon: any; // Ionicons glyph name
  nameRu: string;
  nameKk: string;
  nameEn: string;
  gradientStart: string;
  gradientEnd: string;
}

const cards: SubjectCard[] = [
  { id: "math",           icon: "infinite",           nameRu: "Математика",          nameKk: "Математика",               nameEn: "Mathematics",           gradientStart: "#1a4ccd", gradientEnd: "#0d99ff" },
  { id: "history",        icon: "book-outline",       nameRu: "История Казахстана",  nameKk: "Қазақстан тарихы",         nameEn: "History of Kazakhstan", gradientStart: "#8c330d", gradientEnd: "#e6731a" },
  { id: "physics",        icon: "nuclear-outline",    nameRu: "Физика",              nameKk: "Физика",                   nameEn: "Physics",               gradientStart: "#0d3380", gradientEnd: "#1a8cd9" },
  { id: "chemistry",      icon: "flask-outline",      nameRu: "Химия",               nameKk: "Химия",                    nameEn: "Chemistry",             gradientStart: "#0d6633", gradientEnd: "#1abf59" },
  { id: "biology",        icon: "leaf-outline",       nameRu: "Биология",            nameKk: "Биология",                  nameEn: "Biology",               gradientStart: "#1a731a", gradientEnd: "#40cc33" },
  { id: "geography",      icon: "earth-outline",      nameRu: "География",           nameKk: "География",                 nameEn: "Geography",             gradientStart: "#0d5973", gradientEnd: "#00b2b2" },
  { id: "reading",        icon: "reader-outline",     nameRu: "Грамотность чтения",  nameKk: "Оқу сауаттылығы",           nameEn: "Reading Literacy",      gradientStart: "#661a80", gradientEnd: "#bf40d9" },
  { id: "mathLiteracy",   icon: "stats-chart-outline", nameRu: "Мат. грамотность",   nameKk: "Мат. сауаттылық",           nameEn: "Math Literacy",         gradientStart: "#331a99", gradientEnd: "#8040e6" },
  { id: "informatics",    icon: "laptop-outline",     nameRu: "Информатика",         nameKk: "Информатика",               nameEn: "Informatics",           gradientStart: "#0d3366", gradientEnd: "#0080bf" },
  { id: "worldHistory",   icon: "school-outline",     nameRu: "Всемирная история",   nameKk: "Дүниежүзі тарихы",          nameEn: "World History",         gradientStart: "#66330d", gradientEnd: "#bf661a" },
  { id: "literature",     icon: "pencil-outline",     nameRu: "Казахская лит.",      nameKk: "Қазақ әдебиеті",            nameEn: "Kazakh Literature",     gradientStart: "#730d40", gradientEnd: "#cc2673" },
  { id: "ieltsListening", icon: "headphones-outline",  nameRu: "IELTS Listening",     nameKk: "IELTS Listening",           nameEn: "IELTS Listening",       gradientStart: "#0d0d4d", gradientEnd: "#2626a6" },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const appLanguage = useGameStore((state) => state.appLanguage);

  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());

  // Load saved subjects from AsyncStorage on mount
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const saved = await AsyncStorage.getItem("onboardingSelectedSubjects");
        if (saved) {
          setSelectedSubjects(new Set(saved.split(",")));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadSaved();
  }, []);

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = async () => {
    if (selectedSubjects.size === 0) return;
    try {
      const subjectsStr = Array.from(selectedSubjects).join(",");
      await AsyncStorage.setItem("onboardingSelectedSubjects", subjectsStr);
      router.push("/auth");
    } catch (e) {
      console.error(e);
    }
  };

  const getHeaderTitle = () => {
    switch (appLanguage) {
      case "kk": return "ПӘНДЕРДІ ТАҢДА";
      default:   return "ВЫБЕРИ ПРЕДМЕТЫ";
    }
  };

  const getHeaderSubtitle = () => {
    switch (appLanguage) {
      case "kk": return "ЕНТ-ге дайындалатын пәндеріңді таңда";
      default:   return "Выбери предметы для подготовки к ЕНТ";
    }
  };

  const getContinueLabel = () => {
    switch (appLanguage) {
      case "kk": return "ЖАЛҒАСТЫРУ";
      default:   return "ПРОДОЛЖИТЬ";
    }
  };

  const getCardName = (card: SubjectCard) => {
    switch (appLanguage) {
      case "kk": return card.nameKk;
      default:   return card.nameRu;
    }
  };

  const getSelectedLabel = () => {
    const count = selectedSubjects.size;
    switch (appLanguage) {
      case "kk": return `${count} пән таңдалды`;
      default:   return `Выбрано предметов: ${count}`;
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Gradient Background */}
      <LinearGradient
        colors={["#045da9", "#0ea5e9"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Grid Pattern Background */}
      <View style={styles.gridOverlay} />

      <View style={styles.innerContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <Text style={styles.headerSubtitle}>{getHeaderSubtitle()}</Text>
          
          {selectedSubjects.size > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getSelectedLabel()}</Text>
            </View>
          )}
        </View>

        {/* Subjects Scroll Grid */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {cards.map((card) => {
              const isSelected = selectedSubjects.has(card.id);
              
              return (
                <Pressable
                  key={card.id}
                  onPress={() => toggleSubject(card.id)}
                  style={[
                    styles.card,
                    isSelected && styles.cardSelected,
                  ]}
                >
                  <LinearGradient
                    colors={[card.gradientStart, card.gradientEnd]}
                    style={StyleSheet.absoluteFill}
                  />
                  
                  <View style={styles.cardContent}>
                    <Ionicons name={card.icon} size={28} color="#FFFFFF" />
                    <Text style={styles.cardText} numberOfLines={2}>
                      {getCardName(card)}
                    </Text>
                    
                    {isSelected && (
                      <View style={styles.checkmarkBadge}>
                        <Ionicons name="checkmark" size={12} color="#045da9" />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Navigation Button */}
        <View style={styles.bottomBar}>
          <Pressable
            disabled={selectedSubjects.size === 0}
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              selectedSubjects.size === 0 && styles.continueButtonDisabled,
              pressed && styles.continueButtonPressed,
            ]}
          >
            {selectedSubjects.size > 0 ? (
              <LinearGradient
                colors={["#1f73f5", "#0d4cce"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            
            <View style={styles.continueContent}>
              <Text
                style={[
                  styles.continueText,
                  selectedSubjects.size === 0 && styles.continueTextDisabled,
                ]}
              >
                {getContinueLabel()}
              </Text>
              {selectedSubjects.size > 0 && (
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              )}
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#045da9",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.05,
    // Note: React Native does not natively render a Canvas loop easily.
    // An elegant overlay pattern is simulated through standard transparency.
  },
  innerContainer: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },
  card: {
    width: (SCREEN_WIDTH - 54) / 2, // 2-columns calculation
    height: 104,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  cardSelected: {
    borderColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    position: "relative",
  },
  cardText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    lineHeight: 18,
  },
  checkmarkBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  continueButton: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  continueButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  continueButtonPressed: {
    opacity: 0.9,
  },
  continueContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  continueTextDisabled: {
    color: "rgba(255, 255, 255, 0.4)",
  },
});
