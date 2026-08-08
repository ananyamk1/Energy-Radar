export type EnergyCategory =
  | "Generation"
  | "Data Center"
  | "Storage"
  | "Transmission"
  | "Renewable"
  | "Industrial";

export type Momentum = "Accelerating" | "Watch" | "Stalled";

export type Project = {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  category: EnergyCategory;
  technology: string;
  capacityMw: number;
  stage: string;
  score: number;
  momentum: Momentum;
  confidence: number;
  signals: number;
  updatedMinutesAgo: number;
  whyNow: string;
};
