import { Subject } from "./subject";

export type CoopMovementState = "idle" | "running" | "jumping" | "falling";

export interface CoopPlayerState {
  id: string; // UUID
  subject?: Subject;
  position: { x: number; y: number };
  velocity: { dx: number; dy: number };
  movementState: CoopMovementState;
  facingRight: boolean;
  isGrounded: boolean;
  displayName: string;
}

export type CoopGameState = "subjectSelection" | "playing" | "ended";

export const CoopPhysicsCategory = {
  none: 0,
  player: 0b1,
  ground: 0b10,
  obstacle: 0b100,
  trigger: 0b1000,
  crystal: 0b10000
};
