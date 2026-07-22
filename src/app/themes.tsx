import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";
import { Subject, getSubjectDisplayName } from "@/models/subject";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SubjectItem {
  id: Subject;
  imageSource: any;
}

// Subject list with exact original PNG assets matching Swift ThemesView.swift
const entSubjectsList: SubjectItem[] = [
  { id: Subject.math, imageSource: require("../../assets/images/subject_math.png") },
  { id: Subject.history, imageSource: require("../../assets/images/subject_history.png") },
  { id: Subject.reading, imageSource: require("../../assets/images/subject_reading.png") },
  { id: Subject.mathLiteracy, imageSource: require("../../assets/images/subject_math_literacy.png") },
  { id: Subject.physics, imageSource: require("../../assets/images/subject_physics.png") },
  { id: Subject.chemistry, imageSource: require("../../assets/images/subject_chemistry.png") },
  { id: Subject.biology, imageSource: require("../../assets/images/subject_biology.png") },
  { id: Subject.geography, imageSource: require("../../assets/images/subject_geography.png") },
  { id: Subject.informatics, imageSource: require("../../assets/images/subject_informatics.png") },
  { id: Subject.worldHistory, imageSource: require("../../assets/images/subject_history.png") },
  { id: Subject.literature, imageSource: require("../../assets/images/subject_literature.png") },
  { id: Subject.language, imageSource: require("../../assets/images/subject_language.png") },
];

const ieltsSubjectsList: SubjectItem[] = [
  { id: Subject.ieltsListening, imageSource: require("../../assets/images/subject_ielts_listening.png") },
  { id: Subject.ieltsReading, imageSource: require("../../assets/images/subject_reading.png") },
  { id: Subject.ieltsWriting, imageSource: require("../../assets/images/subject_ielts_writing.png") },
  { id: Subject.ieltsSpeaking, imageSource: require("../../assets/images/subject_ielts_speaking.png") },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

// Live Animated Stardust Particles (Translating Swift RoadmapParticlesView to React Native)
function RoadmapParticlesView() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.5 + 1.2,
      speed: Math.random() * 0.0015 + 0.0006,
      opacity: Math.random() * 0.5 + 0.15,
    }));
    setParticles(generated);
  }, []);

  useEffect(() => {
    let animId: number;
    const update = () => {
      setParticles((prev) =>
        prev.map((p) => {
          let nextY = p.y - p.speed;
          let nextX = p.x;
          let nextOpacity = p.opacity;

          if (Math.random() > 0.96) {
            nextOpacity = Math.random() * 0.55 + 0.15;
          }

          if (nextY < 0) {
            nextY = 1.0;
            nextX = Math.random();
          }
          return { ...p, y: nextY, x: nextX, opacity: nextOpacity };
        })
      );
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <View
          key={p.id}
          style={{
            position: "absolute",
            left: p.x * SCREEN_WIDTH,
            top: p.y * 850,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: "#FFFFFF",
            opacity: p.opacity,
          }}
        />
      ))}
    </View>
  );
}

export default function ThemesScreen() {
  const router = useRouter();
  const appLanguage = useGameStore((state) => state.appLanguage);
  const userProfile = useGameStore((state) => state.userProfile);
  const [selectedTab, setSelectedTab] = useState<"ent" | "ielts">("ent");

  const getFilteredSubjects = () => {
    if (selectedTab === "ielts") {
      return ieltsSubjectsList;
    } else {
      // Compulsory 4: Math, History, Reading, Math Literacy
      const entSet = new Set<Subject>([Subject.math, Subject.history, Subject.reading, Subject.mathLiteracy]);

      if (userProfile.includes("Физика-Математика")) {
        entSet.add(Subject.physics);
        entSet.add(Subject.math);
      } else if (userProfile.includes("Химия-Биология")) {
        entSet.add(Subject.chemistry);
        entSet.add(Subject.biology);
      } else if (userProfile.includes("История-География")) {
        entSet.add(Subject.geography);
        entSet.add(Subject.worldHistory);
      } else if (userProfile.includes("Математика-География")) {
        entSet.add(Subject.math);
        entSet.add(Subject.geography);
      } else if (userProfile.includes("Математика-Информатика")) {
        entSet.add(Subject.math);
        entSet.add(Subject.informatics);
      } else if (userProfile.includes("Казахский язык-Литература")) {
        entSet.add(Subject.language);
        entSet.add(Subject.literature);
      } else {
        entSet.add(Subject.physics);
      }

      return entSubjectsList.filter((s) => entSet.has(s.id));
    }
  };

  const handleSelectSubject = (id: Subject) => {
    if (id === Subject.math) {
      router.push("/math-subcategories" as any);
    } else {
      router.push({
        pathname: "/subject-topics",
        params: { subject: id },
      } as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Vibrant bright blue gradient background matching ThemesView.swift */}
      <LinearGradient
        colors={["#045DA9", "#0EA5E9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Live Animated Background Particles matching Swift RoadmapParticlesView */}
      <RoadmapParticlesView />

      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
          <Text style={styles.backText}>{appLanguage === "kk" ? "Артқа" : "Назад"}</Text>
        </Pressable>

        <Text style={styles.headerTitle}>{appLanguage === "kk" ? "ПӘНДЕР" : "ПРЕДМЕТЫ"}</Text>

        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Heading & Subtitle */}
        <View style={styles.headingBox}>
          <Text style={styles.headingText}>{appLanguage === "kk" ? "Оқыту" : "Обучение"}</Text>
          <Text style={styles.subtitleText}>
            {appLanguage === "kk"
              ? "Тақырыптар мен конспектілерді қарау үшін пәнді таңдаңыз"
              : "Выберите предмет для просмотра тем и конспектов"}
          </Text>
        </View>

        {/* Tab Switcher (EHT / IELTS) */}
        <View style={styles.tabContainer}>
          <Pressable
            onPress={() => setSelectedTab("ent")}
            style={[styles.tabButton, selectedTab === "ent" && styles.tabActive]}
          >
            <Text style={[styles.tabText, selectedTab === "ent" && styles.tabTextActive]}>
              {appLanguage === "kk" ? "EHT" : "ЕНТ"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedTab("ielts")}
            style={[styles.tabButton, selectedTab === "ielts" && styles.tabActive]}
          >
            <Text style={[styles.tabText, selectedTab === "ielts" && styles.tabTextActive]}>
              IELTS
            </Text>
          </Pressable>
        </View>

        {/* Subjects Vertical Catalog List */}
        <View style={styles.subjectList}>
          {getFilteredSubjects().map((item) => {
            const displayName = getSubjectDisplayName(item.id, appLanguage);
            return (
              <Pressable
                key={item.id}
                onPress={() => handleSelectSubject(item.id)}
                style={({ pressed }) => [
                  styles.subjectCard,
                  pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
                ]}
              >
                <LinearGradient
                  colors={["#045DA9", "#034B88"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                {/* White Circle Icon Container */}
                <View style={styles.iconCircle}>
                  <Image source={item.imageSource} style={styles.subjectImg} />
                </View>

                {/* Subject Title */}
                <Text style={styles.subjectTitle}>{displayName}</Text>

                {/* Right Arrow Chevron */}
                <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.8)" />
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
    backgroundColor: "#045DA9",
  },
  topHeader: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 4,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headingBox: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 6,
  },
  headingText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 18,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  tabActive: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.7)",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  subjectList: {
    paddingHorizontal: 16,
    gap: 14,
  },
  subjectCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.18)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectImg: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  subjectTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
