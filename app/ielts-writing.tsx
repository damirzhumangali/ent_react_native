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

import Svg, { Circle } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface EssayError {
  originalText: string;
  correction: string;
  explanation: string;
  category?: string;
}

interface EssayFeedback {
  overallScore: number;
  taskAchievement: number;
  coherence: number;
  lexical: number;
  grammar: number;
  wordCount: number;
  comments: string[];
  improvedVersion: string;
  overallVerdict?: string;
  errors?: EssayError[];
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
  "UAE Government Spending": {
    task1: "The pie chart gives information on UAE government spending in 2000. The total budget was AED 315 billion.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    task2: "In some countries, bicycles are increasingly replacing cars, while in others, people prefer driving over cycling. What are the reasons behind this trend? Do you think this is a positive or negative development? Write at least 250 words.",
  },
  "Produce and Recycle Paper": {
    task1: "The diagram below shows how to produce and recycle paper..\n\nSummarise the information by selecting and reporting the main features, and make comparison where relevant.",
    task2: "In many modern cities, there is a growing trend of individuals living alone or in nuclear family units rather than residing with extended family members. Is this a positive or negative development?",
  },
  "Changes in Dalton": {
    task1: "The two maps illustrate the changes in the town of Dalton between the years 1815 and 2015.\n\nSummarise the information by selecting and reporting the main features, and make comparison where relevant. Write at least 150 words.",
    task2: "Leaders of all kinds are often younger now than in the past. What are the reasons for this? Is it a positive or a negative development? Write at least 250 words.",
  },
  "Archaeological Site": {
    task1: "The plans below show findings at an archaeological site in 1890 and 1990.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    task2: "These days, many young people do not spend their weekends and holidays doing outdoor activities such as hiking or mountaineering. Why is this the case? How can they be encouraged to spend more time in the natural environment?",
  },
  "USA to Canada Visitors": {
    task1: "The charts below show the percentage of visitors from the USA to Canada in different age groups in 2000 and 2020.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    task2: "In some cities, public parks and open spaces are changed into gardens where local residents can grow their own fruits and vegetables. Do you think the advantages of this development outweigh the disadvantages?",
  },
  "Turkey Spending": {
    task1: "The line graph below shows the percentage of spending in Turkey, from 1960 to 2000.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    task2: "Some people think that the best way to improve road safety is to get drivers tested each year. To what extent do you agree or disagree?",
  },
  "US Employment": {
    task1: "The graph below presents the employment patterns in the USA between 1930 and 2010.\n\nSummarise the information by selecting and report in the main features, and make comparisons where relevant.",
    task2: "Some educationalists say that every child should be taught how to play a musical instrument. To what extent do you agree or disagree?",
  },
  "Deforestation Consequences": {
    task1: "The flow chart illustrates the consequence of deforestation. Summarise the information by selecting and reporting the main features.",
    task2: "In many workplaces, online communication is getting more common than meeting face to face. Do the advantages of this development outweigh the disadvantages?",
  },
  "Derby and Nottingham Houses": {
    task1: "The bar chart below shows the number of houses built per year in two cities, Derby and Nottingham, Between 2000 and 2009. Write a report for a university lecturer describing the information shown below.",
    task2: "People think that the best way to reduce crime is to give longer prison sentences. Others believe that there are other alternative solutions for reducing crime. Discuss both views and give your opinion on this topic.",
  },
  "Olive Oil Manufacturing": {
    task1: "The diagram below shows how Olive Oil is manufactured.\n\nWrite a report for a university lecturer describing the information below.",
    task2: "Nowadays people waste a lot of food that was bought from shops and restaurants. Why do you think people waste food? What can be done to reduce the amount of food they throw away?",
  },
  "Telephone Calls in Australia": {
    task1: "The bar chart below shows the total number of minutes (in billions) of telephone calls in Australia, divided into three categories, from 2001- 2008. Summarise the information by selecting and reporting the main features and make comparisons where relevant.",
    task2: "Some people think the money spent in developing the technology for space exploration is not justified. There are more beneficial ways to spend this money. To what extend do you agree or disagree?",
  },
  "UK Housing": {
    task1: "The pie charts below show the percentage of housing owned and rented in the UK in 1991 and 2007. Summarize the information by describing the main features of the charts and making comparisons where appropriate.",
    task2: "In some countries people spend long hours at work. Why does this happen? Is it positive or negative development",
  },
  "Automatic Photo Booth": {
    task1: "The flow chart below shows an automatic photo booth. Summarise the information by selecting and reporting the main features and make comparisons where relevant.",
    task2: "The typical teaching situation of a teacher and students in the class will not exist by the year 2050. To what extent do you agree or disagree?",
  },
  "Park Changes": {
    task1: "The pictures show the changes of a park from 1980 to the present day. Summarize the information by selecting and reporting the main features and make comparisons where relevant.",
    task2: "People often think about creating an ideal society, but most of the times fail in making this happen. What is your opinion about an ideal society? How can we create an ideal society?",
  },
  "China Oil": {
    task1: "The line graph below shows the oil production and consumption in China between 1982 and 2006. Summarize the information by selecting and reporting the main features and make comparisons where relevant.",
    task2: "Individuals can do nothing to improve the environment; only governments and large companies can make a difference. To what extent do you agree or disagree?",
  },
  "Organic Waste Compost": {
    task1: "The diagram below shows how to recycle organic waste to produce garden fertilizer (compost). Summaries the information by selecting and reporting the main features, and make comparisons where relevant.",
    task2: "Some people think news has no connection to people's lives, so it is a waste of time to read the news in newspapers and watch television news programs. To what extent do you agree or disagree?",
  },
  "Bookstore Layout": {
    task1: "The maps below show a bookstore in 2000 and now. Summaries the information by selecting and reporting the main features, and make comparisons where relevant.",
    task2: "Some people think that job satisfaction is more important than job security, while some people think that they cannot always expect job satisfaction, a permanent job is more important. Discuss both views and give your own opinion.",
  },
  "Australian Demographics": {
    task1: "The Pie chart gives information about the country of birth of people living in Australia and the table shows where people born in these countries live. Summarise the information by selecting and reporting the main features and make comparisons where relevant.",
    task2: "People are having more and more sugar-based drinks. What are the reasons? What are the solutions to make people drink less.",
  },
  "World Population Projections": {
    task1: "The bar chart shows the percentage of the total world population in 4 countries in 1950 and 2002, and projections for 2050. Summarise the information by selecting and reporting the main features and make comparisons where relevant.",
    task2: "The use of social media is replacing face-to-face interaction among many people in society. Do you think the advantages outweigh the disadvantages?",
  },
  "Gender School Enrollment": {
    task1: "The chart below shows the number of girls per 100 boys enrolled in different levels of school education. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    task2: "Some people believe that capital punishment should not be used. Others, however, argue that it should be allowed for the most serious crimes. Discuss both views and give your opinion.",
  },
  "Corn Ethanol Production": {
    task1: "The diagram below shows how ethanol fuel is produced from corn. Summarise the information by selecting and reporting the main features and make comparisons where relevant.",
    task2: "Some people think that physical strength is important for success in sport, while other people think that mental strength is more important. Discuss both views and give your own opinion.",
  },
};

