import type { EnsaePromo, ResourceCategory } from "@/types";

export const ENSAE_PROMOS: readonly EnsaePromo[] = [
  "AS1",
  "AS2",
  "AS3",
  "ISEP1",
  "ISEP2",
  "ISE1 CL",
  "ISE1 Math",
  "ISE1 Eco",
  "ISE2",
  "ISE3",
] as const;

export const ENSAE_SUBJECTS: readonly ResourceCategory[] = [
  "Statistiques",
  "Économétrie",
  "Data Science",
  "Python / R",
  "Probabilités",
  "Français",
  "Anglais",
] as const;
