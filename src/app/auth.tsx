import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, ActivityIndicator, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AuthScreen() {
  const router = useRouter();
  
  const setUsername = useGameStore((state) => state.setUsername);
  const completeOnboarding = useGameStore((state) => state.completeOnboarding);

  const [isLoading, setIsLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Anim states
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const shieldOpacity = useRef(new Animated.Value(1)).current;
  
  // Tap scales
  const appleScale = useRef(new Animated.Value(1)).current;
  const googleScale = useRef(new Animated.Value(1)).current;
  const guestScale = useRef(new Animated.Value(1)).current;

  const triggerSuccessSequence = (name: string) => {
    setIsSuccess(true);
    
    // Animate lock shield fading out and checkmark scale in
    Animated.timing(shieldOpacity, {
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

    // Complete login and route after animation finishes
    setTimeout(() => {
      setUsername(name);
      completeOnboarding();
      router.replace("/menu");
      
      // Reset after transition completes
      setTimeout(() => {
        setIsLoading(false);
        setAuthProvider(null);
        setIsSuccess(false);
        checkmarkScale.setValue(0);
        shieldOpacity.setValue(1);
      }, 500);
    }, 1000);
  };

  const handleAppleSignIn = () => {
    if (isLoading) return;
    setIsLoading(true);
    setAuthProvider("apple");

    Animated.spring(appleScale, { toValue: 0.96, useNativeDriver: true }).start();

    // Mock network auth call
    setTimeout(() => {
      Animated.spring(appleScale, { toValue: 1, useNativeDriver: true }).start();
      triggerSuccessSequence("Apple Пользователь");
    }, 1200);
  };

  const handleGoogleSignIn = () => {
    if (isLoading) return;
    setIsLoading(true);
    setAuthProvider("google");

    Animated.spring(googleScale, { toValue: 0.96, useNativeDriver: true }).start();

    // Mock network auth call
    setTimeout(() => {
      Animated.spring(googleScale, { toValue: 1, useNativeDriver: true }).start();
      triggerSuccessSequence("Google Пользователь");
    }, 1200);
  };

  const handleGuestSignIn = () => {
    if (isLoading) return;
    setIsLoading(true);
    setAuthProvider("guest");

    Animated.spring(guestScale, { toValue: 0.96, useNativeDriver: true }).start();

    // Instant sign in for Guest
    setTimeout(() => {
      Animated.spring(guestScale, { toValue: 1, useNativeDriver: true }).start();
      triggerSuccessSequence("Гость");
    }, 800);
  };

  return (
    <View style={styles.container}>
      {/* 1. Gradient Background */}
      <LinearGradient
        colors={["#045da9", "#0ea5e9"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Radial Glow */}
      <View style={styles.radialGlow} />

      <View style={styles.content}>
        {/* 2. Glowing Shield Icon */}
        <View
          style={[
            styles.shieldContainer,
            isSuccess && styles.shieldContainerSuccess,
          ]}
        >
          {isSuccess ? (
            <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
              <Ionicons name="checkmark-circle" size={50} color="#30d158" />
            </Animated.View>
          ) : isLoading ? (
            <ActivityIndicator size="large" color="#eb9f28" />
          ) : (
            <Animated.View style={{ opacity: shieldOpacity }}>
              <Ionicons name="shield-checkmark" size={44} color="#eb9f28" />
            </Animated.View>
          )}
        </View>

        {/* 3. Header Titles */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>CREATE ACCOUNT</Text>
          <Text style={styles.title}>АВТОРИЗАЦИЯ</Text>
          <Text style={styles.description}>
            Сохраняйте прогресс и соревнуйтесь с другими учениками в ЕНТ Quest!
          </Text>
        </View>

        {/* 4. Auth Buttons Stack */}
        <View style={styles.buttonStack}>
          {/* Apple Button */}
          <Animated.View style={{ transform: [{ scale: appleScale }], width: "100%" }}>
            <Pressable
              disabled={isLoading}
              onPress={handleAppleSignIn}
              style={({ pressed }) => [
                styles.appleButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <View style={styles.btnContent}>
                {authProvider === "apple" && isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                )}
                <Text style={styles.appleText}>Войти через Apple</Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Google Button */}
          <Animated.View style={{ transform: [{ scale: googleScale }], width: "100%" }}>
            <Pressable
              disabled={isLoading}
              onPress={handleGoogleSignIn}
              style={({ pressed }) => [
                styles.googleButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <View style={styles.btnContent}>
                {authProvider === "google" && isLoading ? (
                  <ActivityIndicator size="small" color="#4285F4" />
                ) : (
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                )}
                <Text style={styles.googleText}>Войти через Google</Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Guest Link */}
          <Animated.View style={{ transform: [{ scale: guestScale }], marginTop: 12 }}>
            <Pressable
              disabled={isLoading}
              onPress={handleGuestSignIn}
              style={({ pressed }) => [
                styles.guestButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.guestText}>Пропустить и играть как гость</Text>
            </Pressable>
          </Animated.View>
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
  shieldContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
  shieldContainerSuccess: {
    borderColor: "#30d158",
    shadowColor: "#30d158",
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
    gap: 8,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#5CA2FF",
    letterSpacing: 3,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  description: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  buttonStack: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  appleButton: {
    width: "100%",
    height: 56,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  appleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  googleButton: {
    width: "100%",
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    shadowColor: "rgba(255, 255, 255, 0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  googleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#181E32",
  },
  guestButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  guestText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.6)",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