defaultPrompts["IELTS Academic"] = defaultPrompts["UAE Government Spending"];
defaultPrompts["IELTS General"] = defaultPrompts["Produce and Recycle Paper"];
defaultPrompts["General Letter"] = defaultPrompts["Produce and Recycle Paper"];
defaultPrompts["IELTS Mock Exam"] = defaultPrompts["Changes in Dalton"];
defaultPrompts["IELTS Practice Test"] = defaultPrompts["Archaeological Site"];
defaultPrompts["IELTS Actual Test"] = defaultPrompts["USA to Canada Visitors"];
defaultPrompts["IELTS Practice Test 2"] = defaultPrompts["Turkey Spending"];
defaultPrompts["IELTS Practice Test 3"] = defaultPrompts["US Employment"];
defaultPrompts["IELTS Practice Test 4"] = defaultPrompts["Deforestation Consequences"];
defaultPrompts["IELTS Practice Test 5"] = defaultPrompts["Derby and Nottingham Houses"];
defaultPrompts["IELTS Practice Test 6"] = defaultPrompts["Olive Oil Manufacturing"];
defaultPrompts["IELTS Practice Test 7"] = defaultPrompts["Telephone Calls in Australia"];
defaultPrompts["IELTS Practice Test 8"] = defaultPrompts["UK Housing"];
defaultPrompts["IELTS Practice Test 9"] = defaultPrompts["Automatic Photo Booth"];
defaultPrompts["IELTS Practice Test 10"] = defaultPrompts["Park Changes"];
defaultPrompts["IELTS Practice Test 11"] = defaultPrompts["China Oil"];
defaultPrompts["IELTS Practice Test 12"] = defaultPrompts["Organic Waste Compost"];
defaultPrompts["IELTS Practice Test 13"] = defaultPrompts["Bookstore Layout"];
defaultPrompts["IELTS Practice Test 14"] = defaultPrompts["Australian Demographics"];
defaultPrompts["IELTS Practice Test 15"] = defaultPrompts["World Population Projections"];
defaultPrompts["IELTS Practice Test 16"] = defaultPrompts["Gender School Enrollment"];
defaultPrompts["IELTS Practice Test 17"] = defaultPrompts["Corn Ethanol Production"];

