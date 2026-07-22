import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Question } from "@/models/question";
import GeometryFigureView from "./GeometryFigureView";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface QuestionViewProps {
  question: Question;
  timerValue: number;
  hasExtendedCritWindow?: boolean;
  onAnswerSelected: (index: number) => void;
}

export default function QuestionView({
  question,
  timerValue,
  hasExtendedCritWindow = false,
  onAnswerSelected
}: QuestionViewProps) {
  const appLanguage = useGameStore((state) => state.appLanguage);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isShowingFeedback, setIsShowingFeedback] = useState(false);

  const handleTap = (index: number) => {
    setSelectedIndex(index);
    setIsShowingFeedback(true);

    // Provide 0.8s visual feedback before triggering callback
    setTimeout(() => {
      onAnswerSelected(index);
      setIsShowingFeedback(false);
      setSelectedIndex(null);
    }, 800);
  };

  const getLetter = (index: number) => {
    switch (index) {
      case 0: return "A";
      case 1: return "B";
      case 2: return "C";
      case 3: return "D";
      default: return "";
    }
  };

  // Button background styles
  const getButtonBg = (index: number) => {
    if (!isShowingFeedback) return "rgba(255, 255, 255, 0.04)";
    if (index === question.correctAnswerIndex) return "rgba(48, 209, 88, 0.2)"; // Green success
    if (index === selectedIndex) return "rgba(255, 69, 58, 0.2)"; // Red error
    return "rgba(255, 255, 255, 0.02)";
  };

  // Button border styles
  const getButtonBorder = (index: number) => {
    if (!isShowingFeedback) return "rgba(255, 255, 255, 0.08)";
    if (index === question.correctAnswerIndex) return "#30D158";
    if (index === selectedIndex) return "#FF453A";
    return "rgba(255, 255, 255, 0.04)";
  };

  // Letter badge color
  const getLetterColor = (index: number) => {
    if (!isShowingFeedback) return "#38bdf8"; // Light cyan accent
    if (index === question.correctAnswerIndex) return "#30D158";
    if (index === selectedIndex) return "#FF453A";
    return "rgba(56, 189, 248, 0.5)";
  };

  // Circular Timer Path details
  const radius = 28;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (timerValue / 15.0) * circumference;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        {/* 1. Circular Timer Widget */}
        <View style={styles.timerContainer}>
          <Svg width={70} height={70} style={styles.timerSvg}>
            {/* Gray Back Circle */}
            <Circle
              cx={35}
              cy={35}
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Active countdown circle */}
            <Circle
              cx={35}
              cy={35}
              r={radius}
              stroke={timerValue > 5 ? "#38bdf8" : "#FF453A"}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              transform="rotate(-90 35 35)"
            />
          </Svg>
          <Text style={[styles.timerText, timerValue <= 5 && { color: "#FF453A" }]}>
            {timerValue}
          </Text>
        </View>

        {/* 2. Subject and Topic Badges */}
        <View style={styles.headerInfo}>
          <View style={styles.subjectBadge}>
            <Text style={styles.subjectBadgeText}>
              {question.subject.toUpperCase()}
            </Text>
          </View>

          {hasExtendedCritWindow && (
            <View style={styles.critBadge}>
              <Ionicons name="flash" size={12} color="#FFD700" />
              <Text style={styles.critBadgeText}>
                {appLanguage === "kk" ? "КРИТ-ТЕРЕЗЕ: 8 СЕК" : "КРИТ-ОКНО: 8 СЕК"}
              </Text>
            </View>
          )}

          {question.topic && (
            <Text style={styles.topicText}>
              {question.topic}
            </Text>
          )}
        </View>

        {/* 3. Question Text Scroll */}
        <ScrollView style={styles.questionTextScroll} contentContainerStyle={styles.questionTextContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.questionText}>
            {question.text}
          </Text>
        </ScrollView>

        {/* 4. Geometry Figure Box */}
        {question.figureType && (
          <View style={styles.figureContainer}>
            <GeometryFigureView
              figureType={question.figureType}
              params={question.figureParams}
            />
          </View>
        )}

        {/* 5. Options Selection list */}
        <View style={styles.optionsList}>
          {question.options.map((option, index) => {
            const btnBg = getButtonBg(index);
            const btnBorder = getButtonBorder(index);
            const letterColor = getLetterColor(index);

            return (
              <Pressable
                key={index}
                disabled={isShowingFeedback}
                onPress={() => handleTap(index)}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: btnBg,
                    borderColor: btnBorder
                  }
                ]}
              >
                <View style={styles.optionRow}>
                  {/* Letter Box (A, B, C, D) */}
                  <View style={[styles.letterBox, { borderColor: letterColor }]}>
                    <Text style={[styles.letterText, { color: letterColor }]}>
                      {getLetter(index)}
                    </Text>
                  </View>

                  <Text style={styles.optionText} numberOfLines={3}>
                    {option}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  card: {
    width: SCREEN_WIDTH - 44,
    backgroundColor: "#111C30",
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
    alignItems: "center",
  },
  timerContainer: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  timerSvg: {
    position: "absolute",
  },
  timerText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerInfo: {
    alignItems: "center",
    marginTop: 14,
    gap: 6,
    width: "100%",
  },
  subjectBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  subjectBadgeText: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  critBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  critBadgeText: {
    color: "#FFD700",
    fontSize: 10,
    fontWeight: "900",
  },
  topicText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
    paddingHorizontal: 10,
  },
  questionTextScroll: {
    maxHeight: 90,
    marginVertical: 12,
    width: "100%",
  },
  questionTextContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 24,
  },
  figureContainer: {
    width: "100%",
    height: 190,
    marginVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  optionsList: {
    width: "100%",
    gap: 10,
    marginTop: 6,
  },
  optionButton: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  letterBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  letterText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
});
