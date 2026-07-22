import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";
import QuestionView from "@/components/QuestionView";
import BattleArenaSceneView from "@/components/BattleArenaSceneView";
import { QuestionRepository } from "@/services/QuestionRepository";
import { Question } from "@/models/question";
import { Subject } from "@/models/subject";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Tower {
  id: string;
  type: "king" | "side";
  maxHp: number;
  hp: number;
  isShielded: boolean;
}

export default function BattleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const subjectParam = (params.subject as string) || "math";
  const topicParam = (params.topic as string) || "";

  const appLanguage = useGameStore((state) => state.appLanguage);
  const gold = useGameStore((state) => state.userGold);
  const addGold = useGameStore((state) => state.addGold);
  const addTrophies = useGameStore((state) => state.addTrophies);
  const completeTopic = useGameStore((state) => state.completeTopic);
  const storeHeroes = useGameStore((state) => state.heroes);

  // 1. Tower States
  const [playerTowers, setPlayerTowers] = useState<Tower[]>([
    { id: "p0", type: "side", maxHp: 300, hp: 300, isShielded: false }, // Left
    { id: "p1", type: "king", maxHp: 500, hp: 500, isShielded: false }, // King
    { id: "p2", type: "side", maxHp: 300, hp: 300, isShielded: false }, // Right
  ]);

  const [enemyTowers, setEnemyTowers] = useState<Tower[]>([
    { id: "e0", type: "side", maxHp: 300, hp: 300, isShielded: false }, // Left
    { id: "e1", type: "king", maxHp: 500, hp: 500, isShielded: false }, // King
    { id: "e2", type: "side", maxHp: 300, hp: 300, isShielded: false }, // Right
  ]);

  // 2. Battle Deck & Resource States
  const [deck, setDeck] = useState(() => {
    // Clone heroes from state and assign active level properties
    return storeHeroes.map((h) => ({
      ...h,
      xp: h.xp || 0,
      isOnCooldown: false,
      cooldownRemaining: 0
    }));
  });

  const [energy, setEnergy] = useState(4);
  const [playerFreezeTicks, setPlayerFreezeTicks] = useState(0);
  const [enemyFreezeTicks, setEnemyFreezeTicks] = useState(0);
  const [hasExtendedCritWindow, setHasExtendedCritWindow] = useState(false);
  const [activePlayerAbilityId, setActivePlayerAbilityId] = useState<string | null>(null);
  const [activeEnemyAbilityId, setActiveEnemyAbilityId] = useState<string | null>(null);

  // 3. Question Flow State
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [activeHeroId, setActiveHeroId] = useState<string | null>(null);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  // 4. Battle Game Loop & AI Tick counters
  const [battleStatus, setBattleStatus] = useState<"active" | "victory" | "defeat">("active");
  const [botAttackTimer, setBotAttackTimer] = useState(6); // bot attacks every 5-8 seconds
  const [hudOpacity] = useState(new Animated.Value(0));

  // Ref to access values in interval loops safely
  const stateRef = useRef({
    energy,
    playerFreezeTicks,
    enemyFreezeTicks,
    botAttackTimer,
    battleStatus,
    activeQuestion,
    deck,
  });

  useEffect(() => {
    stateRef.current = {
      energy,
      playerFreezeTicks,
      enemyFreezeTicks,
      botAttackTimer,
      battleStatus,
      activeQuestion,
      deck,
    };
  }, [energy, playerFreezeTicks, enemyFreezeTicks, botAttackTimer, battleStatus, activeQuestion, deck]);

  // Fade HUD in after 2 seconds
  useEffect(() => {
    Animated.timing(hudOpacity, {
      toValue: 1,
      duration: 800,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Main game tick interval (every 1 second)
  useEffect(() => {
    const gameTimer = setInterval(() => {
      const { 
        battleStatus: curStatus,
        playerFreezeTicks: pFreeze,
        enemyFreezeTicks: eFreeze,
        botAttackTimer: bTimer,
        activeQuestion: actQ,
        deck: curDeck,
        energy: curEnergy
      } = stateRef.current;

      if (curStatus !== "active") {
        clearInterval(gameTimer);
        return;
      }

      // 1. Process player states (if not frozen)
      if (pFreeze > 0) {
        setPlayerFreezeTicks((prev) => prev - 1);
      } else {
        // Increment energy every 3 seconds
        setEnergy((prevEnergy) => {
          if (prevEnergy < 10) {
            // Count ticks in a secondary way or just add fractional/slower increments.
            // Let's add 1 energy every 3 ticks
            return Math.min(10, prevEnergy + 1); // For quick mobile gameplay let's do +1 energy every 2 sec
          }
          return prevEnergy;
        });

        // Decrement card cooldowns
        setDeck((prevDeck) => 
          prevDeck.map((h) => {
            if (h.cooldownRemaining > 0) {
              const nextCd = h.cooldownRemaining - 1;
              return {
                ...h,
                cooldownRemaining: nextCd,
                isOnCooldown: nextCd > 0
              };
            }
            return h;
          })
        );
      }

      // 2. Process active question timer
      if (actQ) {
        setQuestionTimer((prev) => {
          if (prev <= 1) {
            handleQuestionTimeout();
            return 0;
          }
          return prev - 1;
        });
      }

      // 3. Process bot AI attacks
      if (eFreeze > 0) {
        setEnemyFreezeTicks((prev) => prev - 1);
      } else {
        if (!actQ) { // Bot waits while player is answering
          if (bTimer <= 1) {
            triggerBotAttack();
            // Reset bot timer to random (5 to 8)
            setBotAttackTimer(Math.floor(Math.random() * 4) + 5);
          } else {
            setBotAttackTimer((prev) => prev - 1);
          }
        }
      }

    }, 1000);

    return () => clearInterval(gameTimer);
  }, []);

  const handleQuestionTimeout = () => {
    const hId = activeHeroId;
    if (hId) {
      setCooldown(hId, 10); // 10s timeout penalty
    }
    setHasExtendedCritWindow(false);
    setActiveQuestion(null);
    setActiveHeroId(null);
  };

  const setCooldown = (heroId: string, seconds: number) => {
    setDeck((prevDeck) =>
      prevDeck.map((h) => 
        h.id === heroId ? { ...h, cooldownRemaining: seconds, isOnCooldown: seconds > 0 } : h
      )
    );
  };

  // Bot logic
  const triggerBotAttack = () => {
    setActiveEnemyAbilityId("bot_attack");
    setTimeout(() => setActiveEnemyAbilityId(null), 1000);

    // Determine which tower to target (Left -> Right -> King)
    let targetIndex = -1;
    if (playerTowers[0].hp > 0) targetIndex = 0;
    else if (playerTowers[2].hp > 0) targetIndex = 2;
    else if (playerTowers[1].hp > 0) targetIndex = 1;

    if (targetIndex !== -1) {
      const damage = Math.floor(Math.random() * 16) + 30; // 30-45 damage
      setPlayerTowers((prev) => 
        prev.map((t, idx) => {
          if (idx === targetIndex) {
            if (t.isShielded) {
              return { ...t, isShielded: false };
            } else {
              const nextHp = Math.max(0, t.hp - damage);
              if (idx === 1 && nextHp <= 0) {
                setBattleStatus("defeat");
                addTrophies(-10); // lose 10 trophies
              }
              return { ...t, hp: nextHp };
            }
          }
          return t;
        })
      );
    }
  };

  const playCard = (heroId: string, subject: Subject, cost: number) => {
    if (playerFreezeTicks > 0) return;
    if (activeQuestion) return;
    if (energy < cost) return;

    // Load random question from repository
    const question = QuestionRepository.getRandomQuestion(subject, topicParam || undefined);
    if (question) {
      setEnergy((prev) => prev - cost);
      setActiveHeroId(heroId);
      setActiveQuestion(question);
      setQuestionTimer(15);
      setQuestionStartTime(Date.now());
    } else {
      alert("Нет доступных вопросов по этой теме!");
    }
  };

  const submitAnswer = (optionIndex: number) => {
    if (!activeQuestion || !activeHeroId) return;

    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isCorrect = optionIndex === activeQuestion.correctAnswerIndex;
    const hero = deck.find((h) => h.id === activeHeroId)!;

    if (isCorrect) {
      // Calculate damage: baseDamage + speedBonus
      let speedBonus = 0;
      const threshold = hasExtendedCritWindow ? 8.0 : 4.0;
      if (timeTaken <= threshold) {
        speedBonus = Math.round(hero.baseDamage * 0.3); // +30% crit damage
      }
      
      const levelMultiplier = 1.0 + (hero.level - 1) * 0.1;
      const baseDmg = Math.round((hero.baseDamage + speedBonus) * levelMultiplier);

      applyHeroAbility(hero.id, baseDmg);
      addXPHero(hero.id, 25);
    } else {
      // Penalty cooldown
      setCooldown(hero.id, 10);
    }

    setHasExtendedCritWindow(false);
    setActiveQuestion(null);
    setActiveHeroId(null);
  };

  const addXPHero = (heroId: string, amount: number) => {
    setDeck((prevDeck) => 
      prevDeck.map((h) => {
        if (h.id === heroId) {
          let nextXp = h.xp + amount;
          let nextLvl = h.level;
          if (nextXp >= 100) {
            nextXp -= 100;
            nextLvl += 1;
          }
          return { ...h, xp: nextXp, level: nextLvl };
        }
        return h;
      })
    );
  };

  // Ability applications
  const applyHeroAbility = (heroId: string, damage: number) => {
    setActivePlayerAbilityId(heroId);
    setTimeout(() => setActivePlayerAbilityId(null), 1000);

    // 1. MATH (h1) - Split damage to all towers
    if (heroId === "math") {
      const splitDamage = Math.max(5, Math.round(damage / 2));
      setEnemyTowers((prev) => 
        prev.map((t) => {
          if (t.hp > 0) {
            if (t.isShielded) return { ...t, isShielded: false };
            const nextHp = Math.max(0, t.hp - splitDamage);
            if (t.type === "king" && nextHp <= 0) handleVictory();
            return { ...t, hp: nextHp };
          }
          return t;
        })
      );
      return;
    }

    // 2. HISTORY (h2) - Freeze enemy bot
    if (heroId === "history") {
      setEnemyFreezeTicks(5);
    }

    // 3. READING (h3) - Next turn extended critical window
    if (heroId === "reading") {
      setHasExtendedCritWindow(true);
    }

    // 4. LOGIC (h4) - Shield lowest HP player tower
    if (heroId === "logic") {
      setPlayerTowers((prev) => {
        let lowestIdx = -1;
        let lowestHp = 9999;
        prev.forEach((t, i) => {
          if (t.hp > 0 && t.hp < lowestHp) {
            lowestHp = t.hp;
            lowestIdx = i;
          }
        });
        if (lowestIdx !== -1) {
          return prev.map((t, i) => i === lowestIdx ? { ...t, isShielded: true } : t);
        }
        return prev;
      });
    }

    // 5. PHYSICS (h5) - Critical 1.4x damage
    let finalDamage = damage;
    if (heroId === "physics") {
      finalDamage = Math.round(damage * 1.4);
    }

    // 6. CHEMISTRY (h6) - Destroy shield and attack
    if (heroId === "chemistry") {
      // Find target tower first, destroy shield and apply damage
      let targetIdx = getEnemyTargetIndex();
      if (targetIdx !== -1) {
        setEnemyTowers((prev) => 
          prev.map((t, idx) => {
            if (idx === targetIdx) {
              const dmg = t.isShielded ? damage : Math.round(damage * 1.3);
              const nextHp = Math.max(0, t.hp - dmg);
              if (t.type === "king" && nextHp <= 0) handleVictory();
              return { ...t, isShielded: false, hp: nextHp };
            }
            return t;
          })
        );
        checkGameStatusLocal();
        return;
      }
    }

    // 7. BIOLOGY (h7) - Heal lowest HP player tower +50
    if (heroId === "biology") {
      setPlayerTowers((prev) => {
        let lowestIdx = -1;
        let lowestHp = 9999;
        prev.forEach((t, i) => {
          if (t.hp > 0 && t.hp < lowestHp) {
            lowestHp = t.hp;
            lowestIdx = i;
          }
        });
        if (lowestIdx !== -1) {
          return prev.map((t, i) => i === lowestIdx ? { ...t, hp: Math.min(t.maxHp, t.hp + 50) } : t);
        }
        return prev;
      });
    }

    // 8. GEOGRAPHY (h8) - Earthquake 20 damage to all towers
    if (heroId === "geography") {
      setEnemyTowers((prev) => 
        prev.map((t) => {
          if (t.hp > 0) {
            if (t.isShielded) return { ...t, isShielded: false };
            const nextHp = Math.max(0, t.hp - 20);
            if (t.type === "king" && nextHp <= 0) handleVictory();
            return { ...t, hp: nextHp };
          }
          return t;
        })
      );
    }

    // 9. LINGUIST (h9) - Restore 1 energy
    if (heroId === "linguist") {
      setEnergy((prev) => Math.min(10, prev + 1));
    }

    // Standard Attack (attacks Left -> Right -> King)
    let targetIdx = getEnemyTargetIndex();
    if (targetIdx !== -1) {
      setEnemyTowers((prev) => 
        prev.map((t, idx) => {
          if (idx === targetIdx) {
            if (t.isShielded) {
              return { ...t, isShielded: false };
            } else {
              const nextHp = Math.max(0, t.hp - finalDamage);
              if (t.type === "king" && nextHp <= 0) handleVictory();
              return { ...t, hp: nextHp };
            }
          }
          return t;
        })
      );
    }

    checkGameStatusLocal();
  };

  const getEnemyTargetIndex = () => {
    if (enemyTowers[0].hp > 0) return 0;
    if (enemyTowers[2].hp > 0) return 2;
    if (enemyTowers[1].hp > 0) return 1;
    return -1;
  };

  const checkGameStatusLocal = () => {
    // If enemy king is dead -> victory handles it
  };

  const handleVictory = () => {
    setBattleStatus("victory");
    addGold(100);
    addTrophies(30);
    if (topicParam) {
      completeTopic(topicParam);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#23376e", "#3c6ed2"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Battle Scene View - 60FPS HTML5 Canvas in WebView */}
      <View style={styles.arenaContainer}>
        <BattleArenaSceneView
          playerTowers={playerTowers}
          enemyTowers={enemyTowers}
          isPlayerFrozen={playerFreezeTicks > 0}
          isEnemyFrozen={enemyFreezeTicks > 0}
          activePlayerHeroId={activePlayerAbilityId}
          activeEnemyHeroId={activeEnemyAbilityId}
        />
      </View>

      {/* Floating HUD Interface */}
      <Animated.View style={[styles.hudContainer, { opacity: hudOpacity }]}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.quitButton}>
            <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
            <Text style={styles.quitText}>
              {appLanguage === "kk" ? "Шығу" : "Выйти"}
            </Text>
          </Pressable>
          <View style={styles.headerTopicInfo}>
            <Text style={styles.headerTopicText} numberOfLines={1}>
              {topicParam || (appLanguage === "kk" ? "Бой" : "Битва")}
            </Text>
          </View>
          <View style={{ width: 60 }} />
        </View>

        {/* Player Cards (Bottom deck) */}
        <View style={styles.bottomControls}>
          {playerFreezeTicks > 0 && (
            <View style={styles.playerFreezeOverlay}>
              <Ionicons name="snow" size={24} color="#00e5ff" />
              <Text style={styles.playerFreezeText}>
                {appLanguage === "kk" ? `ЗАМОРОЖЕН: ${playerFreezeTicks}с` : `ЗАМОРОЖЕН: ${playerFreezeTicks}с`}
              </Text>
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsScroll} contentContainerStyle={styles.cardsContent}>
            {deck.map((hero) => {
              const isAffordable = energy >= hero.energyCost && playerFreezeTicks === 0;
              const cd = hero.cooldownRemaining;
              
              return (
                <Pressable
                  key={hero.id}
                  disabled={!isAffordable || cd > 0 || !!activeQuestion}
                  onPress={() => playCard(hero.id, hero.subject as Subject, hero.energyCost)}
                  style={[
                    styles.heroCard,
                    (!isAffordable || cd > 0) && styles.heroCardDisabled
                  ]}
                >
                  <Text style={styles.cardEmoji}>{hero.icon}</Text>
                  <Text style={styles.cardName} numberOfLines={1}>{hero.name}</Text>
                  
                  <View style={styles.energyLabel}>
                    <Ionicons name="flash" size={10} color="#FFD700" />
                    <Text style={styles.energyCostText}>{hero.energyCost}</Text>
                  </View>

                  {cd > 0 && (
                    <View style={styles.cardCooldownOverlay}>
                      <Text style={styles.cooldownText}>{cd}s</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Energy Bar Indicator */}
          <View style={styles.energyBarContainer}>
            <Ionicons name="flash" size={18} color="#FFD700" />
            <View style={styles.energyBarBackground}>
              <View 
                style={[
                  styles.energyBarFill, 
                  { width: `${(energy / 10) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.energyBarText}>{energy}/10</Text>
          </View>
        </View>
      </Animated.View>

      {/* OVERLAY: QUESTION VIEW */}
      {activeQuestion && (
        <QuestionView
          question={activeQuestion}
          timerValue={questionTimer}
          hasExtendedCritWindow={hasExtendedCritWindow}
          onAnswerSelected={submitAnswer}
        />
      )}

      {/* OVERLAY: END GAME RESULTS */}
      {battleStatus !== "active" && (
        <View style={styles.endOverlay}>
          <LinearGradient
            colors={battleStatus === "victory" ? ["#11301d", "#081a10"] : ["#301111", "#1a0808"]}
            style={styles.endCard}
          >
            <Ionicons 
              name={battleStatus === "victory" ? "trophy" : "close-circle"} 
              size={80} 
              color={battleStatus === "victory" ? "#FFD700" : "#FF3B30"} 
              style={styles.endIcon}
            />
            <Text style={styles.endTitle}>
              {battleStatus === "victory" 
                ? (appLanguage === "kk" ? "ЖЕҢІС!" : "ПОБЕДА!") 
                : (appLanguage === "kk" ? "ЖЕҢІЛІС" : "ПОРАЖЕНИЕ")}
            </Text>
            <Text style={styles.endDesc}>
              {battleStatus === "victory"
                ? (appLanguage === "kk" ? "Сіз қарсыластың басып алуын тойтарып, жеңіске жеттіңіз! +100 Алтын, +30 Кубок" : "Вы успешно разгромили башни противника! +100 Золота, +30 Кубков")
                : (appLanguage === "kk" ? "Корольдік мұнара қирады. Келесі шайқасқа жақсылап дайындалыңыз!" : "Ваша королевская башня пала. Готовьтесь лучше к следующему бою!")}
            </Text>

            <Pressable onPress={() => router.back()} style={styles.endButton}>
              <Text style={styles.endButtonText}>
                {appLanguage === "kk" ? "МЕНЮГЕ ОРАЛУ" : "В ГЛАВНОЕ МЕНЮ"}
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23376e",
  },
  arenaContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  towersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  towerBlock: {
    alignItems: "center",
    flex: 1,
  },
  towerIndicator: {
    width: 80,
    height: 100,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  towerIndicatorDead: {
    borderColor: "rgba(255, 69, 58, 0.4)",
    backgroundColor: "rgba(255, 69, 58, 0.1)",
  },
  towerEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  hpBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 3,
    overflow: "hidden",
    position: "relative",
    marginBottom: 4,
  },
  hpBarFill: {
    height: "100%",
  },
  shieldOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 229, 255, 0.4)",
    borderWidth: 1,
    borderColor: "#00e5ff",
  },
  hpText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },
  battleDivider: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  freezeBadge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 229, 255, 0.15)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00e5ff",
  },
  freezeText: {
    color: "#00e5ff",
    fontSize: 9,
    fontWeight: "bold",
  },
  hudContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 5,
    justifyContent: "space-between",
  },
  topBar: {
    height: 100,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  quitButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  quitText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  headerTopicInfo: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    maxWidth: SCREEN_WIDTH * 0.4,
  },
  headerTopicText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  bottomControls: {
    backgroundColor: "rgba(17, 28, 48, 0.9)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    position: "relative",
  },
  playerFreezeOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 76, 153, 0.45)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    gap: 8,
  },
  playerFreezeText: {
    color: "#00e5ff",
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 3,
  },
  cardsScroll: {
    maxHeight: 110,
    marginBottom: 12,
  },
  cardsContent: {
    gap: 10,
    paddingHorizontal: 4,
  },
  heroCard: {
    width: 80,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heroCardDisabled: {
    opacity: 0.45,
  },
  cardEmoji: {
    fontSize: 26,
  },
  cardName: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center",
    width: "90%",
  },
  energyLabel: {
    position: "absolute",
    top: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 6,
  },
  energyCostText: {
    color: "#FFD700",
    fontSize: 9,
    fontWeight: "900",
  },
  cardCooldownOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cooldownText: {
    color: "#FF453A",
    fontSize: 16,
    fontWeight: "bold",
  },
  energyBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 6,
  },
  energyBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 5,
    overflow: "hidden",
  },
  energyBarFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 5,
  },
  energyBarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "System",
    width: 42,
    textAlign: "right",
  },
  endOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
    paddingHorizontal: 20,
  },
  endCard: {
    width: "100%",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  endIcon: {
    marginBottom: 16,
  },
  endTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
  },
  endDesc: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
    marginVertical: 14,
    paddingHorizontal: 10,
  },
  endButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 10,
    width: "90%",
    alignItems: "center",
  },
  endButtonText: {
    color: "#181E32",
    fontSize: 15,
    fontWeight: "bold",
  },
});