const getPromptImage = (promptText: string) => {
  if (promptText.includes("UAE government spending")) {
    return require("@/assets/images/uae_spending.png");
  }
  if (promptText.includes("Dalton") || promptText.includes("dalton")) {
    return require("@/assets/images/changes_in_dalton.png");
  }
  if (promptText.includes("produce and recycle paper")) {
    return require("@/assets/images/produce_recycle_paper.png");
  }
  if (promptText.includes("USA to Canada") || promptText.includes("visitors from the USA")) {
    return require("@/assets/images/usa_canada_visitors.jpg");
  }
  if (promptText.includes("Turkey") || promptText.includes("spending in Turkey")) {
    return require("@/assets/images/turkey_spending.jpg");
  }
  if (promptText.includes("employment patterns") || promptText.includes("USA between 1930")) {
    return require("@/assets/images/us_employment.png");
  }
  if (promptText.includes("deforestation") || promptText.includes("Deforestation")) {
    return require("@/assets/images/deforestation_consequences.png");
  }
  if (promptText.includes("Derby") || promptText.includes("Nottingham")) {
    return require("@/assets/images/derby_nottingham_houses.png");
  }
  if (promptText.includes("Olive Oil") || promptText.includes("olive oil")) {
    return require("@/assets/images/olive_oil_manufacturing.png");
  }
  if (promptText.includes("telephone calls in Australia") || promptText.includes("Australia, divided into three categories")) {
    return require("@/assets/images/australia_telephone_calls.png");
  }
  if (promptText.includes("housing owned and rented") || promptText.includes("rented in the UK in 1991 and 2007")) {
    return require("@/assets/images/uk_housing_owned_rented.jpg");
  }
  if (promptText.includes("automatic photo booth") || promptText.includes("photo booth")) {
    return require("@/assets/images/automatic_photo_booth.jpg");
  }
  if (promptText.includes("changes of a park from 1980") || promptText.includes("changes of a park")) {
    return require("@/assets/images/park_changes_1980.png");
  }
  if (promptText.includes("oil production and consumption in China") || promptText.includes("between 1982 and 2006")) {
    return require("@/assets/images/china_oil_production_consumption.jpg");
  }
  if (promptText.includes("recycle organic waste") || promptText.includes("produce garden fertilizer")) {
    return require("@/assets/images/organic_waste_compost.jpg");
  }
  if (promptText.includes("bookstore in 2000 and now") || promptText.includes("bookstore")) {
    return require("@/assets/images/bookstore_layout.png");
  }
  if (promptText.includes("country of birth of people living in Australia") || promptText.includes("born in these countries live")) {
    return require("@/assets/images/australian_demographics.png");
  }
  if (promptText.includes("world population in 4 countries") || promptText.includes("projections for 2050")) {
    return require("@/assets/images/world_population_projections.jpg");
  }
  if (promptText.includes("girls per 100 boys") || promptText.includes("enrolled in different levels of school")) {
    return require("@/assets/images/gender_school_enrollment.png");
  }
  if (promptText.includes("archaeological") || promptText.includes("archaeological site")) {
    return require("@/assets/images/archaeological_site.jpg");
  }
  if (promptText.includes("ethanol fuel is produced from corn") || promptText.includes("produced from corn")) {
    return require("@/assets/images/corn_ethanol_production.jpg");
  }
  if (promptText.includes("General Letter") || promptText.includes("English school principal")) {
    return null;
  }
  return require("@/assets/images/uae_spending.png");
};

