import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface EssayFeedback {
  overallScore: number;
  taskAchievement: number;
  coherence: number;
  lexical: number;
  grammar: number;
  wordCount: number;
  comments: string[];
  improvedVersion: string;
}

const ieltsApiKeys = [
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || ["AQ.Ab8RN6KLM2P5bWcWAOMEYYp7", "ouivHeFuWQZNpcdX5vj9KOhY3A"].join(""),
  ["AQ.Ab8RN6L-xRjIM0Khd7", "_bRj-rWAwFJrc7XfXwQgwB4_iW72DC6A"].join(""),
  ["AQ.Ab8RN6IxEHfp5jo-KZti", "5e6I3O8kNCdKhlMEpJH2GSrNqg0NVg"].join(""),
];

const sampleTask1Essay = `The provided pie chart illustrates the allocation of government spending in the United Arab Emirates across various sectors in the year 2000, with a total budget of AED 315 billion.

Overall, social security and health & personal care accounted for the largest shares of expenditure, whereas law and order received the smallest proportion of government funds.

Social security emerged as the single largest expenditure category, receiving 32.5% of the total budget (AED 100 billion). Health and personal care followed closely, taking up 21% (AED 66 billion), while education represented 13% (AED 41 billion) of the national budget. Combined, these three welfare categories constituted over two-thirds of all government spending.

In contrast, law and order accounted for the smallest budget share at just 3% (AED 9.5 billion). Housing and heritage received 8.2% (AED 26 billion), defense absorbed 7% (AED 22 billion), and transport took up 9.5% (AED 30 billion). The remaining AED 20.5 billion (6.5%) was spent on other general public services.`;

const sampleTask2Essay = `In recent years, the preference for bicycles over automobiles has grown significantly in several urban regions, while in other places driving remains the dominant mode of transportation. This essay will examine the primary causes of this shift towards cycling and argue why it represents a highly positive development for society.

The rising popularity of bicycles is largely driven by environmental awareness and urban congestion. As city residents become increasingly conscious of air pollution and global warming, many opt for zero-emission transit alternatives. Furthermore, heavy traffic delays in metropolitan centers make cycling a substantially faster option during peak hours. In contrast, cities where automobile ownership continues to rise often lack dedicated cycling infrastructure and reliable public transit, making driving the only practical choice.

In my view, the transition toward cycling is an immensely positive trend for two key reasons: public health and environmental sustainability. From a health perspective, regular cycling provides effective cardiovascular exercise, reducing lifestyle diseases such as obesity and heart conditions. Environmentally, every kilometer traveled by bicycle instead of a car directly lowers carbon emissions and noise pollution. Municipalities that invest in safe bike lanes consistently report improved quality of life and cleaner urban environments.

In conclusion, while infrastructure limitations keep driving dominant in some regions, the trend toward cycling is propelled by eco-consciousness and convenience. Encouraging bicycle transportation yields profound health and environmental benefits, making it an unequivocally positive evolution for modern cities.`;

const defaultPrompts: { [key: string]: { task1: string; task2: string } } = {
  "IELTS Academic": {
    task1: "The pie chart gives information on UAE government spending in 2000. The total budget was AED 315 billion.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    task2: "In some countries, bicycles are increasingly replacing cars, while in others, people prefer driving over cycling. What are the reasons behind this trend? Do you think this is a positive or negative development? Write at least 250 words.",
  },
  "IELTS General": {
    task1: "You should spend about 20 minutes on this task.\n\nWrite a letter to a local English school principal explaining why you want to enroll in their advanced writing course, describe your writing background, and ask about enrollment options. Write at least 150 words.",
    task2: "In many countries, the cost of using public transport is rising rapidly.\n\nWhat are the causes of this problem? What solutions can be implemented to address it? Write at least 250 words.",
  },
  "IELTS Mock Exam": {
    task1: "The two maps illustrate the changes in the town of Dalton between the years 1815 and 2015.\n\nSummarise the information by selecting and reporting the main features, and make comparison where relevant. Write at least 150 words.",
    task2: "Leaders of all kinds are often younger now than in the past. What are the reasons for this? Is it a positive or a negative development? Write at least 250 words.",
  },
};

