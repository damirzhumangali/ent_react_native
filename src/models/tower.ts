export type TowerType = "side" | "king";

export interface Tower {
  id: string;
  type: TowerType;
  maxHp: number;
  hp: number;
  isShielded?: boolean;
}

export const isTowerDestroyed = (tower: Tower): boolean => {
  return tower.hp <= 0;
};
