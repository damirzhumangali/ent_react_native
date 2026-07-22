import { Subject } from "../models/subject";
import { Question } from "../models/question";

export class QuestionRepository {
  private static cachedQuestions: { [key in Subject]?: Question[] } = {};

  /**
   * Lazily loads questions for a specific subject only when needed.
   * Leverages static require() statements to comply with Metro's bundler rules
   * while keeping JSON parsing lazy and thread-safe.
   */
  public static getQuestionsForSubject(subject: Subject): Question[] {
    // Return cached list if already loaded in memory during this app session
    if (this.cachedQuestions[subject]) {
      return this.cachedQuestions[subject]!;
    }

    let loadedQuestions: Question[] = [];

    // Metro requires static string paths inside require()
    switch (subject) {
      case Subject.math:
        loadedQuestions = require("../../assets/questions/math.json");
        break;
      case Subject.physics:
        loadedQuestions = require("../../assets/questions/physics.json");
        break;
      case Subject.geography:
        loadedQuestions = require("../../assets/questions/geography.json");
        break;
      case Subject.ieltsReading:
        loadedQuestions = require("../../assets/questions/ieltsReading.json");
        break;
      case Subject.ieltsWriting:
        loadedQuestions = require("../../assets/questions/ieltsWriting.json");
        break;
      case Subject.ieltsSpeaking:
        loadedQuestions = require("../../assets/questions/ieltsSpeaking.json");
        break;
      case Subject.chemistry:
        loadedQuestions = require("../../assets/questions/chemistry.json");
        break;
      case Subject.reading:
        loadedQuestions = require("../../assets/questions/reading.json");
        break;
      case Subject.mathLiteracy:
        loadedQuestions = require("../../assets/questions/mathLiteracy.json");
        break;
      case Subject.biology:
        loadedQuestions = require("../../assets/questions/biology.json");
        break;
      case Subject.history:
        loadedQuestions = require("../../assets/questions/history.json");
        break;
      case Subject.informatics:
        loadedQuestions = require("../../assets/questions/informatics.json");
        break;
      case Subject.worldHistory:
        loadedQuestions = require("../../assets/questions/worldHistory.json");
        break;
      case Subject.language:
        loadedQuestions = require("../../assets/questions/language.json");
        break;
      case Subject.literature:
        loadedQuestions = require("../../assets/questions/literature.json");
        break;
      case Subject.ieltsListening:
        loadedQuestions = require("../../assets/questions/ieltsListening.json");
        break;
      default:
        loadedQuestions = [];
    }

    // Cache the loaded list to avoid redundant require() evaluations
    this.cachedQuestions[subject] = loadedQuestions;
    return loadedQuestions;
  }

