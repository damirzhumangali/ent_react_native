import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGameStore } from "@/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { Subject, MathSubcategory, getSubjectDisplayName, isMathTopicGeometry } from "@/models/subject";
import { QuestionRepository } from "@/services/QuestionRepository";
import { subjectTopicsData } from "@/constants/subjectTopics";
import { LiveBackgroundParticles } from "@/components/LiveBackgroundParticles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ROW_HEIGHT = 155;
const START_Y = 39;

// Pulsing Live Circle Node Button Component
function PulsingNodeButton({
  completed,
  onPress,
}: {
  completed: boolean;
  onPress: () => void;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loopAnim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.14,
            duration: 1300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.85,
            duration: 1300,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 1300,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    loopAnim.start();
    return () => loopAnim.stop();
  }, []);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.nodeButtonBox,
        pressed && { transform: [{ scale: 0.95 }] },
      ]}
    >
      {/* Live Pulsing Outer Glow Rings */}
      <Animated.View
        style={[
          styles.outerGlowRing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: glowOpacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.outerGlowRingLarge,
          {
            transform: [{ scale: pulseAnim }],
            opacity: Animated.multiply(glowOpacity, 0.45),
          },
        ]}
      />

      {/* 3D Button Sublayer */}
      <View style={styles.node3dShadow} />

      {/* Node Button Gradient matching Photo 2 (Cyan/blue gradient) */}
      <LinearGradient
        colors={["#38BDF8", "#0284C7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.nodeGradient}
      >
        <Ionicons
          name={completed ? "checkmark" : "play"}
          size={24}
          color="#FFFFFF"
          style={!completed ? { marginLeft: 3 } : undefined}
        />
      </LinearGradient>
    </Pressable>
  );
}

const defaultGeometryTopicsKK = [
  "1-1. Геометрияның негізгі ұғымдары мен аксиомалары",
  "1-2. Бұрыштар. Сыбайлас және вертикаль бұрыштар",
  "1-3. Параллель түзулер белгілері мен қасиеттері",
  "2-1. Үшбұрыштың теңдік белгілері",
  "2-2. Үшбұрыштың медианасы, биссектрисасы, биіктігі",
  "2-3. Пифагор теоремасы",
  "2-4. Тікбұрышты үшбұрыш. Синус, косинус, тангенс",
  "2-5. Ұқсас үшбұрыштар",
  "2-6. Үшбұрыштың ауданы",
  "3-1. Параллелограмм және оның қасиеттері",
  "3-2. Тіктөртбұрыш, ромб, шаршы",
  "3-3. Трапеция",
  "3-4. Төртбұрыштардың аудандары",
  "4-1. Дұрыс көпбұрыштар",
  "4-2. Көпбұрыштың периметрі мен ауданы",
  "5-1. Шеңбер, доға, хорда",
  "5-2. Орталық және іштей сызылған бұрыштар",
  "5-3. Жанама және қиюшы",
  "5-4. Көпбұрышқа іштей/сырттай сызылған шеңбер",
  "5-5. Дөңгелек пен оның бөліктерінің ауданы",
  "6-1. Вектор ұғымы және амалдар",
  "6-2. Векторлардың скаляр көбейтіндісі",
  "6-3. Векторларды координаталар арқылы өрнектеу",
  "7-1. Нүктенің координаталары. Кесіндінің ортасы",
  "7-2. Екі нүкте арасындағы қашықтық",
  "7-3. Түзудің теңдеуі",
  "7-4. Шеңбердің теңдеуі",
  "8-1. Стереометрияның аксиомалары",
  "8-2. Түзулер мен жазықтықтардың параллельдігі",
  "8-3. Түзулер мен жазықтықтардың перпендикулярлығы",
  "8-4. Екі жазықтық арасындағы бұрыш",
  "9-1. Призма. Тік және көлбеу призма",
  "9-2. Параллелепипед",
  "9-3. Пирамида. Қиық пирамида",
  "9-4. Дұрыс көпжақтар",
  "10-1. Цилиндр",
  "10-2. Конус. Қиық конус",
  "10-3. Сфера және шар",
  "11-1. Призманың, пирамиданың бет ауданы",
  "11-2. Цилиндр, конус, сфераның бет ауданы",
  "12-1. Призманың, параллелепипедтің көлемі",
  "12-2. Пирамиданың, қиық пирамиданың көлемі",
  "12-3. Цилиндр мен конустың көлемі",
  "12-4. Шардың көлемі мен бет ауданы",
  "13-1. Кеңістіктегі вектор және координаталар",
  "13-2. Екі нүкте арасындағы қашықтық (кеңістікте)",
  "13-3. Векторлардың скаляр көбейтіндісі (кеңістікте)",
  "14-1. Призмаға іштей/сырттай сызылған шар",
  "14-2. Пирамидаға іштей/сырттай сызылған шар",
  "14-3. Конус пен цилиндрге қатысты аралас есептер [ҰБТ]"
];

