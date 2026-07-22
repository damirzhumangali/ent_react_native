import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";
import { Subject, MathSubcategory, isMathTopicGeometry } from "@/models/subject";
import { QuestionRepository } from "@/services/QuestionRepository";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

export default function MathSubcategoriesScreen() {
  const router = useRouter();
  const appLanguage = useGameStore((state) => state.appLanguage);

  const [algebraCount, setAlgebraCount] = useState(0);
  const [geometryCount, setGeometryCount] = useState(0);

  useEffect(() => {
    try {
      const mathQuestions = QuestionRepository.getQuestionsForSubject(Subject.math);
      const uniqueTopics = Array.from(
        new Set(mathQuestions.map((q) => q.topic).filter((t): t is string => !!t))
      );

      const geo = uniqueTopics.filter((topic) => isMathTopicGeometry(topic)).length;
      const alg = uniqueTopics.length - geo;

      setAlgebraCount(alg);
      setGeometryCount(geo);
    } catch (e) {
      console.error("Error loading math subcategories counts:", e);
    }
  }, []);

  const handleSelectSubcategory = (sub: MathSubcategory) => {
    router.push({
      pathname: "/subject-topics" as any,
      params: {
        subject: Subject.math,
        subcategory: sub,
      },
    } as any);
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient matching Swift MathSubcategoriesView */}
      <LinearGradient
        colors={["#045DA9", "#0EA5E9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Live Animated Background Particles matching Swift RoadmapParticlesView */}
      <RoadmapParticlesView />

      {/* Top Header Navigation Bar */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#38BDF8" />
          <Text style={styles.backText}>{appLanguage === "kk" ? "Пәндер" : "Предметы"}</Text>
        </Pressable>

        <Text style={styles.headerTitle}>МАТЕМАТИКА</Text>

        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Text Section */}
        <View style={styles.headingBox}>
          <Text style={styles.headingText}>{appLanguage === "kk" ? "Бөлімдер" : "Разделы"}</Text>
          <Text style={styles.subtitleText}>
            {appLanguage === "kk"
              ? "Тақырыптарды оқу үшін математика бөлімін таңдаңыз"
              : "Выберите раздел математики для изучения тем"}
          </Text>
        </View>

        {/* Subcategories Vertical List */}
        <View style={styles.subList}>
          {/* Algebra Card */}
          <Pressable
            onPress={() => handleSelectSubcategory(MathSubcategory.algebra)}
            style={({ pressed }) => [
              styles.subCard,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 },
            ]}
          >
            <LinearGradient
              colors={["#045DA9", "#034B88"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* White Circle Container with Original Swift PNG Asset */}
            <View style={styles.iconCircle}>
              <Image
                source={require("../../assets/images/subcategory_algebra.png")}
                style={styles.subImg}
              />
            </View>

            <Text style={styles.subTitle}>{appLanguage === "kk" ? "Алгебра" : "Алгебра"}</Text>

            <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.8)" />
          </Pressable>

          {/* Geometry Card */}
          <Pressable
            onPress={() => handleSelectSubcategory(MathSubcategory.geometry)}
            style={({ pressed }) => [
              styles.subCard,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 },
            ]}
          >
            <LinearGradient
              colors={["#045DA9", "#034B88"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* White Circle Container with Original Swift PNG Asset */}
            <View style={styles.iconCircle}>
              <Image
                source={require("../../assets/images/subcategory_geometry.png")}
                style={styles.subImg}
              />
            </View>

            <Text style={styles.subTitle}>{appLanguage === "kk" ? "Геометрия" : "Геометрия"}</Text>

            <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.8)" />
          </Pressable>
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
    paddingTop: 62,
    paddingHorizontal: 16,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    color: "#38BDF8",
    fontSize: 17,
    fontWeight: "700",
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
    paddingTop: 20,
    paddingBottom: 24,
    gap: 6,
  },
  headingText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },
  subList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  subCard: {
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
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  subImg: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  subTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
