import type { RiskLevel, DataStatus } from "../../../shared/constants";

import { api } from "./apiClient";

export interface RiskComponents {
  costRisk?: number | null;
  scheduleRisk?: number | null;
  velocityRisk?: number | null;
  efficiencyRisk?: number | null;
}

export interface ProjectRisk {
  projectId: string;
  projectName?: string;
  overallRiskScore: number | null;
  riskLevel: RiskLevel | null;
  dataStatus: DataStatus;
  components: RiskComponents;
}

export interface ProjectRiskDetail extends ProjectRisk {
  derived?: {
    financialProgress?: number | null;
    physicalProgressPct?: number | null;
    costVariance?: number | null;
    scheduleVariance?: number | null;
    expectedVelocity?: number | null;
    actualVelocity?: number | null;
  };
  computedAt?: string;
}

/**
 * Get the risk ranking for every project, ordered highest risk first.
 */
export const getRiskRanking = async (): Promise<ProjectRisk[]> => {
  return api.get<ProjectRisk[]>("/risk");
};

/**
 * Get the detailed risk breakdown for a single project.
 */
export const getProjectRisk = async (
  projectId: string
): Promise<ProjectRiskDetail | null> => {
  return api.get<ProjectRiskDetail>(
    `/risk/${encodeURIComponent(projectId)}`
  );
};

/**
 * Trigger an explicit analytics recalculation for a project.
 */
export const recalculateProjectRisk = async (
  projectId: string
): Promise<void> => {
  await api.post(
    `/risk/${encodeURIComponent(projectId)}/recalculate`
  );
};
