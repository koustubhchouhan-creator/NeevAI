import { isValidISODate } from '../utils/dateValidator';
import { isValidNumber } from '../utils/numberValidator';
import { OUTCOME_STATUSES } from '../constants';

export interface OutcomeRow {
  projectId: string;
  finalCostCr: string;
  finalStatus: string;
  finalSchedule: string;
  summary?: string;
}

export function validateOutcomeRow(row: OutcomeRow) {
  const errors: string[] = [];
  if (!row.projectId || row.projectId.trim() === '') errors.push('projectId is required');
  if (!isValidNumber(row.finalCostCr)) errors.push('finalCostCr must be a non-blank numeric value');
  if (!OUTCOME_STATUSES.includes(row.finalStatus as any)) errors.push(`finalStatus must be one of ${OUTCOME_STATUSES.join(', ')}`);
  if (!isValidISODate(row.finalSchedule)) errors.push('finalSchedule must be a valid ISO date');
  const valid = errors.length === 0;
  return { valid, errors } as const;
}