const defaultGeometryTopicsRU = [
  "1-1. Основные понятия и аксиомы геометрии",
  "1-2. Углы. Смежные и вертикальные углы",
  "1-3. Признаки и свойства параллельных прямых",
  "2-1. Признаки равенства треугольников",
  "2-2. Медиана, биссектриса и высота треугольника",
  "2-3. Теорема Пифагора",
  "2-4. Прямоугольный треугольник. Синус, косинус, тангенс",
  "2-5. Подобные треугольники",
  "2-6. Площадь треугольника",
  "3-1. Параллелограмм и его свойства",
  "3-2. Прямоугольник, ромб, квадрат",
  "3-3. Трапеция",
  "3-4. Площади четырёхугольников",
  "4-1. Правильные многоугольники",
  "4-2. Периметр и площадь многоугольника",
  "5-1. Окружность, дуга, хорда",
  "5-2. Центральные и вписанные углы",
  "5-3. Касательная и секущая",
  "5-4. Вписанная и описанная окружность многоугольника",
  "5-5. Площадь круга и его частей",
  "6-1. Понятие вектора и операции",
  "6-2. Скалярное произведение векторов",
  "6-3. Выражение векторов через координаты",
  "7-1. Координаты точки. Середина отрезка",
  "7-2. Расстояние между двумя точками",
  "7-3. Уравнение прямой",
  "7-4. Уравнение окружности",
  "8-1. Аксиомы стереометрии",
  "8-2. Параллельность прямых и плоскостей",
  "8-3. Перпендикулярность прямых и плоскостей",
  "8-4. Угол между двумя плоскостями",
  "9-1. Призма. Прямая и наклонная призма",
  "9-2. Параллелепипед",
  "9-3. Пирамида. Усеченная пирамида",
  "9-4. Правильные многогранники",
  "10-1. Цилиндр",
  "10-2. Конус. Усеченный конус",
  "10-3. Сфера и шар",
  "11-1. Площадь поверхности призмы, пирамиды",
  "11-2. Площадь поверхности цилиндра, конуса, сферы",
  "12-1. Объем призмы, параллелепипеда",
  "12-2. Объем пирамиды, усеченной пирамиды",
  "12-3. Объем цилиндра и конуса",
  "12-4. Объем и площадь поверхности шара",
  "13-1. Вектор и координаты в пространстве",
  "13-2. Расстояние между двумя точками (в пространстве)",
  "13-3. Скалярное произведение векторов (в пространстве)",
  "14-1. Шар, вписанный/описанный около призмы",
  "14-2. Шар, вписанный/описанный около пирамиды",
  "14-3. Смешанные задачи на конус и цилиндр [ЕНТ]"
];

