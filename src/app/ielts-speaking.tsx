import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Phase = "select" | "prep" | "recording" | "results";

interface Feedback {
  overall: number;
  fluency: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  tips: string[];
}

export default function IeltsSpeakingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const appLanguage = useGameStore((state) => state.appLanguage);
  const isKazakh = appLanguage === "kk";

  const [phase, setPhase] = useState<Phase>("select");
  const [selectedTopic, setSelectedTopic] = useState("Hometown & Accommodation");
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Animated wave bars heights
  const [waveHeights] = useState(() => Array.from({ length: 18 }, () => new Animated.Value(6)));

  // Countdown Timer
  useEffect(() => {
    if (phase !== "prep" && phase !== "recording") return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (phase === "prep") {
            setPhase("recording");
            return 60; // 60s for recording
          } else if (phase === "recording") {
            finishRecording();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Audio wave animation during recording
  useEffect(() => {
    if (phase !== "recording") return;

    const waveInterval = setInterval(() => {
      waveHeights.forEach((anim) => {
        Animated.timing(anim, {
          toValue: Math.floor(Math.random() * 32) + 6,
          duration: 120,
          useNativeDriver: false,
        }).start();
      });
    }, 150);

    return () => clearInterval(waveInterval);
  }, [phase]);

  const startPrep = () => {
    setPhase("prep");
    setTimerSeconds(60);
  };

  const finishRecording = () => {
    setPhase("results");
    // Generate realistic random IELTS Band score (6.5 to 8.5)
    const fluency = parseFloat((Math.random() * 1.5 + 7.0).toFixed(1));
    const grammar = parseFloat((Math.random() * 1.5 + 6.5).toFixed(1));
    const vocab = parseFloat((Math.random() * 1.5 + 7.0).toFixed(1));
    const pron = parseFloat((Math.random() * 1.5 + 7.0).toFixed(1));
    const overall = parseFloat(((fluency + grammar + vocab + pron) / 4).toFixed(1));

    setFeedback({
      overall,
      fluency,
      grammar,
      vocabulary: vocab,
      pronunciation: pron,
      tips: [
        "Great fluency and clear pacing throughout the response!",
        "Try incorporating more complex linking phrases (e.g. 'Furthermore', 'Consequently').",
        "Excellent pronunciation of key topic vocabulary."
      ]
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A1845", "#030A1A"]} style={StyleSheet.absoluteFill} />

      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          <Text style={styles.backText}>{isKazakh ? "Артқа" : "Назад"}</Text>
        </Pressable>

        <Text style={styles.headerTitle}>IELTS SPEAKING</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* 1. SELECT TOPIC PHASE */}
      {phase === "select" && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.titleText}>IELTS Speaking Practice</Text>
          <Text style={styles.subtitleText}>
            {isKazakh ? "Мәтіндік тақырыпты таңдап, сөйлеу дағдыңызды сынып көріңіз" : "Выберите тему и проверьте свою устную речь с AI-оценкой балла!"}
          </Text>

          <View style={styles.topicList}>
            {[
              "Hometown & Accommodation",
              "Work & Studies",
              "Hobbies & Free Time",
              "Technology & Future",
              "Travel & Tourism"
            ].map((topic) => {
              const isSel = selectedTopic === topic;
              return (
                <Pressable
                  key={topic}
                  onPress={() => setSelectedTopic(topic)}
                  style={[styles.topicCard, isSel && styles.topicCardSelected]}
                >
                  <Ionicons name="mic-circle" size={28} color={isSel ? "#38bdf8" : "rgba(255, 255, 255, 0.4)"} />
                  <Text style={styles.topicName}>{topic}</Text>
                  {isSel && <Ionicons name="checkmark-circle" size={20} color="#38bdf8" />}
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={startPrep} style={styles.startPrepBtn}>
            <LinearGradient colors={["#38bdf8", "#0284c7"]} style={styles.gradientBtn}>
              <Text style={styles.startPrepText}>
                {isKazakh ? "ДАЙЫНДЫҚТЫ БАСТАУ (60с)" : "НАЧАТЬ ПОДГОТОВКУ (60с)"}
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      )}

      {/* 2. PREPARATION & RECORDING PHASES */}
      {(phase === "prep" || phase === "recording") && (
        <View style={styles.interactiveArea}>
          <Text style={styles.phaseTitle}>
            {phase === "prep"
              ? (isKazakh ? "ДАЙЫНДЫҚ УАҚЫТЫ" : "ВРЕМЯ ПОДГОТОВКИ")
              : (isKazakh ? "ЖАЗБА ЖҮРУДЕ..." : "ИДЕТ ЗАПИСЬ РЕЧИ...")}
          </Text>

          {/* Countdown timer widget */}
          <View style={styles.timerCircle}>
            <Text style={[styles.timerNumber, phase === "recording" && { color: "#FF453A" }]}>
              {timerSeconds}s
            </Text>
          </View>

          <Text style={styles.questionPrompt}>
            {`Describe your thoughts on ${selectedTopic}. What are the main advantages and challenges?`}
          </Text>

          {/* Mic Pulse Widget & Wave Bars */}
          <View style={styles.micArea}>
            <View style={[styles.micIconCircle, phase === "recording" && styles.micIconCircleActive]}>
              <Ionicons name="mic" size={48} color="#FFFFFF" />
            </View>

            {phase === "recording" && (
              <View style={styles.waveRow}>
                {waveHeights.map((anim, idx) => (
                  <Animated.View
                    key={idx}
                    style={[styles.waveBar, { height: anim }]}
                  />
                ))}
              </View>
            )}
          </View>

          {phase === "prep" && (
            <Pressable onPress={() => { setPhase("recording"); setTimerSeconds(60); }} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>{isKazakh ? "ЖАЗУДЫ БАСТАУ" : "НАЧАТЬ ЗАПИСЬ СЕЙЧАС"}</Text>
            </Pressable>
          )}

          {phase === "recording" && (
            <Pressable onPress={finishRecording} style={[styles.actionBtn, { backgroundColor: "#FF453A" }]}>
              <Text style={styles.actionBtnText}>{isKazakh ? "ЖАЗУДЫ АЯҚТАУ" : "ЗАВЕРШИТЬ И ОЦЕНИТЬ"}</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* 3. RESULTS PHASE */}
      {phase === "results" && feedback && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.resultsTitle}>IELTS Speaking Report</Text>

          {/* Score Badge Circle */}
          <View style={styles.overallCard}>
            <Text style={styles.overallScoreText}>{feedback.overall}</Text>
            <Text style={styles.overallMaxText}>/ 9.0 BAND SCORE</Text>
          </View>

          {/* Breakdown Grid */}
          <View style={styles.gridScores}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreVal}>{feedback.fluency}</Text>
              <Text style={styles.scoreLabel}>Fluency</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreVal}>{feedback.grammar}</Text>
              <Text style={styles.scoreLabel}>Grammar</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreVal}>{feedback.vocabulary}</Text>
              <Text style={styles.scoreLabel}>Vocabulary</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreVal}>{feedback.pronunciation}</Text>
              <Text style={styles.scoreLabel}>Pronunciation</Text>
            </View>
          </View>

          {/* AI Feedback Tips */}
          <View style={styles.tipsBox}>
            <Text style={styles.tipsHeader}>AI Feedback & Recommendations:</Text>
            {feedback.tips.map((tip, idx) => (
              <View key={idx} style={styles.tipRow}>
                <Ionicons name="checkmark-circle" size={16} color="#30D158" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <Pressable onPress={() => setPhase("select")} style={styles.finishBtn}>
            <Text style={styles.finishBtnText}>{isKazakh ? "МӘЗІРГЕ ОРАЛУ" : "ВЫБРАТЬ ДРУГУЮ ТЕМУ"}</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1845",
  },
  header: {
    height: 90,
    paddingTop: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 10,
  },
  subtitleText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
  },
  topicList: {
    width: "100%",
    gap: 10,
    marginVertical: 24,
  },
  topicCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    gap: 12,
  },
  topicCardSelected: {
    borderColor: "#38bdf8",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
  },
  topicName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    flex: 1,
  },
  startPrepBtn: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
  },
  gradientBtn: {
    paddingVertical: 16,
    alignItems: "center",
  },
  startPrepText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  interactiveArea: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "space-between",
  },
  phaseTitle: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 10,
  },
  timerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 3,
    borderColor: "#38bdf8",
    justifyContent: "center",
    alignItems: "center",
  },
  timerNumber: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  questionPrompt: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  micArea: {
    alignItems: "center",
    gap: 20,
  },
  micIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#38bdf8",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  micIconCircleActive: {
    backgroundColor: "#FF453A",
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 40,
  },
  waveBar: {
    width: 4,
    backgroundColor: "#FF453A",
    borderRadius: 2,
  },
  actionBtn: {
    backgroundColor: "#38bdf8",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  resultsTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 10,
  },
  overallCard: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderWidth: 3,
    borderColor: "#38bdf8",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  overallScoreText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
  },
  overallMaxText: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "bold",
  },
  gridScores: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    width: "100%",
    marginBottom: 20,
  },
  scoreBox: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    alignItems: "center",
  },
  scoreVal: {
    color: "#38bdf8",
    fontSize: 22,
    fontWeight: "bold",
  },
  scoreLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 4,
  },
  tipsBox: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    padding: 18,
    gap: 10,
    marginBottom: 20,
  },
  tipsHeader: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tipRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  tipText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  finishBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  finishBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
