import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";
import { Subject } from "@/models/subject";
import QuestionView from "@/components/QuestionView";
import { QuestionRepository } from "@/services/QuestionRepository";
import { Question } from "@/models/question";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type CoopGameState = "selection" | "story_intro" | "battle" | "victory_story";

export default function CoopGameScreen() {
  const router = useRouter();
  const appLanguage = useGameStore((state) => state.appLanguage);
  const addGold = useGameStore((state) => state.addGold);
  const addTrophies = useGameStore((state) => state.addTrophies);
  const isKazakh = appLanguage === "kk";

  // Game Phase State
  const [gameState, setGameState] = useState<CoopGameState>("selection");
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.math);

  // Battle States
  const [bossHp, setBossHp] = useState(2000);
  const maxBossHp = 2000;
  const [player1Hp, setPlayer1Hp] = useState(300);
  const [player2Hp, setPlayer2Hp] = useState(300);
  const [energy, setEnergy] = useState(6);

  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [questionTimer, setQuestionTimer] = useState(15);

  // Story Act Steps
  const [storyStep, setStoryStep] = useState(0);

  const storyDialogs = [
    {
      speaker: isKazakh ? "Байтерек Рухы" : "Дух Байтерека",
      avatar: "✨",
      text: isKazakh
        ? "Астананың үстін қара бұлт торлады... Тек білім мен бірлік қана бұл қаланы сақтап қала алады!"
        : "Темная тень нависла над Байтереком... Только знание и единство могут спасти наш город!"
    },
    {
      speaker: isKazakh ? "Нұр-Сұлтан Эхосы" : "Эхо Нур-Султана",
      avatar: "🏛️",
      text: isKazakh
        ? "Екі батыр бірге күресуі керек! Біреуі Математиканы, екіншісі Физиканы меңгерген!"
        : "Два героя должны сражаться вместе! Каждый со своим ключевым предметом ЕНТ!"
    }
  ];

  const victoryDialogs = [
    {
      speaker: isKazakh ? "Байтерек Рухы" : "Дух Байтерека",
      avatar: "🏆",
      text: isKazakh
        ? "Жеңіс! Астана қайтадан жарқырауда! Қала оны еске алғандардың жүрегінде мәңгі өмір сүреді..."
        : "Победа! Байтерек снова сияет! Город будет жить, пока жива память о нём в наших сердцах..."
    }
  ];

  // Battle loop (Boss attacks every 4 sec)
  useEffect(() => {
    if (gameState !== "battle") return;

    const interval = setInterval(() => {
      // Boss attacks random player
      const target = Math.random() > 0.5 ? 1 : 2;
      const dmg = Math.floor(Math.random() * 20) + 25;

      if (target === 1) {
        setPlayer1Hp((prev) => {
          const next = Math.max(0, prev - dmg);
          if (next <= 0 && player2Hp <= 0) {
            alert(isKazakh ? "Жеңіліс... Екі батыр да құлады!" : "Поражение... Оба героя пали!");
            setGameState("selection");
          }
          return next;
        });
      } else {
        setPlayer2Hp((prev) => {
          const next = Math.max(0, prev - dmg);
          if (next <= 0 && player1Hp <= 0) {
            alert(isKazakh ? "Жеңіліс... Екі батыр да құлады!" : "Поражение... Оба героя пали!");
            setGameState("selection");
          }
          return next;
        });
      }

      // Restore 1 energy
      setEnergy((prev) => Math.min(10, prev + 1));
    }, 3500);

    return () => clearInterval(interval);
  }, [gameState, player1Hp, player2Hp]);

  const handleStartBattle = () => {
    setGameState("battle");
    setBossHp(2000);
    setPlayer1Hp(300);
    setPlayer2Hp(300);
    setEnergy(6);
  };

  const handlePlayCoopCard = () => {
    if (energy < 2) return;
    const q = QuestionRepository.getRandomQuestion(selectedSubject);
    if (q) {
      setEnergy((prev) => prev - 2);
      setActiveQuestion(q);
      setQuestionTimer(15);
    }
  };

  const handleAnswerQuestion = (index: number) => {
    if (!activeQuestion) return;
    const isCorrect = index === activeQuestion.correctAnswerIndex;

    if (isCorrect) {
      const dmg = Math.floor(Math.random() * 100) + 250; // Massive coop damage
      setBossHp((prev) => {
        const next = Math.max(0, prev - dmg);
        if (next <= 0) {
          // Victory!
          addGold(300);
          addTrophies(50);
          setGameState("victory_story");
        }
        return next;
      });

      // Heal partner a bit
      setPlayer1Hp((prev) => Math.min(300, prev + 25));
      setPlayer2Hp((prev) => Math.min(300, prev + 25));
    }

    setActiveQuestion(null);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0B1220", "#162447"]} style={StyleSheet.absoluteFill} />

      {/* Header Bar */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          <Text style={styles.backText}>{isKazakh ? "Артқа" : "Назад"}</Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          {isKazakh ? "КООПЕРАТИВ" : "КООПЕРАТИВ"}
        </Text>

        <View style={{ width: 60 }} />
      </View>

      {/* PHASE 1: SUBJECT SELECTION */}
      {gameState === "selection" && (
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.titleText}>
            {isKazakh ? "Өз пәніңізді таңдаңыз" : "Выберите свой предмет"}
          </Text>
          <Text style={styles.subTitleText}>
            {isKazakh
              ? "Әр ойыншы деңгейді өту үшін өз пәнінен есептер шығарады"
              : "Каждый игрок решает задачи по своему предмету для командной победы над боссом!"}
          </Text>

          <View style={styles.subjectList}>
            {[Subject.math, Subject.physics, Subject.history, Subject.biology, Subject.chemistry].map((sub) => {
              const isSel = selectedSubject === sub;
              return (
                <Pressable
                  key={sub}
                  onPress={() => setSelectedSubject(sub)}
                  style={[styles.subjectCard, isSel && styles.subjectCardSelected]}
                >
                  <View style={styles.subjectIconBox}>
                    <Ionicons name="sparkles" size={24} color={isSel ? "#FFD700" : "#38bdf8"} />
                  </View>
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{sub.toUpperCase()}</Text>
                    <Text style={styles.subjectDesc}>
                      {isKazakh ? "Командалық көмек ⚡" : "Командная поддержка ⚡"}
                    </Text>
                  </View>
                  {isSel && <Ionicons name="checkmark-circle" size={24} color="#FFD700" />}
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={() => setGameState("story_intro")} style={styles.startButton}>
            <LinearGradient colors={["#FF9500", "#D2783C"]} style={styles.btnGradient}>
              <Text style={styles.startButtonText}>
                {isKazakh ? "ШАЙҚАСТЫ БАСТАУ" : "НАЧАТЬ БИТВУ"}
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      )}

      {/* PHASE 2: STORY INTRO */}
      {gameState === "story_intro" && (
        <View style={styles.storyOverlay}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogAvatar}>{storyDialogs[storyStep].avatar}</Text>
            <Text style={styles.dialogSpeaker}>{storyDialogs[storyStep].speaker}</Text>
            <Text style={styles.dialogText}>{storyDialogs[storyStep].text}</Text>

            <Pressable
              onPress={() => {
                if (storyStep < storyDialogs.length - 1) {
                  setStoryStep((prev) => prev + 1);
                } else {
                  handleStartBattle();
                }
              }}
              style={styles.dialogButton}
            >
              <Text style={styles.dialogButtonText}>
                {storyStep < storyDialogs.length - 1
                  ? (isKazakh ? "ЖАЛҒАСТЫРУ" : "ПРОДОЛЖИТЬ")
                  : (isKazakh ? "БІРГЕ ШАЙҚАСУ!" : "В БОЙ ВМЕСТЕ!")}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* PHASE 3: COOP BATTLE */}
      {gameState === "battle" && (
        <View style={styles.battleContainer}>
          {/* Boss Bar */}
          <View style={styles.bossCard}>
            <Text style={styles.bossEmoji}>👾</Text>
            <Text style={styles.bossName}>
              {isKazakh ? "АСТАНА ТЕҢІЗ ДЕМОНЫ" : "КОСМИЧЕСКИЙ ДЕМОН БАЙТЕРЕКА"}
            </Text>
            <View style={styles.hpBarBg}>
              <View style={[styles.hpBarFill, { width: `${(bossHp / maxBossHp) * 100}%`, backgroundColor: "#FF3B30" }]} />
            </View>
            <Text style={styles.bossHpText}>{bossHp} / {maxBossHp} HP</Text>
          </View>

          {/* Players Row */}
          <View style={styles.playersRow}>
            {/* Player 1 */}
            <View style={styles.playerCard}>
              <Text style={styles.playerEmoji}>🛡️</Text>
              <Text style={styles.playerName}>{isKazakh ? "Игрок 1 (Сіз)" : "Игрок 1 (Вы)"}</Text>
              <View style={styles.hpBarBg}>
                <View style={[styles.hpBarFill, { width: `${(player1Hp / 300) * 100}%`, backgroundColor: "#00E87A" }]} />
              </View>
              <Text style={styles.playerHpText}>{player1Hp}/300 HP</Text>
            </View>

            {/* Player 2 AI */}
            <View style={styles.playerCard}>
              <Text style={styles.playerEmoji}>⚔️</Text>
              <Text style={styles.playerName}>{isKazakh ? "Игрок 2 (Напарник)" : "Игрок 2 (Напарник)"}</Text>
              <View style={styles.hpBarBg}>
                <View style={[styles.hpBarFill, { width: `${(player2Hp / 300) * 100}%`, backgroundColor: "#38bdf8" }]} />
              </View>
              <Text style={styles.playerHpText}>{player2Hp}/300 HP</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsBox}>
            <View style={styles.energyRow}>
              <Ionicons name="flash" size={20} color="#FFD700" />
              <Text style={styles.energyText}>{isKazakh ? `Энергия: ${energy}/10` : `Энергия: ${energy}/10`}</Text>
            </View>

            <Pressable
              disabled={energy < 2 || !!activeQuestion}
              onPress={handlePlayCoopCard}
              style={[styles.attackCardButton, energy < 2 && { opacity: 0.5 }]}
            >
              <Ionicons name="flash" size={24} color="#FFD700" />
              <Text style={styles.attackCardText}>
                {isKazakh ? "СӨРАҚПЕН ШАБУЫЛ ЖАСАУ (2 ⚡)" : "КОМБО-АТАКА ВОПРОСОМ (2 ⚡)"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* PHASE 4: VICTORY EPILOGUE */}
      {gameState === "victory_story" && (
        <View style={styles.storyOverlay}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogAvatar}>{victoryDialogs[0].avatar}</Text>
            <Text style={styles.dialogSpeaker}>{victoryDialogs[0].speaker}</Text>
            <Text style={styles.dialogText}>{victoryDialogs[0].text}</Text>

            <View style={styles.rewardBadge}>
              <Text style={styles.rewardText}>+300 💰 Золота  |  +50 🏆 Трофеев</Text>
            </View>

            <Pressable onPress={() => router.back()} style={styles.dialogButton}>
              <Text style={styles.dialogButtonText}>
                {isKazakh ? "МӘЗІРГЕ ОРАЛУ" : "В ГЛАВНОЕ МЕНЮ"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ACTIVE QUESTION OVERLAY */}
      {activeQuestion && (
        <QuestionView
          question={activeQuestion}
          timerValue={questionTimer}
          onAnswerSelected={handleAnswerQuestion}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
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
  scrollArea: {
    flex: 1,
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
  subTitleText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  subjectList: {
    width: "100%",
    gap: 12,
    marginVertical: 24,
  },
  subjectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    gap: 14,
  },
  subjectCardSelected: {
    borderColor: "#FFD700",
    backgroundColor: "rgba(255, 215, 0, 0.08)",
  },
  subjectIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  subjectDesc: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginTop: 2,
  },
  startButton: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 10,
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  storyOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 50,
  },
  dialogCard: {
    width: "100%",
    backgroundColor: "#162447",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    padding: 24,
    alignItems: "center",
  },
  dialogAvatar: {
    fontSize: 48,
    marginBottom: 8,
  },
  dialogSpeaker: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  dialogText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  dialogButton: {
    backgroundColor: "#FF9500",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },
  dialogButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  rewardBadge: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  rewardText: {
    color: "#FFD700",
    fontSize: 13,
    fontWeight: "bold",
  },
  battleContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  bossCard: {
    backgroundColor: "rgba(255, 69, 58, 0.12)",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255, 69, 58, 0.4)",
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  bossEmoji: {
    fontSize: 40,
  },
  bossName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginVertical: 6,
  },
  hpBarBg: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 4,
  },
  hpBarFill: {
    height: "100%",
  },
  bossHpText: {
    color: "#FF453A",
    fontSize: 11,
    fontWeight: "bold",
  },
  playersRow: {
    flexDirection: "row",
    gap: 12,
  },
  playerCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 14,
    alignItems: "center",
  },
  playerEmoji: {
    fontSize: 28,
  },
  playerName: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
    marginVertical: 4,
  },
  playerHpText: {
    color: "#00E87A",
    fontSize: 10,
    fontWeight: "bold",
  },
  controlsBox: {
    backgroundColor: "#162447",
    borderRadius: 24,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  energyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  energyText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
  },
  attackCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF9500",
    paddingVertical: 14,
    borderRadius: 16,
  },
  attackCardText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
});
