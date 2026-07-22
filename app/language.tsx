import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Image, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface LangOption {
  code: "ru" | "kk" | "en";
  nativeName: string;
  subtitle: string;
  flag: any;
  startColor: string;
  endColor: string;
  glowColor: string;
}

const languages: LangOption[] = [
  {
    code: "kk",
    nativeName: "Қазақ тілі",
    subtitle: "Дайындалуды бастау",
    flag: require("../../assets/images/flag_kz.png"),
    startColor: "#08203c",
    endColor: "#00a8b5",
    glowColor: "rgba(0, 168, 181, 0.5)",
  },
  {
    code: "ru",
    nativeName: "Русский язык",
    subtitle: "Начать подготовку",
    flag: require("../../assets/images/flag_ru.png"),
    startColor: "#0c142c",
    endColor: "#b41e2c",
    glowColor: "rgba(180, 30, 44, 0.5)",
  },
  {
    code: "en",
    nativeName: "English",
    subtitle: "Start training",
    flag: require("../../assets/images/flag_us.png"),
    startColor: "#1c0c38",
    endColor: "#821996",
    glowColor: "rgba(130, 25, 150, 0.5)",
  },
];

export default function LanguageScreen() {
  const router = useRouter();
  const setAppLanguage = useGameStore((state) => state.setAppLanguage);

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Anim states
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const globeOpacity = useRef(new Animated.Value(1)).current;
  
  // Button press scales
  const pressScales = useRef<{ [key: string]: Animated.Value }>({
    kk: new Animated.Value(1),
    ru: new Animated.Value(1),
    en: new Animated.Value(1),
  }).current;

  const handleLanguageSelect = (code: "ru" | "kk" | "en") => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedCode(code);

    // Save language to store
    setAppLanguage(code === "kk" ? "kk" : "ru"); // Swift storage only saves "ru" / "kk"

    // Scale down pressed button slightly
    Animated.spring(pressScales[code], {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();

    // Globe to checkmark transition
    Animated.timing(globeOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });

    // Navigate after a delay to let the animations play out
    setTimeout(() => {
      Animated.spring(pressScales[code], {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      router.replace("/onboarding");

      // Reset states on screen exit / cleanup
      setTimeout(() => {
        setIsAnimating(false);
        setSelectedCode(null);
        checkmarkScale.setValue(0);
        globeOpacity.setValue(1);
      }, 500);
    }, 950);
  };

  return (
    <View style={styles.container}>
      {/* 1. Gradient Background */}
      <LinearGradient
        colors={["#045da9", "#0ea5e9"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle Glow Circle in Top-Left */}
      <View style={styles.radialGlow} />

      <View style={styles.content}>
        {/* 2. Glowing Circular Icon Disk (Globe or Checkmark) */}
        <View
          style={[
            styles.globeContainer,
            selectedCode && styles.globeContainerSuccess,
          ]}
        >
          {!selectedCode ? (
            <Animated.View style={{ opacity: globeOpacity }}>
              <Ionicons name="globe" size={46} color="#eb9f28" />
            </Animated.View>
          ) : (
            <Animated.View
              style={{ transform: [{ scale: checkmarkScale }] }}
            >
              <Ionicons name="checkmark-circle" size={54} color="#30d158" />
            </Animated.View>
          )}
        </View>

        {/* 3. Header Texts */}
        <View style={styles.header}>
          <Text style={styles.title}>SELECT LANGUAGE</Text>
          <Text style={styles.title}>ВЫБОР ЯЗЫКА</Text>
          <Text style={styles.title}>ТІЛ ТАНДАУ</Text>
        </View>

        {/* 4. Language Buttons Stack */}
        <View style={styles.buttonStack}>
          {languages.map((lang) => {
            const isPressed = selectedCode === lang.code;
            
            return (
              <Animated.View
                key={lang.code}
                style={{
                  transform: [{ scale: pressScales[lang.code] }],
                  width: "100%",
                }}
              >
                <Pressable
                  onPress={() => handleLanguageSelect(lang.code)}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    isPressed && {
                      shadowColor: lang.glowColor,
                      shadowOpacity: 0.8,
                      shadowRadius: 15,
                      elevation: 8,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[lang.startColor, lang.endColor]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  
                  <View style={styles.buttonContent}>
                    <Image source={lang.flag} style={styles.flag} />
                    
                    <View style={styles.textContainer}>
                      <Text style={styles.langName}>{lang.nativeName}</Text>
                      <Text style={styles.langSub}>{lang.subtitle}</Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="rgba(255, 255, 255, 0.4)"
                    />
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#045da9",
  },
  radialGlow: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    opacity: 0.6,
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 36,
  },
  globeContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(10, 15, 30, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#eb9f28",
    shadowColor: "#eb9f28",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 24,
  },
  globeContainerSuccess: {
    borderColor: "#30d158",
    shadowColor: "#30d158",
  },
  header: {
    alignItems: "center",
    gap: 6,
    marginBottom: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  buttonStack: {
    width: "100%",
    gap: 16,
  },
  button: {
    width: "100%",
    height: 72,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%",
    height: "100%",
  },
  flag: {
    width: 44,
    height: 44,
    resizeMode: "contain",
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  langName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  langSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },
});