  // Equivalents list matching Swift QuestionRepository
  private static readonly equivalents: string[][] = [
    [
      "қозғалыс пен жұмыс", "1-4. бірнеше натурал санның ең кіші ортақ еселігі (екое)", 
      "1-5. наибольший общий делитель нескольких натуральных чисел (нод)", "обыкновенные дроби", 
      "1-9. амалдарды орындау", "1-2. амалдарды орындау реті", "1-6. бағандап қосу, азайту, көбейту, бөлу", 
      "1-7. жай бөлшектер", "1-3. операции с математическими знаками", "1-10. шексіз периодты ондық бөлшектер", 
      "движение и работа", "1-2. порядок выполнения операций", "проценты", "1-7. обыкновенные дроби", 
      "1-1. сандардың түрлері. натурал санның бөлінгіштік белгілері", "1-8. ондық бөлшектер", 
      "қаржылық математика", "проценты, сплавы, смеси", "1-1. виды чисел. признаки делимости натуральных чисел", 
      "натурал сандар", "1-3. математикалық таңбалармен амалдар", "действительные числа, модуль", 
      "нақты сандар, модуль", "пропорции", "1-4. наименьшее общее кратное нескольких натуральных чисел (нок)", 
      "натуральные числа", "проценттер, қорытпалар, қоспалар", "1-9. выполнение операций", 
      "1-5. бірнеше натурал санның ең үлкен ортақ бөлгіші (еүоб)", "финансовая математика", 
      "1-8. десятичные дроби", "1-10. бесконечные периодические десятичные дроби", 
      "1-6. сложение, вычитание, умножение, деление столбиком", "десятичные дроби"
    ],
    [
      "2-6. бір айнымалысы бар сызықтық теңсіздіктер жүйесі", "2-4. составление систем уравнений по условию задачи", 
      "уравнения", "рационал теңдеулер мен теңсіздіктер", "2-2. составление уравнений по условию задачи", 
      "2-5. бір айнымалысы бар сызықтық теңсіздіктер", "2-4. есеп шарты бойынша теңдеулер жүйесін құру", 
      "2-3. екі айнымалысы бар сызықтық теңдеулер жүйесі", "2-6. системы линейных неравенств с одной переменной", 
      "2-5. линейные неравенства с одной переменной", "логические задачи на возраст", 
      "рациональные уравнения и неравенства", "линейные и квадратные уравнения", 
      "2-1. линейные уравнения с одной переменной", "2-1. бір айнымалысы бар сызықтық теңдеулер", 
      "2-2. есеп шарты бойынша теңдеу құру", "сызықтық және квадраттық теңдеулер", 
      "логикалық есептер", "2-3. systems linear equations with two variables", 
      "2-3. системы линейных уравнений с двумя переменными"
    ],
    [
      "3-3. дәрежелі сандардың қандай цифрмен аяқталатындығына байланысты ережелер", "дәрежелер мен түбірлер", 
      "3-4. арифметикалық түбірдің қасиеттері", "3-1. многочлены. упрощение выражений", "степени и корни", 
      "3-4. свойства арифметического корня", "тепе-тең түрлендірулер", "3-1. көпмүшелер. өрнектерді ықшамдау", 
      "3-5. бөлшектің бөліміндегі иррационалдықтан құтылу", "3-5. освобождение знаменателя от иррациональности", 
      "3-3. правила последней цифры степеней", "тождественные преобразования", "3-2. свойства степеней", 
      "3-2. дәреженің қасиеттері"
    ],
    [
      "4-4. екі айнымалысы бар сызықтық емес теңдеулер жүйесі", "4-3. квадратные уравнения", 
      "4-5. бөлшек-рационал теңдеулер", "4-1. квадрат үшмүшені сызықтық көбейткіштерге жіктеу", 
      "4-6. нелинейные неравенства с одной переменной", "4-3. квадрат теңдеулер", 
      "4-4. systems of non-linear equations with two variables", "4-1. разложение квадратного трехчлена на множители", 
      "4-5. дробно-рациональные уравнения", "4-2. квадрат үшмүшелі бөлшектерді қысқарту", 
      "4-7. системы нелинейных неравенств с одной переменной", "сызықтық и квадратные уравнения", 
      "линейные и квадратные уравнения", "системы уравнений и неравенств", 
      "4-7. бір айнымалысы бар сызықтық емес теңсіздіктер жүйесі", "теңдеулер мен теңсіздіктер жүйелері", 
      "4-2. сокращение дробей с квадратным трехчленом", "4-6. бір айнымалысы бар сызықтық емес теңсіздіктер"
    ],
    [
      "5-1. иррациональные уравнения", "5-1. иррационал теңдеулер", "5-4. иррационал теңсіздіктер жүйесі", 
      "5-3. иррациональные неравенства", "5-3. иррационал теңсіздіктер", "иррационал теңдеулер", 
      "5-2. системы иррациональных уравнений", "5-4. системы иррациональных неравенств", 
      "иррациональные уравнения", "5-2. иррационал теңдеулер жүйесі", "иррационал теңдеулер мен теңсіздіктер"
    ]
  ];

  /**
   * Helper function to match topics across languages (KK/RU) and equivalents.
   */
  public static isEquivalentTopic(t1: string, t2: string): boolean {
    const normalized1 = t1.trim().toLowerCase();
    const normalized2 = t2.trim().toLowerCase();
    
    if (normalized1 === normalized2) return true;

    for (const eq of this.equivalents) {
      if (eq.includes(normalized1) && eq.includes(normalized2)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns a random question for the subject, optionally filtering by topic.
   */
  public static getRandomQuestion(subject: Subject, topic?: string): Question | null {
    const questions = this.getQuestionsForSubject(subject);
    if (!questions || questions.length === 0) return null;

    if (topic) {
      const filtered = questions.filter((q) => this.isEquivalentTopic(q.topic ?? "", topic));
      if (filtered.length > 0) {
        const randomIndex = Math.floor(Math.random() * filtered.length);
        return filtered[randomIndex];
      }
    }

    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  }

  /**
   * Calculates combat damage based on correctness and answer speed.
   */
  public static calculateDamage(question: Question, selectedAnswerIndex: number, timeTaken: number, baseDamage: number): number {
    if (selectedAnswerIndex !== question.correctAnswerIndex) {
      return 0;
    }

    // Critical hit (1.5x damage) if answered within 5.0 seconds
    if (timeTaken <= 5.0) {
      return Math.round(baseDamage * 1.5);
    }
    return baseDamage;
  }
}
