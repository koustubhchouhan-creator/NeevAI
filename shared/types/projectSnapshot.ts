import type { TimestampValue } from "./common";

import type {
  ReportType,
  HealthStatus,
} from "../constants";

export interface ProjectSnapshot {
  id?: string;

  // Official project identifier
  projectId: string;

  // Reporting information
  reportType: ReportType;

  reportPeriod: string;

  reportDate: TimestampValue | string;

  // Financial information (INR crore)
  originalCostCr?: number | null;

  revisedCostCr?: number | null;

  anticipatedCostCr?: number | null;

  cumulativeExpenditureCr?: number | null;

  // Physical progress
  physicalProgressPct?: number | null;

  healthStatus?: HealthStatus;

  // Timeline
  originalCompletionDate?: TimestampValue | string | null;

  revisedCompletionDate?: TimestampValue | string | null;

  anticipatedCompletionDate?: TimestampValue | string | null;

  // Current status
  projectStatus?: string;

  // Remarks/issues
  remarks?: string;

  // Source traceability
  sourceReport: string;

  sourcePage?: string | number | null;

  // Metadata
  createdAt?: TimestampValue;

  updatedAt?: TimestampValue;
}
