import type { TimestampValue } from "./common";

import type { ProjectDomain } from "../constants";

export interface Project {
  id?: string;

  // Unique official project identifier
  projectId: string;

  // Official project name
  projectName: string;

  description?: string;

  // Domain
  domain: ProjectDomain;

  // Project classification
  projectType?: string;

  // Government organization
  ministry: string;

  // Implementing organization
  implementingAgency?: string;

  // Location
  state?: string;

  district?: string;

  city?: string;

  // Approval
  approvalDate?: TimestampValue | string | null;

  // Original approved project cost (INR crore)
  originalCostCr?: number | null;

  // Original planned completion date
  originalCompletionDate?: TimestampValue | string | null;

  // Source information
  dataSource: string;

  sourceProjectCode?: string;

  // Metadata
  createdAt?: TimestampValue;

  updatedAt?: TimestampValue;
}
