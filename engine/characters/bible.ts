import inspector from "./inspector.json";
import passenger from "./passenger.json";
import stoker from "./stoker.json";
import type { FaceExtras, FaceVariant } from "./face";

// Character bible: the ONLY way new characters enter the engine.
// Add a <id>.json next to this file and register it here.
export type CharacterDef = {
  id: string;
  name: string;
  role: string;
  faceVariant: FaceVariant;
  faceExtras: FaceExtras;
  body: {
    torso: string;
    torsoStyle: "coat" | "vest" | "shirt";
    trim: string;
    sleeve: string;
    legs: string;
    shoes: string;
    scale: number;
  };
  headgear: { type: "peakedCap" | "flatCap" | "hardHat" | "helmet" | "bowler" | "none"; color: string; band?: string; badge?: string };
  prop?: "clipboard" | "shovel" | null;
  accessories?: string[];
};

export const BIBLE: Record<string, CharacterDef> = {
  inspector: inspector as CharacterDef,
  stoker: stoker as CharacterDef,
  passenger: passenger as CharacterDef,
};

export const CHARACTER_IDS = Object.keys(BIBLE);
