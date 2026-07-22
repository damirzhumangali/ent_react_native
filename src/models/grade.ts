import { Subject } from "./subject";

export interface GradeTopic {
  id: string; // UUID equivalent
  name: string;
  subject: Subject;
}

export interface GradeInfo {
  id: number; // 5 to 11
  name: string; // e.g. "5 класс"
  description: string;
  icon: string;
  topics: GradeTopic[];
}

export const gradesList: GradeInfo[] = [
  {
    id: 5,
    name: "5 класс",
    description: "Начало средней школы",
    icon: "🎒",
    topics: [
      { id: "5-1", name: "Натуральные числа", subject: Subject.math },
      { id: "5-2", name: "Обыкновенные дроби", subject: Subject.math },
      { id: "5-3", name: "Десятичные дроби", subject: Subject.math },
      { id: "5-4", name: "Уравнения", subject: Subject.math },
      { id: "5-5", name: "Проценты", subject: Subject.math },
      { id: "5-6", name: "Орфография", subject: Subject.language },
      { id: "5-7", name: "Древние племена", subject: Subject.history }
    ]
  },
  {
    id: 6,
    name: "6 класс",
    description: "Пропорции и координаты",
    icon: "📚",
    topics: [
      { id: "6-1", name: "Пропорции", subject: Subject.mathLiteracy },
      { id: "6-2", name: "Отрицательные числа", subject: Subject.math },
      { id: "6-3", name: "Делимость чисел", subject: Subject.math },
      { id: "6-4", name: "Материки и океаны", subject: Subject.geography },
      { id: "6-5", name: "Горные системы", subject: Subject.geography },
      { id: "6-6", name: "Золотая Орда", subject: Subject.history }
    ]
  },
  {
    id: 7,
    name: "7 класс",
    description: "Введение в алгебру и физику",
    icon: "📐",
    topics: [
      { id: "7-1", name: "Линейные уравнения", subject: Subject.math },
      { id: "7-2", name: "Степень с целым показателем", subject: Subject.math },
      { id: "7-3", name: "Кинематика", subject: Subject.physics },
      { id: "7-4", name: "Динамика", subject: Subject.physics },
      { id: "7-5", name: "Клеточное строение", subject: Subject.biology }
    ]
  },
  {
    id: 8,
    name: "8 класс",
    description: "Корни и периоды",
    icon: "🧪",
    topics: [
      { id: "8-1", name: "Квадратные корни", subject: Subject.math },
      { id: "8-2", name: "Квадратные уравнения", subject: Subject.math },
      { id: "8-3", name: "Периодическая таблица", subject: Subject.chemistry },
      { id: "8-4", name: "Генетика", subject: Subject.biology }
    ]
  },
  {
    id: 9,
    name: "9 класс",
    description: "Подготовка к старшим классам",
    icon: "🎒",
    topics: [
      { id: "9-1", name: "Векторы", subject: Subject.math },
      { id: "9-2", name: "Многоугольники", subject: Subject.math },
      { id: "9-3", name: "Электростатика", subject: Subject.physics },
      { id: "9-4", name: "Электромагнетизм", subject: Subject.physics },
      { id: "9-5", name: "Национально-освободительные восстания", subject: Subject.history }
    ]
  },
  {
    id: 10,
    name: "10 класс",
    description: "Профильное обучение",
    icon: "🎓",
    topics: [
      { id: "10-1", name: "Тригонометрия", subject: Subject.math },
      { id: "10-2", name: "Прогрессии", subject: Subject.math },
      { id: "10-3", name: "Термодинамика", subject: Subject.physics },
      { id: "10-4", name: "Оптика", subject: Subject.physics },
      { id: "10-5", name: "Казахско-джунгарские войны", subject: Subject.history }
    ]
  },
  {
    id: 11,
    name: "11 класс",
    description: "Подготовка к ЕНТ",
    icon: "🏆",
    topics: [
      { id: "11-1", name: "Производная", subject: Subject.math },
      { id: "11-2", name: "Интегралы", subject: Subject.math },
      { id: "11-3", name: "Логарифмические уравнения", subject: Subject.math },
      { id: "11-4", name: "Показательные уравнения", subject: Subject.math },
      { id: "11-5", name: "Квантовая физика", subject: Subject.physics },
      { id: "11-6", name: "Современный Казахстан", subject: Subject.history }
    ]
  }
];
