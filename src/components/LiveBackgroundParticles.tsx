import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Particle {
  id: number;
  x: number; // percentage 0..1
  y: number; // percentage 0..1
  size: number;
  speed: number;
  opacity: number;
}

export const LiveBackgroundParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Initialize 35 floating particles matching Swift RoadmapParticlesView
    const initialParticles: Particle[] = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.5 + 1.5,
      speed: Math.random() * 0.0012 + 0.0006,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setParticles(initialParticles);

    const animate = () => {
      setParticles((prevParticles) =>
        prevParticles.map((p) => {
          let newY = p.y - p.speed;
          let newX = p.x;
          if (newY < 0) {
            newY = 1.0;
            newX = Math.random();
          }
          return {
            ...p,
            y: newY,
            x: newX,
          };
        })
      );
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
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
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
});
