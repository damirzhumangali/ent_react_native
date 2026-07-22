import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Subject } from "../models/subject";
import { Hero } from "../models/hero";

const memoryStorage = new Map<string, string>();

const safeAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
    } catch (e) {
      // Fallback
    }
    return memoryStorage.get(key) || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memoryStorage.set(key, value);
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      // Fallback ignore
    }
  },
  removeItem: async (key: string): Promise<void> => {
    memoryStorage.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      // Fallback ignore
    }
  }
};

interface GameState {
  // Persistence Variables
  username: string;
  selectedAvatar: string;
  userProfile: string;
  userClass: string;
  selectedWallpaper: string;
  appLanguage: "ru" | "kk";
  userGold: number;
  userGems: number;
  userTrophies: number;
  lastFreeChestClaimed: number; // timestamp
  lastDailyChestClaimed: number; // timestamp
  unlockedPremiumMath: boolean;
  unlockedPremiumPhysics: boolean;
  mockTestStatus: "notStarted" | "completedTrial" | "purchasedFull";
  hasCompletedOnboarding: boolean;
  claimedTrophyMilestones: string;
  completedTopics: string;
  
  // Custom states for unlocked wall papers
  unlockedWallpapers: string[]; // e.g. ["battle", "neon", "emerald", "volcano", "cosmic"]

  // Heroes states
  heroes: Hero[];

  // Action methods
  setUsername: (name: string) => void;
  setSelectedAvatar: (avatar: string) => void;
  setUserProfile: (profile: string) => void;
  setUserClass: (userClass: string) => void;
  setSelectedWallpaper: (wallpaper: string) => void;
  setAppLanguage: (lang: "ru" | "kk") => void;
  addGold: (amount: number) => void;
  subtractGold: (amount: number) => boolean;
  addGems: (amount: number) => void;
  subtractGems: (amount: number) => boolean;
  addTrophies: (amount: number) => void;
  claimFreeChest: () => void;
  claimDailyChest: () => void;
  unlockPremiumMath: () => void;
  unlockPremiumPhysics: () => void;
  setMockTestStatus: (status: "notStarted" | "completedTrial" | "purchasedFull") => void;
  completeOnboarding: () => void;
  unlockHero: (heroId: string) => void;
  upgradeHero: (heroId: string) => boolean;
  unlockWallpaper: (wallpaperId: string, cost: number) => boolean;
  claimTrophyMilestone: (id: number) => void;
  completeTopic: (topicName: string) => void;
}

