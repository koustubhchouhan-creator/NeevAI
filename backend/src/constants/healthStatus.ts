export const HEALTH_STATUSES = [
  "Healthy",
  "Warning",
  "Critical",
  "Unknown",
] as const;

export type HealthStatus =
  (typeof HEALTH_STATUSES)[number];
