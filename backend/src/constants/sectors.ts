export const PROJECT_DOMAINS = [
  "Roads & Highways",
  "Healthcare",
] as const;

export type ProjectDomain =
  (typeof PROJECT_DOMAINS)[number];