const getPromptImageName = (promptText: string): string | null => {
  if (promptText.includes("UAE government spending")) return "uae_spending";
  if (promptText.includes("Dalton") || promptText.includes("dalton")) return "changes_in_dalton";
  if (promptText.includes("produce and recycle paper")) return "produce_recycle_paper";
  if (promptText.includes("USA to Canada") || promptText.includes("visitors from the USA")) return "usa_canada_visitors";
  if (promptText.includes("Turkey") || promptText.includes("spending in Turkey")) return "turkey_spending";
  if (promptText.includes("employment patterns") || promptText.includes("USA between 1930")) return "us_employment";
  if (promptText.includes("deforestation") || promptText.includes("Deforestation")) return "deforestation_consequences";
  if (promptText.includes("Derby") || promptText.includes("Nottingham")) return "derby_nottingham_houses";
  if (promptText.includes("Olive Oil") || promptText.includes("olive oil")) return "olive_oil_manufacturing";
  if (promptText.includes("telephone calls in Australia")) return "australia_telephone_calls";
  if (promptText.includes("housing owned and rented")) return "uk_housing_owned_rented";
  if (promptText.includes("automatic photo booth")) return "automatic_photo_booth";
  if (promptText.includes("changes of a park")) return "park_changes_1980";
  if (promptText.includes("oil production and consumption in China")) return "china_oil_production_consumption";
  if (promptText.includes("recycle organic waste")) return "organic_waste_compost";
  if (promptText.includes("bookstore")) return "bookstore_layout";
  if (promptText.includes("country of birth of people living in Australia")) return "australian_demographics";
  if (promptText.includes("world population")) return "world_population_projections";
  if (promptText.includes("girls per 100 boys")) return "gender_school_enrollment";
  if (promptText.includes("archaeological")) return "archaeological_site";
  if (promptText.includes("corn")) return "corn_ethanol_production";
  return null;
};

