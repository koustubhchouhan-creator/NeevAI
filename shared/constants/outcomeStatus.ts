export const OUTCOME_STATUSES = [
  "Completed",
  "Delayed Completion",
  "Failed",
  "Cancelled",
  "Stalled",
] as const;

export type OutcomeStatus =
  (typeof OUTCOME_STATUSES)[number];