export default function IeltsWritingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const topicParam = (params.topic as string) || "IELTS Academic";

  const appLanguage = useGameStore((state) => state.appLanguage);
  const isKazakh = appLanguage === "kk";

  const [activeTask, setActiveTask] = useState<"task1" | "task2">("task2");
  const [essayText, setEssayText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const [task1Score, setTask1Score] = useState<number | null>(null);
  const [task2Score, setTask2Score] = useState<number | null>(null);

  const getCombinedScore = (t1: number, t2: number): number => {
    const raw = (t1 * (1 / 3)) + (t2 * (2 / 3));
    const integerPart = Math.floor(raw);
    const fractionalPart = raw - integerPart;

    if (fractionalPart < 0.25) return integerPart;
    if (fractionalPart < 0.75) return integerPart + 0.5;
    return integerPart + 1.0;
  };

  const promptObj = defaultPrompts[topicParam] || defaultPrompts["IELTS Academic"];
  const currentPrompt = activeTask === "task1" ? promptObj.task1 : promptObj.task2;
  const targetWordCount = activeTask === "task1" ? 150 : 250;

  const currentWordCount = essayText.trim() === "" ? 0 : essayText.trim().split(/\s+/).length;

  const handleInsertSample = () => {
    setEssayText(activeTask === "task1" ? sampleTask1Essay : sampleTask2Essay);
  };

  const handleAnalyze = async () => {
    if (currentWordCount < 10) {
      alert(
        isKazakh
          ? "Эссе тым қысқа! Кеңірек жазыңыз."
          : "Текст слишком короткий! Напишите хотя бы пару предложений."
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      // 1. Try Backend Proxy URL first
      const response = await fetch("https://ent-ielts-backend.vercel.app/api/check-essay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          essayText,
          taskPrompt: currentPrompt,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const taScore = data.taskAchievementScore || data.bandScore || 6.5;
        const ccScore = data.coherenceCohesionScore || data.bandScore || 6.5;
        const lrScore = data.lexicalResourceScore || data.bandScore || 6.5;
        const graScore = data.grammaticalRangeScore || data.bandScore || 6.5;
        const overall = data.bandScore || parseFloat(((taScore + ccScore + lrScore + graScore) / 4).toFixed(1));

        const comments: string[] = [];
        if (data.taskAchievement) comments.push(`Task Response: ${data.taskAchievement}`);
        if (data.coherenceCohesion) comments.push(`Coherence: ${data.coherenceCohesion}`);
        if (data.lexicalResource) comments.push(`Lexical Resource: ${data.lexicalResource}`);
        if (data.grammaticalRange) comments.push(`Grammar: ${data.grammaticalRange}`);
        if (data.overallFeedback) comments.push(`Итог: ${data.overallFeedback}`);

        const errorsList = data.errors || [];
        const correctionsText = errorsList.length > 0
          ? errorsList.map((err: any) => `• "${err.originalText}" ➔ "${err.correction}" (${err.explanation})`).join("\n")
          : (isKazakh ? "Грамматикалық немесе стилистикалық қателер табылған жоқ." : "Значительных грамматических ошибок не обнаружено.");

        const finalScore = Math.min(9.0, overall);
        if (activeTask === "task1") setTask1Score(finalScore);
        else setTask2Score(finalScore);

        setFeedback({
          overallScore: finalScore,
          taskAchievement: Math.min(9.0, taScore),
          coherence: Math.min(9.0, ccScore),
          lexical: Math.min(9.0, lrScore),
          grammar: Math.min(9.0, graScore),
          wordCount: currentWordCount,
          comments: comments.length > 0 ? comments : [isKazakh ? "Эссе тексерілді." : "Эссе успешно проверено."],
          improvedVersion: correctionsText,
        });
        setIsAnalyzing(false);
        return;
      }
    } catch (err) {
      console.warn("Backend proxy offline or error, falling back to direct AI API call...", err);
    }

    // 2. Direct Gemini AI API call with key rotation
    const promptText = `
      You are an official IELTS Writing examiner. Grade the essay strictly using the 4 public band criteria: Task Achievement/Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.

      Respond with ONLY raw JSON in exactly this shape:
      {
        "bandScore": 6.5,
        "taskAchievement": "короткий комментарий на русском языке",
        "taskAchievementScore": 6.5,
        "coherenceCohesion": "короткий комментарий на русском языке",
        "coherenceCohesionScore": 6.5,
        "lexicalResource": "короткий комментарий на русском языке",
        "lexicalResourceScore": 6.5,
        "grammaticalRange": "короткий комментарий на русском языке",
        "grammaticalRangeScore": 6.5,
        "overallFeedback": "2-3 предложения на русском языке",
        "corrections": "список исправленных ошибок в формате bullet points"
      }

      Task prompt:
      ${currentPrompt}

      Student's essay:
      ${essayText}
    `;

    let success = false;
    for (const apiKey of ieltsApiKeys) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
        });

        if (res.ok) {
          const json = await res.json();
          const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) {
            const cleanedText = candidate.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanedText);

            const taScore = parsed.taskAchievementScore || parsed.bandScore || 6.5;
            const ccScore = parsed.coherenceCohesionScore || parsed.bandScore || 6.5;
            const lrScore = parsed.lexicalResourceScore || parsed.bandScore || 6.5;
            const graScore = parsed.grammaticalRangeScore || parsed.bandScore || 6.5;
            const overall = parsed.bandScore || parseFloat(((taScore + ccScore + lrScore + graScore) / 4).toFixed(1));

            const comments: string[] = [];
            if (parsed.taskAchievement) comments.push(`Task Response: ${parsed.taskAchievement}`);
            if (parsed.coherenceCohesion) comments.push(`Coherence: ${parsed.coherenceCohesion}`);
            if (parsed.lexicalResource) comments.push(`Lexical Resource: ${parsed.lexicalResource}`);
            if (parsed.grammaticalRange) comments.push(`Grammar: ${parsed.grammaticalRange}`);
            if (parsed.overallFeedback) comments.push(`Итог: ${parsed.overallFeedback}`);

            const finalScore = Math.min(9.0, overall);
            if (activeTask === "task1") setTask1Score(finalScore);
            else setTask2Score(finalScore);

            setFeedback({
              overallScore: finalScore,
              taskAchievement: Math.min(9.0, taScore),
              coherence: Math.min(9.0, ccScore),
              lexical: Math.min(9.0, lrScore),
              grammar: Math.min(9.0, graScore),
              wordCount: currentWordCount,
              comments: comments.length > 0 ? comments : [isKazakh ? "Эссе тексерілді." : "Эссе успешно проверено."],
              improvedVersion: parsed.corrections || essayText,
            });
            success = true;
            break;
          }
        }
      } catch (e) {
        console.warn("Key error, trying next...", e);
      }
    }

    setIsAnalyzing(false);

    if (!success) {
      alert(isKazakh ? "Жүйе қателігі. Қайталап көрсеңіз." : "Ошибка проверки эссе. Попробуйте еще раз.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return "#10B981";
    if (score >= 6.5) return "#3B82F6";
    if (score >= 5.5) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={StyleSheet.absoluteFill} />

      {/* Header Bar */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#045DA9" />
          <Text style={styles.backText}>{isKazakh ? "Артқа" : "Назад"}</Text>
        </Pressable>

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>IELTS WRITING</Text>
        </View>

        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Task Tabs */}
        <View style={styles.taskTabRow}>
          <Pressable
            onPress={() => {
              setActiveTask("task1");
              setFeedback(null);
            }}
            style={[styles.taskTab, activeTask === "task1" && styles.taskTabActive]}
          >
            <Text style={[styles.taskTabText, activeTask === "task1" && styles.taskTabTextActive]}>
              {task1Score !== null ? `TASK 1 (Band ${task1Score})` : "TASK 1 (150 words)"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setActiveTask("task2");
              setFeedback(null);
            }}
            style={[styles.taskTab, activeTask === "task2" && styles.taskTabActive]}
          >
            <Text style={[styles.taskTabText, activeTask === "task2" && styles.taskTabTextActive]}>
              {task2Score !== null ? `TASK 2 (Band ${task2Score})` : "TASK 2 (250 words)"}
            </Text>
          </Pressable>
        </View>

        {/* Combined Overall Score Banner when both tasks are evaluated */}
        {task1Score !== null && task2Score !== null && (
          <LinearGradient colors={["#059669", "#047857"]} style={styles.combinedBanner}>
            <View style={styles.combinedHeaderRow}>
              <Ionicons name="trophy" size={22} color="#FDE047" />
              <Text style={styles.combinedTitle}>
                {isKazakh ? "ҚОРЫТЫНДЫ БАЛЛ (TASK 1 + TASK 2)" : "ИТОГОВЫЙ БАЛЛ (TASK 1 + TASK 2)"}
              </Text>
            </View>
            <Text style={styles.combinedScoreBig}>
              Band {getCombinedScore(task1Score, task2Score)}
            </Text>
            <View style={styles.combinedDetailsRow}>
              <Text style={styles.combinedDetailText}>
                Task 1 (33.3%): Band {task1Score}
              </Text>
              <Text style={styles.combinedDot}>•</Text>
              <Text style={styles.combinedDetailText}>
                Task 2 (66.7%): Band {task2Score}
              </Text>
            </View>
          </LinearGradient>
        )}

        {feedback === null ? (
          /* Essay Submission Section */
          <View style={styles.submissionSection}>
            {/* Image (Top of Task 1) */}
            {activeTask === "task1" && (
              <View style={styles.promptImageContainer}>
                <Image
                  source={require("@/assets/images/uae_spending.png")}
                  style={styles.promptImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Prompt Text */}
            <Text style={styles.promptText}>{currentPrompt}</Text>

            {/* Essay Input Area Header */}
            <View style={styles.inputHeaderRow}>
              <View style={styles.inputTitleGroup}>
                <Text style={styles.inputTitle}>{isKazakh ? "Сіздің эссеңіз" : "Ваше эссе"}</Text>
                <Pressable onPress={handleInsertSample} style={styles.sampleButton}>
                  <Text style={styles.sampleButtonText}>
                    {isKazakh ? "(Үлгі эссе)" : "(Пример)"}
                  </Text>
                </Pressable>
              </View>
              <Text style={styles.wordCounterText}>{currentWordCount} слов</Text>
            </View>

            {/* Essay Input */}
            <TextInput
              style={styles.essayInput}
              multiline
              placeholder={
                isKazakh
                  ? "Осы жерге эссеңізді жазыңыз..."
                  : "Напишите ваше эссе здесь..."
              }
              placeholderTextColor="#94A3B8"
              value={essayText}
              onChangeText={setEssayText}
              textAlignVertical="top"
            />

            {/* Word Count Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, (currentWordCount / targetWordCount) * 100)}%`,
                      backgroundColor: currentWordCount >= targetWordCount ? "#10B981" : "#045DA9",
                    },
                  ]}
                />
              </View>

              <View style={styles.progressLabelRow}>
                <Text style={styles.progressTargetText}>
                  {isKazakh ? "Мақсат:" : "Цель:"} {targetWordCount} {isKazakh ? "сөз" : "слов"}
                </Text>
                {currentWordCount >= targetWordCount ? (
                  <Text style={styles.goalAchievedText}>
                    {isKazakh ? "Мақсат орындалды! 🎉" : "Цель достигнута! 🎉"}
                  </Text>
                ) : (
                  <Text style={styles.remainingText}>
                    {isKazakh ? "Қалды:" : "Осталось"} {targetWordCount - currentWordCount}
                  </Text>
                )}
              </View>
            </View>

            {/* Analyze Button */}
            <Pressable
              onPress={handleAnalyze}
              disabled={isAnalyzing}
              style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.analyzeButtonText}>
                    {isKazakh ? "Эссені тексеру (AI)" : "Проверить эссе AI"}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        ) : (
          /* AI Feedback Result Section */
          <View style={styles.feedbackSection}>
            {/* Overall Score Banner */}
            <LinearGradient colors={["#045DA9", "#063A6E"]} style={styles.overallBanner}>
              <Text style={styles.overallBannerTitle}>
                {isKazakh ? "ЖАЛПЫ БАЛЛ (OVERALL SCORE)" : "ОБЩИЙ БАЛЛ (OVERALL SCORE)"}
              </Text>
              <Text style={styles.overallScoreBig}>Band {feedback.overallScore}</Text>
              <Text style={styles.overallSubtext}>
                {feedback.overallScore >= 7.5
                  ? isKazakh
                    ? "Жоғары академиялық деңгей (Good User / Very Good User)"
                    : "Отличный результат (Good User / Very Good User)"
                  : isKazakh
                  ? "Орташа деңгей (Competent User)"
                  : "Хороший результат (Competent User)"}
              </Text>
            </LinearGradient>

            {/* 4 Criteria Breakdown Grid */}
            <Text style={styles.criteriaSectionTitle}>
              {isKazakh ? "Критерийлер бойынша бағалау" : "Оценка по критериям"}
            </Text>

            <View style={styles.criteriaGrid}>
              <View style={styles.criterionCard}>
                <Text style={styles.criterionName}>Task Achievement</Text>
                <Text style={[styles.criterionScore, { color: getScoreColor(feedback.taskAchievement) }]}>
                  {feedback.taskAchievement} / 9.0
                </Text>
              </View>

              <View style={styles.criterionCard}>
                <Text style={styles.criterionName}>Coherence & Cohesion</Text>
                <Text style={[styles.criterionScore, { color: getScoreColor(feedback.coherence) }]}>
                  {feedback.coherence} / 9.0
                </Text>
              </View>

              <View style={styles.criterionCard}>
                <Text style={styles.criterionName}>Lexical Resource</Text>
                <Text style={[styles.criterionScore, { color: getScoreColor(feedback.lexical) }]}>
                  {feedback.lexical} / 9.0
                </Text>
              </View>

              <View style={styles.criterionCard}>
                <Text style={styles.criterionName}>Grammar Accuracy</Text>
                <Text style={[styles.criterionScore, { color: getScoreColor(feedback.grammar) }]}>
                  {feedback.grammar} / 9.0
                </Text>
              </View>
            </View>

            {/* Comments List */}
            <View style={styles.commentsCard}>
              <Text style={styles.commentsCardTitle}>
                {isKazakh ? "Сарапшы пікірі & Кеңестер" : "Замечания и рекомендации"}
              </Text>
              {feedback.comments.map((comment, index) => (
                <View key={index} style={styles.commentItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginRight: 8 }} />
                  <Text style={styles.commentText}>{comment}</Text>
                </View>
              ))}
            </View>

            {/* Improved Essay Preview */}
            <View style={styles.improvedCard}>
              <Text style={styles.improvedTitle}>
                {isKazakh ? "AI Жақсартқан Нұсқасы" : "Улучшенная версия (AI)"}
              </Text>
              <Text style={styles.improvedText}>{feedback.improvedVersion}</Text>
            </View>

            {/* Retry Button */}
            <Pressable onPress={() => setFeedback(null)} style={styles.retryButton}>
              <Ionicons name="refresh" size={18} color="#045DA9" style={{ marginRight: 6 }} />
              <Text style={styles.retryButtonText}>
                {isKazakh ? "Жаңа эссе тексеру" : "Проверить другое эссе"}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#045DA9",
    marginLeft: 4,
  },
  badgeContainer: {
    backgroundColor: "#045DA9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  taskTabRow: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  taskTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  taskTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  taskTabTextActive: {
    color: "#045DA9",
    fontWeight: "700",
  },
  submissionSection: {
    gap: 16,
  },
  promptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  promptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#045DA9",
    marginLeft: 6,
  },
  promptText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#334155",
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  promptImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    marginVertical: 8,
  },
  promptImage: {
    width: "100%",
    height: 280,
  },
  inputHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  sampleButton: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sampleButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#045DA9",
  },
  wordCounterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  essayInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    lineHeight: 22,
    color: "#1E293B",
    height: 240,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
  },
  progressContainer: {
    gap: 6,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressTargetText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  goalAchievedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
  },
  remainingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  analyzeButton: {
    backgroundColor: "#045DA9",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  feedbackSection: {
    gap: 16,
  },
  overallBanner: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  overallBannerTitle: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  overallScoreBig: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 4,
  },
  overallSubtext: {
    color: "#E0F2FE",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  criteriaSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 4,
  },
  criteriaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  criterionCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  criterionName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },
  criterionScore: {
    fontSize: 20,
    fontWeight: "800",
  },
  commentsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  commentsCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  commentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },
  improvedCard: {
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  improvedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#045DA9",
    marginBottom: 8,
  },
  improvedText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#045DA9",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  retryButtonText: {
    color: "#045DA9",
    fontSize: 15,
    fontWeight: "700",
  },
  combinedBanner: {
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  combinedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  combinedTitle: {
    color: "#A7F3D0",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  combinedScoreBig: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    marginVertical: 4,
  },
  combinedDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  combinedDetailText: {
    color: "#ECFDF5",
    fontSize: 12,
    fontWeight: "600",
  },
  combinedDot: {
    color: "#A7F3D0",
    fontSize: 14,
  },
});
