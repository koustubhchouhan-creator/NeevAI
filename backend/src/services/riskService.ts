import { Project, ProjectSnapshot } from '../models';
import { derivedMetricFormulas } from '../constants/derivedMetricFormulas';
import { riskWeights } from '../constants/riskWeights';
import { clamp } from '../utils/clamp';

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Service that calculates individual risk components and aggregates them.
 * All calculations are pure functions; this service orchestrates the workflow.
 */
export class RiskService {
  /**
   * Compute all risk components for a project based on its snapshots.
   * Returns an object containing each numeric component (or null) and the aggregated result.
   */
  async computeRiskComponents(projectId: string) {
    // Load snapshots ordered chronologically
    const snapshots = await ProjectSnapshot.find({ projectId })
      .sort({ reportDate: 1 })
      .lean();

    if (snapshots.length < 2) {
      // Not enough data for velocity or schedule calculations
      return {
        components: {} as Record<string, number | null>,
        overallRiskScore: null,
        riskLevel: null,
        dataStatus: 'insufficient_data' as const,
        derived: {} as Record<string, number | undefined>,
      };
    }

    const project = await Project.findOne({ projectId }).lean();
    if (!project) throw new Error('Project not found');

    // Use the latest two snapshots for velocity calculation
    const latest = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];

    const physicalProgressCurrent = latest.physicalProgressPct ?? 0;
    const physicalProgressPrev = previous.physicalProgressPct ?? 0;
    const daysBetween = (latest.reportDate.getTime() - previous.reportDate.getTime()) / DAY_MS;

    const plannedCompletion = project.originalCompletionDate ?? new Date();
    const plannedStart =
      project.approvalDate ?? project.originalCompletionDate ?? new Date();
    const plannedDurationDays =
      (plannedCompletion.getTime() - plannedStart.getTime()) / DAY_MS;
    const anticipatedCompletion =
      latest.anticipatedCompletionDate ??
      latest.revisedCompletionDate ??
      new Date();

    // ---- Derived metrics ---------------------------------------------------
    const financialProgress = derivedMetricFormulas.financialProgress(
      latest.cumulativeExpenditureCr ?? 0,
      project.originalCostCr ?? 0,
    );
    const costVariance = derivedMetricFormulas.costVariance(
      financialProgress,
      physicalProgressCurrent,
    );
    const scheduleVariance = derivedMetricFormulas.scheduleVariance(
      plannedCompletion,
      anticipatedCompletion,
      plannedDurationDays,
    );
    const expectedVelocity = derivedMetricFormulas.expectedVelocity(plannedDurationDays);
    const actualVelocity = derivedMetricFormulas.actualVelocity(
      physicalProgressCurrent,
      physicalProgressPrev,
      daysBetween,
    );

    // ---- Risk components ---------------------------------------------------
    const costRisk = derivedMetricFormulas.costRiskOngoing(costVariance);
    const scheduleRisk = clamp(-scheduleVariance, 0, 100);
    const velocityRisk = derivedMetricFormulas.velocityRisk(expectedVelocity, actualVelocity);
    const efficiencyRisk = derivedMetricFormulas.efficiencyRisk(
      financialProgress,
      physicalProgressCurrent,
    );

    const components: Record<string, number | null> = {
      costRisk,
      scheduleRisk,
      velocityRisk,
      efficiencyRisk,
    };

    // Determine available components (exclude null values)
    const available = Object.entries(components).filter(([, v]) => v !== null && v !== undefined);
    const availableCount = available.length;

    let overallRiskScore: number | null = null;
    let riskLevel: string | null = null;
    let dataStatus: 'complete' | 'partial' | 'insufficient_data' = 'insufficient_data';

    if (availableCount >= 2) {
      let weightedSum = 0;
      let weightSum = 0;
      for (const [key, val] of available) {
        const weight = (riskWeights as Record<string, number>)[key] ?? 0;
        weightedSum += (val as number) * weight;
        weightSum += weight;
      }
      overallRiskScore = weightSum > 0 ? weightedSum / weightSum : 0;
      // Determine risk level based on score thresholds
      if (overallRiskScore <= 25) riskLevel = 'Low';
      else if (overallRiskScore <= 50) riskLevel = 'Medium';
      else if (overallRiskScore <= 75) riskLevel = 'High';
      else riskLevel = 'Critical';

      dataStatus = availableCount === 4 ? 'complete' : 'partial';
    }

    const derived: Record<string, number | null | undefined> = {
      financialProgress,
      physicalProgressPct: physicalProgressCurrent,
      costVariance,
      scheduleVariance,
      expectedVelocity,
      actualVelocity,
      costRisk,
      scheduleRisk,
      velocityRisk,
      efficiencyRisk,
    };

    return {
      components,
      overallRiskScore,
      riskLevel,
      dataStatus,
      derived,
    };
  }
}

export const riskService = new RiskService();
