import inspector from "./inspector.json";
import passenger from "./passenger.json";
import stoker from "./stoker.json";
import worker from "./worker.json";
import firefighter from "./firefighter.json";
import owner from "./owner.json";
import perkins from "./perkins.json";
import judge from "./judge.json";
import officer from "./officer.json";
import type { FaceExtras, FaceVariant } from "./face";

// Character bible: the ONLY way new characters enter the engine.
// Add a <id>.json next to this file and register it here.
export type CharacterDef = {
  id: string;
  name: string;
  role: string;
  faceVariant: FaceVariant;
  faceExtras: FaceExtras;
  skin?: string; // head colour around a paper face panel (revision-2 faces)
  body: {
    torso: string;
    torsoStyle: "coat" | "vest" | "shirt" | "blouse" | "robe";
    lower?: "trousers" | "skirt"; // skirt = long 1910s skirt down to the shoes
    skirt?: string; // skirt colour (defaults to legs)
    puffSleeves?: boolean; // shirtwaist "leg-of-mutton" sleeves
    trim: string;
    sleeve: string;
    legs: string;
    shoes: string;
    scale: number;
  };
  headgear: { type: "peakedCap" | "flatCap" | "hardHat" | "helmet" | "bowler" | "fireHelmet" | "ladyHat" | "none"; color: string; band?: string; badge?: string; trim?: string };
  hair?: { style: "gibson" | "bun" | "braid" | "short" | "bald"; color: string };
  prop?: "clipboard" | "shovel" | "axe" | "gavel" | "notebook" | null;
  accessories?: string[];
};

export const BIBLE: Record<string, CharacterDef> = {
  inspector: inspector as CharacterDef,
  stoker: stoker as CharacterDef,
  passenger: passenger as CharacterDef,
  worker: worker as CharacterDef,
  firefighter: firefighter as CharacterDef,
  owner: owner as CharacterDef,
  perkins: perkins as CharacterDef,
  judge: judge as CharacterDef,
  officer: officer as CharacterDef,
};

export const CHARACTER_IDS = Object.keys(BIBLE);
