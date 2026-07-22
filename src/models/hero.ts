import { Subject } from "./subject";

export interface Ability {
  name: string;
  description: string;
}

export interface Hero {
  id: string;
  name: string;
  subject: Subject;
  isPremium: boolean;
  icon: string;
  energyCost: number;
  baseDamage: number;
  ability: Ability;
  level: number;
  xp: number;
  isOnCooldown?: boolean;
}

export const getHeroCurrentDamage = (hero: Hero): number => {
  const multiplier = 1.0 + (hero.level - 1) * 0.1;
  return Math.floor(hero.baseDamage * multiplier);
};