export default function SubjectTopicsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const subject = (params.subject as Subject) || Subject.math;
  const subcategory = params.subcategory as MathSubcategory;

  const appLanguage = useGameStore((state) => state.appLanguage);
  const completedTopicsStr = useGameStore((state) => state.completedTopics) || "";

  const [topics, setTopics] = useState<string[]>([]);

  // Load and filter topics
  useEffect(() => {
    let list: string[] = [];
    const rawData = subjectTopicsData[subject];
    if (rawData) {
      list = [...(rawData[appLanguage === "kk" ? "kk" : "ru"] || [])];
    }

    if (list.length === 0) {
      try {
        const questions = QuestionRepository.getQuestionsForSubject(subject);
        list = Array.from(new Set(questions.map((q) => q.topic).filter(Boolean))) as string[];
        list.sort();
      } catch (e) {
        console.error("Error loading fallback topics:", e);
      }
    }

    if (subject === Subject.math && subcategory) {
      if (subcategory === MathSubcategory.geometry) {
        const filteredGeo = list.filter((topic) => isMathTopicGeometry(topic));
        list = filteredGeo.length > 0 ? filteredGeo : (appLanguage === "kk" ? defaultGeometryTopicsKK : defaultGeometryTopicsRU);
      } else {
        list = list.filter((topic) => !isMathTopicGeometry(topic));
      }
    }

    setTopics(list);
  }, [subject, subcategory, appLanguage]);

  const isTopicCompleted = (topicName: string): boolean => {
    return completedTopicsStr.split(",").includes(topicName);
  };

  const getShortTitle = (title: string): string => {
    let clean = title;
    const parts = title.split(". ");
    if (parts.length > 1) {
      const first = parts[0];
      const subParts = first.split("-");
      if (subParts.length === 2 && !isNaN(parseInt(subParts[0])) && !isNaN(parseInt(subParts[1]))) {
        clean = parts.slice(1).join(". ");
      }
    }
    
    if (clean.includes(" — ")) {
      clean = clean.split(" — ")[0];
    }
    if (clean.includes(" (")) {
      clean = clean.split(" (")[0];
    }

    if (clean.length > 18) {
      return clean.substring(0, 18) + "...";
    }
    return clean;
  };

  const getXOffset = (index: number): number => {
    const offsets = [0, -75, 75, -75, 75, -75, 75, 0];
    return offsets[index % offsets.length];
  };

  const getSubcategoryTitle = (): string => {
    if (subject === Subject.math && subcategory) {
      return subcategory === MathSubcategory.geometry
        ? appLanguage === "kk"
          ? "Геометрия"
          : "Геометрия"
        : appLanguage === "kk"
        ? "Алгебра"
        : "Алгебра";
    }
    return getSubjectDisplayName(subject, appLanguage);
  };

  const getHeaderIconSource = () => {
    if (subject === Subject.math && subcategory) {
      return subcategory === MathSubcategory.geometry
        ? require("../../assets/images/subcategory_geometry.png")
        : require("../../assets/images/subcategory_algebra.png");
    }
    switch (subject) {
      case Subject.math: return require("../../assets/images/subject_math.png");
      case Subject.history: return require("../../assets/images/subject_history.png");
      case Subject.reading: return require("../../assets/images/subject_reading.png");
      case Subject.mathLiteracy: return require("../../assets/images/subject_math_literacy.png");
      case Subject.physics: return require("../../assets/images/subject_physics.png");
      case Subject.chemistry: return require("../../assets/images/subject_chemistry.png");
      case Subject.biology: return require("../../assets/images/subject_biology.png");
      case Subject.geography: return require("../../assets/images/subject_geography.png");
      case Subject.informatics: return require("../../assets/images/subject_informatics.png");
      case Subject.literature: return require("../../assets/images/subject_literature.png");
      case Subject.language: return require("../../assets/images/subject_language.png");
      default: return require("../../assets/images/subject_math.png");
    }
  };

  const handleNodePress = (topic: string) => {
    router.push({
      pathname: "/theory" as any,
      params: { topic, subject },
    } as any);
  };

  // Generate SVG Bezier Winding Path string
  const generatePathD = (): string => {
    if (topics.length === 0) return "";
    const midX = SCREEN_WIDTH / 2;
    let d = `M ${midX + getXOffset(0)} ${START_Y}`;
    for (let i = 1; i < topics.length; i++) {
      const prevX = midX + getXOffset(i - 1);
      const prevY = START_Y + (i - 1) * ROW_HEIGHT;
      const nextX = midX + getXOffset(i);
      const nextY = START_Y + i * ROW_HEIGHT;

      const cp1X = prevX;
      const cp1Y = prevY + ROW_HEIGHT * 0.5;
      const cp2X = nextX;
      const cp2Y = nextY - ROW_HEIGHT * 0.5;

      d += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${nextX} ${nextY}`;
    }
    return d;
  };

  const totalHeight = Math.max(100, topics.length * ROW_HEIGHT + 100);
  const pathD = generatePathD();
  const completedCount = topics.filter(isTopicCompleted).length;
  const progress = topics.length > 1 ? completedCount / (topics.length - 1) : 0.0;
  const estimatedLength = (topics.length - 1) * 180;

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#045DA9", "#0EA5E9"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Animated Stardust particles matching Swift RoadmapParticlesView */}
      <LiveBackgroundParticles />

      {/* Scrollable Roadmap */}
      <ScrollView
        contentContainerStyle={{ paddingTop: 160, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: totalHeight, width: SCREEN_WIDTH, position: "relative" }}>
          {/* Path rendering using react-native-svg matching Photo 2 */}
          {topics.length > 0 && (
            <View style={StyleSheet.absoluteFill}>
              <Svg style={StyleSheet.absoluteFill}>
                {/* Outer glowing path line */}
                <Path
                  d={pathD}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.18)"
                  strokeWidth={14}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Base soft translucent dashed winding line (Photo 2 design) */}
                <Path
                  d={pathD}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.35)"
                  strokeWidth={6}
                  strokeDasharray="8, 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Active translucent cyan/white progress dashed line (Photo 2 design) */}
                <Path
                  d={pathD}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.75)"
                  strokeWidth={6.5}
                  strokeDasharray="8, 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDashoffset={estimatedLength * (1 - Math.min(1.0, progress))}
                />
              </Svg>
            </View>
          )}

          {/* Interactive nodes matching Photo 2 */}
          {topics.map((topic, index) => {
            const completed = isTopicCompleted(topic);
            const midX = SCREEN_WIDTH / 2;
            const x = midX + getXOffset(index) - 48; // center node offset
            const y = index * ROW_HEIGHT;

            return (
              <View
                key={topic}
                style={[
                  styles.nodeContainer,
                  {
                    left: x,
                    top: y,
                  },
                ]}
              >
                {/* Live Pulsing Node Outer Ring & Button */}
                <PulsingNodeButton
                  completed={completed}
                  onPress={() => handleNodePress(topic)}
                />

                {/* 3 Stars Indicator below Node */}
                <View style={styles.starsRow}>
                  <Ionicons
                    name="star"
                    size={11}
                    color={completed ? "#FFD200" : "rgba(255, 255, 255, 0.4)"}
                  />
                  <Ionicons
                    name="star"
                    size={11}
                    color={completed ? "#FFD200" : "rgba(255, 255, 255, 0.4)"}
                  />
                  <Ionicons
                    name="star"
                    size={11}
                    color={completed ? "#FFD200" : "rgba(255, 255, 255, 0.4)"}
                  />
                </View>

                {/* Topic Short Title */}
                <Text style={styles.nodeTitle} numberOfLines={1}>
                  {getShortTitle(topic)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Top Header Overlay Banner matching SubjectTopicsView.swift */}
      <View style={styles.topHeaderOverlay} pointerEvents="box-none">
        <LinearGradient
          colors={["#045DA9", "rgba(4, 93, 169, 0.92)", "rgba(4, 93, 169, 0)"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.headerContent}>
          {/* Top Bar Row (Back button + Circle Icon) */}
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              <Text style={styles.backText}>{appLanguage === "kk" ? "Пәндер" : "Предметы"}</Text>
            </Pressable>

            {/* Header Right Circle Icon */}
            <View style={styles.headerIconCircle}>
              <Image source={getHeaderIconSource()} style={styles.headerIconImg} />
            </View>
          </View>

          {/* Heading Text */}
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerSubtitle}>
              {appLanguage === "kk" ? "БӨЛІМ" : "РАЗДЕЛ"}
            </Text>
            <Text style={styles.headerMainTitle}>{getSubcategoryTitle()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#045DA9",
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
  topHeaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 165,
    zIndex: 10,
  },
  headerContent: {
    paddingTop: 54,
    paddingHorizontal: 20,
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIconImg: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  headerTitleBox: {
    marginTop: 2,
    gap: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 1.2,
  },
  headerMainTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  nodeContainer: {
    position: "absolute",
    width: 96,
    alignItems: "center",
  },
  nodeButtonBox: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  outerGlowRing: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3.5,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  outerGlowRingLarge: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  node3dShadow: {
    position: "absolute",
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#105BC6",
    top: 4,
  },
  nodeGradient: {
    width: 78,
    height: 78,
    borderRadius: 39,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 10,
    marginBottom: 4,
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    width: 150,
  },
});
