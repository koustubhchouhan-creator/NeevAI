import { isValidISODate } from '../utils/dateValidator';
import { isValidNumber } from '../utils/numberValidator';
import { PROJECT_DOMAINS, PROJECT_TYPES } from '../constants';

export interface ProjectRow {
  projectId: string;
  projectName: string;
  description?: string;
  domain: string;
  projectType?: string;
  ministry: string;
  implementingAgency?: string;
  state?: string;
  district?: string;
  city?: string;
  approvalDate?: string;
  originalCostCr: string;
  originalCompletionDate?: string;
  dataSource: string;
  sourceProjectCode?: string;
}

export function validateProjectRow(row: ProjectRow) {
  const errors: string[] = [];
  if (!row.projectId || row.projectId.trim() === '') errors.push('projectId is required');
  if (!row.projectName || row.projectName.trim() === '') errors.push('projectName is required');
  if (!PROJECT_DOMAINS.includes(row.domain as any)) errors.push(`domain must be one of ${PROJECT_DOMAINS.join(', ')}`);
  if (row.projectType && !PROJECT_TYPES.includes(row.projectType as any)) errors.push(`projectType must be one of ${PROJECT_TYPES.join(', ')}`);
  if (!row.ministry || row.ministry.trim() === '') errors.push('ministry is required');
  if (!isValidNumber(row.originalCostCr)) errors.push('originalCostCr must be a non-blank numeric value');
  if (row.approvalDate && !isValidISODate(row.approvalDate)) errors.push('approvalDate must be a valid ISO date');
  if (row.originalCompletionDate && !isValidISODate(row.originalCompletionDate)) errors.push('originalCompletionDate must be a valid ISO date');
  if (!row.dataSource || row.dataSource.trim() === '') errors.push('dataSource is required');
  const valid = errors.length === 0;
  return { valid, errors } as const;
}
