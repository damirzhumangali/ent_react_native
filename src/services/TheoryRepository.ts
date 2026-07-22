import { Subject } from "../models/subject";

export interface Theory {
  topic: string;
  subject: Subject;
  summary: string;
  content: string;
  formula: string;
  exampleQuestion: string;
  exampleAnswer: string;
}

export class TheoryRepository {
  private static cachedTheory: Theory[] | null = null;
  private theoryLessons: Theory[] = [];

  constructor() {
    if (TheoryRepository.cachedTheory) {
      this.theoryLessons = TheoryRepository.cachedTheory;
    } else {
      try {
        const loaded = require("../../assets/theory.json") as Theory[];
        TheoryRepository.cachedTheory = loaded;
        this.theoryLessons = loaded;
      } catch (e) {
        console.error("Error loading theory.json:", e);
        this.theoryLessons = [];
      }
    }
  }

  public loadTheory(): Theory[] {
    return this.theoryLessons;
  }

  public getTheory(topic: string, subject: Subject): Theory | null {
    const exact = this.theoryLessons.find(
      (t) => t.topic.toLowerCase() === topic.toLowerCase() && t.subject === subject
    );
    if (exact) return exact;

    // Fuzzy matching by section numbers (e.g. from "1-1. ...", "1-БӨЛІМ...", "Раздел 1...")
    const getSectionNumber = (str: string): number | null => {
      const normalized = str.toLowerCase().trim();

      // Try matching prefix "number-" (like "1-1", "1-бөлім")
      const dashComponents = normalized.split("-");
      if (dashComponents.length > 0) {
        const first = parseInt(dashComponents[0].trim(), 10);
        if (!isNaN(first)) return first;
      }

      // Try matching "раздел X" or "X-бөлім" using simple regex
      const matchRazdel = normalized.match(/раздел\s+(\d+)/);
      if (matchRazdel && matchRazdel[1]) {
        return parseInt(matchRazdel[1], 10);
      }

      const matchBolim = normalized.match(/(\d+)-бөлім/);
      if (matchBolim && matchBolim[1]) {
        return parseInt(matchBolim[1], 10);
      }

      // General digit extractor fallback
      const digits = normalized.replace(/\D/g, "");
      if (digits.length > 0) {
        return parseInt(digits[0], 10);
      }

      return null;
    };

    const targetSec = getSectionNumber(topic);
    if (targetSec !== null) {
      const matched = this.theoryLessons.find(
        (t) => t.subject === subject && getSectionNumber(t.topic) === targetSec
      );
      if (matched) return matched;
    }

    return null;
  }
}
