export const PROJECT_TYPES = [
  "Highway",
  "Expressway",
  "Road",
  "Bridge",
  "Hospital",
  "Medical College",
  "Healthcare Infrastructure",
] as const;

export type ProjectType =
  (typeof PROJECT_TYPES)[number];
