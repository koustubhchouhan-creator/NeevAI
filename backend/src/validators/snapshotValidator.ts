import { isValidISODate } from '../utils/dateValidator';
import { isValidNumber } from '../utils/numberValidator';
import { REPORT_TYPES, PROJECT_STATUSES, HEALTH_STATUSES } from '../constants';

export interface SnapshotRow {
  projectId: string;
  reportType: string;
  reportPeriod: string;
  reportDate: string;
  cumulativeExpenditureCr?: string;
  physicalProgressPct?: string;
  projectStatus?: string;
  healthStatus?: string;
  remarks?: string;
  sourceReport: string;
  sourcePage?: string;
}

export function validateSnapshotRow(row: SnapshotRow) {
  const errors: string[] = [];
  if (!row.projectId || row.projectId.trim() === '') errors.push('projectId is required');
  if (!REPORT_TYPES.includes(row.reportType as any)) errors.push(`reportType must be one of ${REPORT_TYPES.join(', ')}`);
  if (!row.reportPeriod || row.reportPeriod.trim() === '') errors.push('reportPeriod is required');
  if (!isValidISODate(row.reportDate)) errors.push('reportDate must be a valid ISO date');
  if (row.cumulativeExpenditureCr && !isValidNumber(row.cumulativeExpenditureCr)) errors.push('cumulativeExpenditureCr must be a numeric value');
  if (row.physicalProgressPct && !isValidNumber(row.physicalProgressPct)) errors.push('physicalProgressPct must be a numeric value');
  if (row.projectStatus && !PROJECT_STATUSES.includes(row.projectStatus as any)) errors.push(`projectStatus must be one of ${PROJECT_STATUSES.join(', ')}`);
  if (row.healthStatus && !HEALTH_STATUSES.includes(row.healthStatus as any)) errors.push(`healthStatus must be one of ${HEALTH_STATUSES.join(', ')}`);
  if (!row.sourceReport || row.sourceReport.trim() === '') errors.push('sourceReport is required');
  const valid = errors.length === 0;
  return { valid, errors } as const;
}
