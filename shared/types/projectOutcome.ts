import type { TimestampValue } from "./common";

import type {
  OutcomeStatus,
  RiskLevel,
} from "../constants";

export interface ProjectOutcome {
  id?: string;

  // Official project identifier
  projectId: string;

  finalStatus: OutcomeStatus;

  finalCostCr: number;

  finalSchedule: TimestampValue | string;

  riskLevel: RiskLevel;

  summary?: string;

  createdAt?: TimestampValue;

  updatedAt?: TimestampValue;
}
