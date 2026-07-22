import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";
import { Subject, getSubjectDisplayName } from "@/models/subject";
import { TheoryRepository, Theory } from "@/services/TheoryRepository";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TheoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const topicName = (params.topic as string) || "";
  const subject = (params.subject as Subject) || Subject.math;

  const appLanguage = useGameStore((state) => state.appLanguage);
  
  const [theory, setTheory] = useState<Theory | null>(null);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load theory data
  useEffect(() => {
    setLoading(true);
    const repo = new TheoryRepository();
    
    // Clean topic name from parts modifiers (e.g. " (Part 1)")
    const cleanName = topicName
      .replace(" (Part 1)", "")
      .replace(" (Part 2)", "")
      .replace(" (Part 3)", "");

    const found = repo.getTheory(cleanName, subject);

    if (found) {
      setIsPlaceholder(false);
      setTheory({
        topic: topicName,
        subject: found.subject,
        summary: found.summary,
        content: found.content,
        formula: found.formula,
        exampleQuestion: found.exampleQuestion,
        exampleAnswer: found.exampleAnswer
      });
    } else if (subject.toString().includes("ielts")) {
      setIsPlaceholder(false);
      setTheory({
        topic: topicName,
        subject: subject,
        summary: `Mastering key language patterns, academic structures, and core strategies for IELTS: ${topicName}.`,
        content: `To achieve a high score in this IELTS module, you must master the following strategies:\n\n1. Cohesion and Coherence: Use advanced linking words like "Furthermore", "In contrast", "Consequently" to connect ideas logically.\n\n2. Grammatical Range: Incorporate varied structures (Conditionals Type 2/3, Passive Voice, Present Perfect Continuous) to demonstrate flexibility.\n\n3. Vocabulary Diversity: Avoid repeating prompt words. Paraphrase key terms (e.g., "hometown" -> "place of origin").\n\n4. Elaborate Answers: Apply the OREO Method (Opinion, Reason, Example, Opinion restated) to expand your speaking or writing replies.`,
        formula: "Overall Score = Fluency (25%) + Lexical Resource (25%) + Grammar (25%) + Pronunciation (25%)",
        exampleQuestion: `Describe a significant aspect of ${topicName} and its impact on lifestyle.`,
        exampleAnswer: "Well, in my perspective, the most prominent factor is the acceleration of daily life. For instance, looking at how urban areas have evolved over the last decade, it is clear that modernization has dramatically changed our routines. Hence, I firmly believe flexibility is paramount."
      });
    } else {
      setIsPlaceholder(true);
      setTheory({
        topic: topicName,
        subject: subject,
        summary: appLanguage === "kk" ? "Бұл тақырып бойынша негізгі ақпарат пен теориялық материал." : "Основная информация и теоретический материал по данной теме.",
        content: appLanguage === "kk" ? "Оқуды жалғастыру және біліміңізді тексеру үшін төмендегі батырманы басып, тест тапсырмаларынан өтіңіз.\n\nТәжірибелік тапсырмаларды орындау теорияны есте сақтауға және материалды жақсырақ меңгеруге көмектеседі!" : "Для продолжения обучения и проверки своих знаний нажмите кнопку ниже и перейдите к тестовым заданиям.\n\nВыполнение практических задач поможет вам лучше закрепить теорию и освоить материал!",
        formula: "",
        exampleQuestion: "",
        exampleAnswer: ""
      });
    }
    setLoading(false);
  }, [topicName, subject, appLanguage]);

  // Accent Colors matching SwiftUI
  const accentColor = (() => {
    switch (subject) {
      case Subject.math:           return "#5CA2FF";
      case Subject.physics:        return "#FF9500";
      case Subject.informatics:    return "#00B48C";
      case Subject.history:        return "#AF52DE";
      case Subject.worldHistory:   return "#6450A0";
      case Subject.literature:     return "#D2783C";
      case Subject.mathLiteracy:   return "#34C759";
      case Subject.reading:        return "#FF2D55";
      case Subject.chemistry:      return "#30B0C7";
      case Subject.biology:        return "#34C759";
      case Subject.geography:      return "#007AFF";
      case Subject.language:       return "#FFCC00";
      case Subject.ieltsListening: return "#007AFF";
      case Subject.ieltsReading:   return "#FF9500";
      case Subject.ieltsWriting:   return "#5CA2FF";
      case Subject.ieltsSpeaking:  return "#30D158";
      default:                     return "#5CA2FF";
    }
  })();

  const subjectIconName = (() => {
    switch (subject) {
      case Subject.math:           return "infinite";
      case Subject.physics:        return "nuclear";
      case Subject.informatics:    return "laptop";
      case Subject.history:        return "book";
      case Subject.worldHistory:   return "school";
      case Subject.literature:     return "pencil";
      case Subject.mathLiteracy:   return "stats-chart";
      case Subject.reading:        return "reader";
      case Subject.chemistry:      return "flask";
      case Subject.biology:        return "leaf";
      case Subject.geography:      return "earth";
      case Subject.language:       return "chatbubbles";
      case Subject.ieltsListening: return "headset";
      case Subject.ieltsReading:   return "document-text";
      case Subject.ieltsWriting:   return "create";
      case Subject.ieltsSpeaking:  return "mic";
      default:                     return "book-outline";
    }
  })();

  const actionLabel = (() => {
    if (subject === Subject.ieltsWriting) return "Начать Writing";
    if (subject === Subject.ieltsSpeaking) return "Начать Speaking";
    return appLanguage === "kk" ? "Тестілеуден өту" : "Пройти Тест";
  })();

  const handleStartPractice = () => {
    if (subject === Subject.ieltsWriting) {
      router.push({
        pathname: "/ielts-writing" as any,
        params: { topic: topicName }
      } as any);
      return;
    }
    router.push({
      pathname: "/battle" as any,
      params: { topic: topicName, subject }
    } as any);
  };

  if (loading || !theory) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient (Plum-to-Dark plum) */}
      <LinearGradient
        colors={["#670627", "#4b041c"]}
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
                opacity: 0.12,
              },
            ]}
          />
        ))}
      </View>

      {/* Navigation Header */}
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <HStack spacing={6}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            <Text style={styles.backText}>
              {appLanguage === "kk" ? "Тақырыптар" : "Темы"}
            </Text>
          </HStack>
        </Pressable>

        <Text style={styles.navTitle} numberOfLines={1}>
          {getSubjectDisplayName(subject, appLanguage).toUpperCase()}
        </Text>

        <View style={styles.headerIconCircle}>
          <Ionicons name={subjectIconName} size={18} color={accentColor} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Title Section */}
        <View style={styles.heroSection}>
          <View style={styles.tagWrapper}>
            <View style={[styles.premiumTag, { borderColor: accentColor }]}>
              <Ionicons name="star" size={10} color={accentColor} />
              <Text style={styles.premiumTagText}>
                {appLanguage === "kk" ? "КОНСПЕКТ" : "КОНСПЕКТ"}
              </Text>
            </View>
          </View>
          <Text style={styles.topicTitle}>{topicName}</Text>
        </View>

        {/* Cards List */}
        <View style={styles.cardsContainer}>
          {/* Summary Card */}
          <View style={[styles.glassCard, { borderColor: "rgba(255,255,255,0.12)" }]}>
            <Text style={styles.cardSectionTitle}>
              {appLanguage === "kk" ? "Қысқаша шолу" : "Краткий обзор"}
            </Text>
            <Text style={styles.cardText}>{theory.summary}</Text>
          </View>

          {/* Main Content Card */}
          <View style={[styles.glassCard, { borderColor: accentColor + "80", backgroundColor: accentColor + "1a" }]}>
            <Text style={[styles.cardSectionTitle, { color: accentColor }]}>
              {appLanguage === "kk" ? "Теориялық материал" : "Теоретический материал"}
            </Text>
            <Text style={styles.cardTextContent}>{theory.content}</Text>
          </View>

          {/* Formula Card if available */}
          {theory.formula ? (
            <View style={[styles.glassCard, { borderColor: accentColor + "66", backgroundColor: "rgba(0,0,0,0.35)" }]}>
              <Text style={[styles.cardSectionTitle, { color: accentColor }]}>
                {appLanguage === "kk" ? "Негізгі формулалар" : "Ключевые формулы"}
              </Text>
              <Text style={styles.formulaText}>{theory.formula}</Text>
            </View>
          ) : null}

          {/* Example Question/Answer Card if available */}
          {theory.exampleQuestion ? (
            <View style={[styles.glassCard, { borderColor: "rgba(255,255,255,0.12)" }]}>
              <Text style={styles.cardSectionTitle}>
                {appLanguage === "kk" ? "Мысал тапсырма" : "Пример задания"}
              </Text>
              <Text style={styles.exampleQuestionText}>{theory.exampleQuestion}</Text>
              <View style={styles.exampleAnswerBox}>
                <Text style={styles.exampleAnswerTitle}>
                  {appLanguage === "kk" ? "Жауап талдауы:" : "Разбор ответа:"}
                </Text>
                <Text style={styles.cardText}>{theory.exampleAnswer}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Pinned CTA Button */}
      <View style={styles.ctaContainer}>
        <Pressable onPress={handleStartPractice} style={styles.ctaButton}>
          <LinearGradient
            colors={[accentColor, accentColor === "#FFCC00" ? "#cc9a00" : accentColor + "cc"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <HStack spacing={8}>
              <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.ctaText}>{actionLabel}</Text>
            </HStack>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const HStack = ({ children, spacing }: { children: React.ReactNode; spacing: number }) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing }}>{children}</View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4b041c",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#4b041c",
    justifyContent: "center",
    alignItems: "center",
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
  navBar: {
    height: 95,
    paddingTop: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  backButton: {
    height: 44,
    justifyContent: "center",
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  navTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 12,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 130,
  },
  heroSection: {
    marginBottom: 24,
    gap: 8,
  },
  tagWrapper: {
    flexDirection: "row",
  },
  premiumTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.2,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  premiumTagText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  topicTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 34,
  },
  cardsContainer: {
    gap: 20,
  },
  glassCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  cardText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
  },
  cardTextContent: {
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 24,
  },
  formulaText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "monospace",
    lineHeight: 22,
  },
  exampleQuestionText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    lineHeight: 22,
    marginBottom: 12,
  },
  exampleAnswerBox: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    marginTop: 12,
    gap: 6,
  },
  exampleAnswerTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.6)",
  },
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 35,
    paddingTop: 15,
    backgroundColor: "rgba(75, 4, 28, 0.85)",
  },
  ctaButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaGradient: {
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
});
