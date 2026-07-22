import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { QuestionRepository } from "@/services/QuestionRepository";
import { Subject } from "@/models/subject";
import RiveLoadingAnimation from "@/components/RiveLoadingAnimation";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CosmicParticle {
  id: number;
  x: number; // 0 to 1
  y: number; // 0 to 1
  size: number;
  speed: number;
  opacity: number;
}

export default function LoadingScreen() {
  const router = useRouter();
  const hasCompletedOnboarding = useGameStore((state) => state.hasCompletedOnboarding);
  const appLanguage = useGameStore((state) => state.appLanguage);
  
  const [progress, setProgress] = useState(0.3);
  const [statusText, setStatusText] = useState(appLanguage === "kk" ? "Кейіпкерлерді жүктеу..." : "Загрузка персонажей...");
  const [particles, setParticles] = useState<CosmicParticle[]>([]);
  
  // Animation values
  const animatedProgress = useRef(new Animated.Value(0.3)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  // Initialize Particles (starfield effect)
  useEffect(() => {
    const generated: CosmicParticle[] = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.002 + 0.0008,
      opacity: Math.random() * 0.6 + 0.1,
    }));
    setParticles(generated);
  }, []);

  // Animate Particles (Drifting up)
  useEffect(() => {
    let animationFrameId: number;
    
    const updateParticles = () => {
      setParticles((prev) =>
        prev.map((p) => {
          let nextY = p.y - p.speed;
          let nextX = p.x;
          let nextOpacity = p.opacity;

          // Sparkle effect
          if (Math.random() > 0.97) {
            nextOpacity = Math.random() * 0.6 + 0.1;
          }

          // Reset if goes off top of the screen
          if (nextY < 0) {
            nextY = 1.0;
            nextX = Math.random();
          }

          return { ...p, y: nextY, x: nextX, opacity: nextOpacity };
        })
      );
      animationFrameId = requestAnimationFrame(updateParticles);
    };

    animationFrameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Update status text based on progress
  const updateStatus = (val: number) => {
    const isKk = appLanguage === "kk";
    if (val < 0.20) {
      setStatusText(isKk ? "Ресурстарды инициализациялау..." : "Инициализация ресурсов...");
    } else if (val < 0.45) {
      setStatusText(isKk ? "Кейіпкерлерді жүктеу..." : "Загрузка персонажей...");
    } else if (val < 0.65) {
      setStatusText(isKk ? "ҰБТ сұрақтарын жүктеу..." : "Загрузка вопросов ЕНТ...");
    } else if (val < 0.85) {
      setStatusText(isKk ? "Теорияны дайындау..." : "Подготовка теории...");
    } else if (val < 0.95) {
      setStatusText(isKk ? "Дерекқорға қосылу..." : "Подключение к базе данных...");
    } else {
      setStatusText(isKk ? "Ойынға қош келдіңіз!" : "Добро пожаловать в игру!");
    }
  };

  // Pulse animation for the logo placeholder
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.06,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1.0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Background asset preloading and progress sequence
  useEffect(() => {
    let isMounted = true;
    
    const loadSequence = async () => {
      // Step 1: Preload questions (math subject) lazily to warm cache in background
      const preloadPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          try {
            // Lazy load math questions to warm caching
            QuestionRepository.getQuestionsForSubject(Subject.math);
          } catch (e) {
            console.log("Preloading cache skipped or errored:", e);
          }
          resolve();
        }, 100);
      });

      // Anim 1: 30% -> 60%
      await new Promise((r) => setTimeout(r, 450));
      if (!isMounted) return;
      setProgress(0.6);
      updateStatus(0.6);
      
      // Anim 2: 60% -> 90%
      await new Promise((r) => setTimeout(r, 450));
      if (!isMounted) return;
      setProgress(0.9);
      updateStatus(0.9);

      // Wait for cache warming to complete
      await preloadPromise;

      // Anim 3: 90% -> 100%
      await new Promise((r) => setTimeout(r, 350));
      if (!isMounted) return;
      setProgress(1.0);
      setStatusText(appLanguage === "kk" ? "Ойынға қош келдіңіз!" : "Добро пожаловать в игру!");

      // Transition to next screen after showing 100% completed
      await new Promise((r) => setTimeout(r, 350));
      if (!isMounted) return;

      if (hasCompletedOnboarding) {
        router.replace("/menu");
      } else {
        router.replace("/language");
      }
    };

    loadSequence();
    return () => {
      isMounted = false;
    };
  }, [hasCompletedOnboarding]);

  // Smoothly interpolate the progress value for the view width
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false, // width cannot use native driver
    }).start();
  }, [progress]);

  // Progress Bar width calculation
  const barWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH - 96], // Margins of 48 on left and right
  });

  return (
    <View style={styles.container}>
      {/* 1. Rive Animation background (18481-34732-slider-skeuomorphic.riv) */}
      <RiveLoadingAnimation />

      {/* 2. Cosmic Floating Starfield Particles */}
      {particles.map((p) => (
        <View
          key={p.id}
          style={[
            styles.particle,
            {
              left: p.x * SCREEN_WIDTH,
              top: p.y * SCREEN_HEIGHT,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              opacity: p.opacity,
            },
          ]}
        />
      ))}

      {/* 3. Glowing RPG Logo Placeholder */}
      <View style={styles.logoContainer}>
        <Animated.View style={{ transform: [{ scale: logoScale }] }}>
          <Text style={styles.logoText}>⚔️ ENT QUEST 🏆</Text>
          <Text style={styles.logoSubtext}>16-BIT RPG STUDY ADVENTURE</Text>
        </Animated.View>
      </View>

      {/* 4. Bottom Progress Bar Overlay */}
      <View style={styles.bottomSection}>
        <View style={styles.barContainer}>
          {/* Background tube */}
          <View style={styles.barBackground} />
          
          {/* Active progress tube (gradient from blue to emerald green) */}
          <Animated.View style={[styles.barActive, { width: barWidth }]}>
            <LinearGradient
              colors={["#5CA2FF", "#00E87A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        
        {/* Status text with percentage */}
        <Text style={styles.statusText}>
          {statusText} {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#050810",
  },
  particle: {
    position: "absolute",
    backgroundColor: "#ffffff",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "rgba(92, 162, 255, 0.75)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  logoSubtext: {
    fontSize: 10,
    fontWeight: "600",
    color: "#5CA2FF",
    textAlign: "center",
    letterSpacing: 3,
    marginTop: 8,
    opacity: 0.8,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 80,
    gap: 18,
  },
  barContainer: {
    width: SCREEN_WIDTH - 96,
    height: 12,
    justifyContent: "center",
    position: "relative",
  },
  barBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 6,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  barActive: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    shadowColor: "#5CA2FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textShadowColor: "rgba(92, 162, 255, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