const initialHeroes: Hero[] = [
  {
    id: "math",
    name: "Математик",
    subject: Subject.math,
    isPremium: false,
    icon: "📐",
    energyCost: 2,
    baseDamage: 45,
    ability: { name: "Уравнение", description: "Удар по всем башням сразу" },
    level: 1,
    xp: 0
  },
  {
    id: "history",
    name: "Историк",
    subject: Subject.history,
    isPremium: false,
    icon: "📜",
    energyCost: 2,
    baseDamage: 40,
    ability: { name: "Хронос", description: "Заморозка атак противника" },
    level: 1,
    xp: 0
  },
  {
    id: "reading",
    name: "Грамотей",
    subject: Subject.reading,
    isPremium: false,
    icon: "📖",
    energyCost: 2,
    baseDamage: 35,
    ability: { name: "Цитата", description: "Время на ответ сокращается" },
    level: 1,
    xp: 0
  },
  {
    id: "logic",
    name: "Логик",
    subject: Subject.mathLiteracy,
    isPremium: false,
    icon: "🔢",
    energyCost: 2,
    baseDamage: 30,
    ability: { name: "Формула", description: "Поглощает следующий удар" },
    level: 1,
    xp: 0
  },
  {
    id: "physics",
    name: "Физик",
    subject: Subject.physics,
    isPremium: true,
    icon: "⚛️",
    energyCost: 2,
    baseDamage: 50,
    ability: { name: "Импульс", description: "Наносит дополнительный критический урон" },
    level: 1,
    xp: 0
  },
  {
    id: "chemistry",
    name: "Химик",
    subject: Subject.chemistry,
    isPremium: true,
    icon: "🧪",
    energyCost: 2,
    baseDamage: 45,
    ability: { name: "Реакция", description: "Разрушает вражеский щит" },
    level: 1,
    xp: 0
  },
  {
    id: "biology",
    name: "Биолог",
    subject: Subject.biology,
    isPremium: true,
    icon: "🌿",
    energyCost: 2,
    baseDamage: 35,
    ability: { name: "Регенерация", description: "Лечит союзную башню" },
    level: 1,
    xp: 0
  },
  {
    id: "geography",
    name: "Географ",
    subject: Subject.geography,
    isPremium: true,
    icon: "🌍",
    energyCost: 2,
    baseDamage: 40,
    ability: { name: "Землетрясение", description: "Удар по всем башням" },
    level: 1,
    xp: 0
  },
  {
    id: "linguist",
    name: "Лингвист",
    subject: Subject.language,
    isPremium: true,
    icon: "💬",
    energyCost: 2,
    baseDamage: 40,
    ability: { name: "Диалог", description: "Восстанавливает 1 энергию" },
    level: 1,
    xp: 0
  }
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Defaults matching SwiftUI
      username: "Абитуриент",
      selectedAvatar: "math_avatar",
      userProfile: "Физика-Математика (Физмат)",
      userClass: "11 класс",
      selectedWallpaper: "battle",
      appLanguage: "ru",
      userGold: 1250,
      userGems: 45,
      userTrophies: 150,
      lastFreeChestClaimed: 0,
      lastDailyChestClaimed: 0,
      unlockedPremiumMath: false,
      unlockedPremiumPhysics: false,
      mockTestStatus: "notStarted",
      hasCompletedOnboarding: false,
      claimedTrophyMilestones: "",
      completedTopics: "",
      unlockedWallpapers: ["battle", "cosmic"], // defaults
      heroes: initialHeroes,

      // Actions
      setUsername: (name) => set({ username: name }),
      setSelectedAvatar: (avatar) => set({ selectedAvatar: avatar }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setUserClass: (userClass) => set({ userClass: userClass }),
      setSelectedWallpaper: (wallpaper) => set({ selectedWallpaper: wallpaper }),
      setAppLanguage: (lang) => set({ appLanguage: lang }),
      
      addGold: (amount) => set((state) => ({ userGold: state.userGold + amount })),
      subtractGold: (amount) => {
        if (get().userGold >= amount) {
          set((state) => ({ userGold: state.userGold - amount }));
          return true;
        }
        return false;
      },
      
      addGems: (amount) => set((state) => ({ userGems: state.userGems + amount })),
      subtractGems: (amount) => {
        if (get().userGems >= amount) {
          set((state) => ({ userGems: state.userGems - amount }));
          return true;
        }
        return false;
      },

      addTrophies: (amount) => set((state) => ({ userTrophies: Math.max(0, state.userTrophies + amount) })),

      claimFreeChest: () => set({ lastFreeChestClaimed: Date.now() }),
      claimDailyChest: () => set({ lastDailyChestClaimed: Date.now() }),
      
      unlockPremiumMath: () => set({ unlockedPremiumMath: true }),
      unlockPremiumPhysics: () => set({ unlockedPremiumPhysics: true }),
      setMockTestStatus: (status) => set({ mockTestStatus: status }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      unlockHero: (heroId) => set((state) => ({
        heroes: state.heroes.map((h) => 
          h.id === heroId ? { ...h, isPremium: false } : h
        )
      })),

      upgradeHero: (heroId) => {
        const hero = get().heroes.find((h) => h.id === heroId);
        if (!hero) return false;
        
        const cost = hero.level * 150;
        if (get().userGold >= cost) {
          set((state) => ({
            userGold: state.userGold - cost,
            heroes: state.heroes.map((h) => 
              h.id === heroId ? { ...h, level: h.level + 1 } : h
            )
          }));
          return true;
        }
        return false;
      },

      unlockWallpaper: (wallpaperId, cost) => {
        if (get().unlockedWallpapers.includes(wallpaperId)) return true;
        if (get().userGold >= cost) {
          set((state) => ({
            userGold: state.userGold - cost,
            unlockedWallpapers: [...state.unlockedWallpapers, wallpaperId]
          }));
          return true;
        }
        return false;
      },

      claimTrophyMilestone: (id) => {
        const milestones = [
          { id: 1, type: "gold", amount: 100 },
          { id: 2, type: "gems", amount: 10 },
          { id: 3, type: "league" },
          { id: 4, type: "chest", chestType: "chest_small" },
          { id: 5, type: "gold", amount: 200 },
          { id: 6, type: "league" },
          { id: 7, type: "chest", chestType: "chest_epic" },
          { id: 8, type: "gems", amount: 25 },
          { id: 9, type: "league" },
          { id: 10, type: "chest", chestType: "chest_legendary" },
          { id: 11, type: "chest", chestType: "chest_crystal" },
        ];
        
        const milestone = milestones.find((m) => m.id === id);
        if (!milestone) return;

        const claimed = get().claimedTrophyMilestones.split(",").filter(Boolean);
        if (claimed.includes(String(id))) return;

        const nextClaimed = [...claimed, String(id)].join(",");
        
        if (milestone.type === "gold" && milestone.amount) {
          set((state) => ({
            userGold: state.userGold + milestone.amount!,
            claimedTrophyMilestones: nextClaimed
          }));
        } else if (milestone.type === "gems" && milestone.amount) {
          set((state) => ({
            userGems: state.userGems + milestone.amount!,
            claimedTrophyMilestones: nextClaimed
          }));
        } else if (milestone.type === "chest") {
          let goldReward = 0;
          let gemsReward = 0;
          if (milestone.chestType === "chest_small") {
            goldReward = 100; gemsReward = 2;
          } else if (milestone.chestType === "chest_epic") {
            goldReward = 300; gemsReward = 10;
          } else if (milestone.chestType === "chest_legendary") {
            goldReward = 500; gemsReward = 20;
          } else if (milestone.chestType === "chest_crystal") {
            goldReward = 1000; gemsReward = 50;
          }
          set((state) => ({
            userGold: state.userGold + goldReward,
            userGems: state.userGems + gemsReward,
            claimedTrophyMilestones: nextClaimed
          }));
        } else {
          set({ claimedTrophyMilestones: nextClaimed });
        }
      },
      completeTopic: (topicName) => {
        const list = get().completedTopics ? get().completedTopics.split(",") : [];
        if (!list.includes(topicName)) {
          list.push(topicName);
          set({ completedTopics: list.join(",") });
        }
      }
    }),
    {
      name: "entquest-game-storage",
      storage: createJSONStorage(() => safeAsyncStorage)
    }
  )
);