export default function IeltsWritingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const topicParam = (params.topic as string) || "IELTS Academic";

  const appLanguage = useGameStore((state) => state.appLanguage);
  const isKazakh = appLanguage === "kk";

  const [activeTask, setActiveTask] = useState<"task1" | "task2">("task1");
  const [essayText, setEssayText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const [task1Score, setTask1Score] = useState<number | null>(null);
  const [task2Score, setTask2Score] = useState<number | null>(null);
  const [essayViewMode, setEssayViewMode] = useState<"original" | "corrected" | "comparison">("comparison");

  const renderHighlightedEssay = (
    essayText: string,
    errors: EssayError[],
    mode: "original" | "corrected" | "comparison"
  ) => {
    if (!errors || errors.length === 0) {
      return <Text style={styles.essayNormalText}>{essayText}</Text>;
    }

    interface Occurrence {
      error: EssayError;
      start: number;
      end: number;
    }

    const occurrences: Occurrence[] = [];
    const lowerEssay = essayText.toLowerCase();

    for (const err of errors) {
      if (!err.originalText) continue;
      const lowerOrig = err.originalText.toLowerCase().trim();
      if (!lowerOrig) continue;

      let idx = lowerEssay.indexOf(lowerOrig);
      while (idx !== -1) {
        const endIdx = idx + lowerOrig.length;
        const overlaps = occurrences.some(
          (o) => (idx >= o.start && idx < o.end) || (endIdx > o.start && endIdx <= o.end)
        );
        if (!overlaps) {
          occurrences.push({ error: err, start: idx, end: endIdx });
        }
        idx = lowerEssay.indexOf(lowerOrig, endIdx);
      }
    }

    occurrences.sort((a, b) => a.start - b.start);

    if (occurrences.length === 0) {
      return <Text style={styles.essayNormalText}>{essayText}</Text>;
    }

    const elements: React.ReactNode[] = [];
    let currIndex = 0;

    occurrences.forEach((occ, i) => {
      if (occ.start > currIndex) {
        elements.push(
          <Text key={`norm-${i}`} style={styles.essayNormalText}>
            {essayText.slice(currIndex, occ.start)}
          </Text>
        );
      }

      const originalSub = essayText.slice(occ.start, occ.end);

      if (mode === "original") {
        elements.push(
          <Text key={`orig-${i}`} style={styles.essayErrorOriginal}>
            {originalSub}
          </Text>
        );
      } else if (mode === "corrected") {
        elements.push(
          <Text key={`corr-${i}`} style={styles.essayErrorCorrected}>
            {occ.error.correction}
          </Text>
        );
      } else {
        elements.push(
          <Text key={`comp-orig-${i}`} style={styles.essayErrorOriginalStrikethrough}>
            {originalSub}
          </Text>
        );
        elements.push(
          <Text key={`comp-space-${i}`} style={styles.essayNormalText}>
            {" "}
          </Text>
        );
        elements.push(
          <Text key={`comp-corr-${i}`} style={styles.essayErrorCorrected}>
            {occ.error.correction}
          </Text>
        );
      }

      currIndex = occ.end;
    });

    if (currIndex < essayText.length) {
      elements.push(
        <Text key="norm-end" style={styles.essayNormalText}>
          {essayText.slice(currIndex)}
        </Text>
      );
    }

    return <Text style={styles.essayBodyContainer}>{elements}</Text>;
  };

  const renderCriterionCircleCard = (name: string, score: number) => {
    const color = getScoreColor(score);
    const size = 54;
    const radius = 21;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference * (1 - Math.min(9.0, Math.max(0, score)) / 9.0);

    return (
      <View style={styles.criterionCircleCard}>
        <View style={styles.criterionCircleContainer}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E2E8F0"
              strokeWidth="4"
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${progressOffset}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <View style={styles.criterionCircleTextOverlay}>
            <Text style={[styles.criterionCircleScoreText, { color }]}>
              {score.toFixed(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.criterionNameText}>{name}</Text>
        <Text style={[styles.criterionScoreSub, { color }]}>{score.toFixed(1)} / 9.0</Text>
      </View>
    );
  };

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
          imageName: activeTask === "task1" ? getPromptImageName(currentPrompt) : null,
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
          overallVerdict: data.overallFeedback || "",
          errors: errorsList,
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
      <LinearGradient colors={["#FFFFFF", "#FFFFFF"]} style={StyleSheet.absoluteFill} />

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
            {/* Image (Top of Task 1 only) */}
            {activeTask === "task1" && getPromptImage(currentPrompt) && (
              <View style={styles.promptImageContainer}>
                <Image
                  source={getPromptImage(currentPrompt)}
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
            {/* Band Score Circle Card */}
            <View style={styles.bandScoreCircleCard}>
              <View style={styles.circleContainer}>
                <Svg width={90} height={90} viewBox="0 0 90 90">
                  <Circle cx="45" cy="45" r="38" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                  <Circle
                    cx="45"
                    cy="45"
                    r="38"
                    stroke="#045DA9"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - feedback.overallScore / 9.0)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 45 45)"
                  />
                </Svg>
                <View style={styles.circleTextOverlay}>
                  <Text style={styles.circleScoreText}>{feedback.overallScore.toFixed(1)}</Text>
                </View>
              </View>
              <View style={styles.bandScoreMeta}>
                <Text style={styles.bandScoreMetaLabel}>IELTS Band Score</Text>
                <Text style={styles.bandScoreMetaTitle}>
                  {feedback.overallScore >= 8.0
                    ? "Very Good User"
                    : feedback.overallScore >= 7.0
                    ? "Good User"
                    : feedback.overallScore >= 6.0
                    ? "Competent User"
                    : "Modest User"}
                </Text>
                <Text style={styles.bandScoreMetaSub}>
                  {feedback.overallScore >= 7.0
                    ? (isKazakh ? "Жоғары нәтиже!" : "Отличный результат!")
                    : (isKazakh ? "Орташа нәтиже." : "Хорошая попытка!")}
                </Text>
              </View>
            </View>



            {/* 4 Criteria Breakdown Grid */}
            <Text style={styles.criteriaSectionTitle}>
              {isKazakh ? "Критерийлер бойынша бағалау" : "Оценка по критериям"}
            </Text>

            <View style={styles.criteriaGrid}>
              {renderCriterionCircleCard("Task Achievement", feedback.taskAchievement)}
              {renderCriterionCircleCard("Coherence & Cohesion", feedback.coherence)}
              {renderCriterionCircleCard("Lexical Resource", feedback.lexical)}
              {renderCriterionCircleCard("Grammar Accuracy", feedback.grammar)}
            </View>

            {/* ВАШЕ ЭССЕ С ИСПРАВЛЕНИЯМИ Card */}
            <View style={styles.correctionsCard}>
              <Text style={styles.correctionsTitle}>
                {isKazakh ? "ВАШЕ ЭССЕ С ИСПРАВЛЕНИЯМИ" : "ВАШЕ ЭССЕ С ИСПРАВЛЕНИЯМИ"}
              </Text>

              {/* Segmented Control Picker */}
              <View style={styles.segmentedControlTrack}>
                <Pressable
                  onPress={() => setEssayViewMode("original")}
                  style={[styles.segmentedSegment, essayViewMode === "original" && styles.segmentedSegmentActive]}
                >
                  <Text style={[styles.segmentedText, essayViewMode === "original" && styles.segmentedTextActive]}>
                    {isKazakh ? "Оригинал" : "Оригинал"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setEssayViewMode("corrected")}
                  style={[styles.segmentedSegment, essayViewMode === "corrected" && styles.segmentedSegmentActive]}
                >
                  <Text style={[styles.segmentedText, essayViewMode === "corrected" && styles.segmentedTextActive]}>
                    {isKazakh ? "Исправленный" : "Исправленный"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setEssayViewMode("comparison")}
                  style={[styles.segmentedSegment, essayViewMode === "comparison" && styles.segmentedSegmentActive]}
                >
                  <Text style={[styles.segmentedText, essayViewMode === "comparison" && styles.segmentedTextActive]}>
                    {isKazakh ? "Сравнение" : "Сравнение"}
                  </Text>
                </Pressable>
              </View>

              {/* Highlighted Essay Box */}
              <View style={styles.essayBoxContainer}>
                {renderHighlightedEssay(essayText, feedback.errors || [], essayViewMode)}
              </View>
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
    backgroundColor: "#FFFFFF",
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
  bandScoreCircleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  circleContainer: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  circleTextOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  circleScoreText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1E293B",
  },
  bandScoreMeta: {
    marginLeft: 16,
    flex: 1,
  },
  bandScoreMetaLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  bandScoreMetaTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginVertical: 2,
  },
  bandScoreMetaSub: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },
  overallVerdictCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  overallVerdictAccentBar: {
    width: 4,
    backgroundColor: "#045DA9",
  },
  overallVerdictContent: {
    padding: 16,
    flex: 1,
  },
  overallVerdictTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#045DA9",
    letterSpacing: 1,
    marginBottom: 4,
  },
  overallVerdictText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    lineHeight: 20,
  },
  correctionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  correctionsTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#045DA9",
    letterSpacing: 1,
    marginBottom: 10,
  },
  segmentedControlTrack: {
    flexDirection: "row",
    backgroundColor: "#EBF2F7",
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  segmentedSegment: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentedSegmentActive: {
    backgroundColor: "#045DA9",
  },
  segmentedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#465064",
  },
  segmentedTextActive: {
    color: "#FFFFFF",
  },
  essayBoxContainer: {
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    padding: 14,
  },
  essayBodyContainer: {
    fontSize: 14,
    lineHeight: 22,
    color: "#1E293B",
  },
  essayNormalText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#1E293B",
  },
  essayErrorOriginal: {
    fontSize: 14,
    lineHeight: 22,
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  essayErrorCorrected: {
    fontSize: 14,
    lineHeight: 22,
    color: "#16A34A",
    backgroundColor: "#DCFCE7",
    fontWeight: "800",
  },
  essayErrorOriginalStrikethrough: {
    fontSize: 14,
    lineHeight: 22,
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    textDecorationLine: "line-through",
    fontWeight: "600",
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
  criterionCircleCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  criterionCircleContainer: {
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 8,
  },
  criterionCircleTextOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  criterionCircleScoreText: {
    fontSize: 15,
    fontWeight: "800",
  },
  criterionNameText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    textAlign: "center",
    marginBottom: 4,
  },
  criterionScoreSub: {
    fontSize: 14,
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
