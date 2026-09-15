import { Project, DerivedMetric, RecalcLog } from '../models';
import { riskService } from './riskService';

/**
 * Service responsible for explicit analytics recalculation.
 * It computes derived metrics, persists them, calculates overall risk, and logs the operation.
 */
export class RecalcService {
  /**
   * Recalculate analytics for a given project.
   * Returns the persisted DerivedMetric document (or null if not created) and risk info.
   */
  async recalculate(projectId: string) {
    const log = new RecalcLog({
      projectId,
      status: 'started',
      startedAt: new Date(),
    });
    await log.save();

    try {
      // Load project
      const project = await Project.findOne({ projectId }).lean();
      if (!project) throw new Error('Project not found');

      // Use riskService to compute components and derived values
      const riskResult = await riskService.computeRiskComponents(projectId);

      // Persist derived metrics (as a single document for simplicity)
      const derived = riskResult.derived ?? {};
      const analytics = await DerivedMetric.findOneAndUpdate(
        { projectId, metricName: 'analytics' },
        {
          projectId,
          metricName: 'analytics',
          value: derived.costVariance ?? 0, // placeholder; actual value not used directly
          calculatedAt: new Date(),
          financialProgress: derived.financialProgress ?? undefined,
          physicalProgressPct: derived.physicalProgressPct ?? undefined,
          costVariance: derived.costVariance ?? undefined,
          expectedVelocity: derived.expectedVelocity ?? undefined,
          actualVelocity: derived.actualVelocity ?? undefined,
          scheduleVariance: derived.scheduleVariance ?? undefined,
          overallRiskScore: riskResult.overallRiskScore ?? undefined,
          riskLevel: riskResult.riskLevel ?? undefined,
          computedAt: new Date(),
        },
        { upsert: true, new: true },
      ).lean();

      // Update log as completed
      log.status = 'completed';
      log.endedAt = new Date();
      log.computedAt = new Date();
      await log.save();

      return { analytics, risk: riskResult };
    } catch (err: any) {
      log.status = 'failed';
      log.endedAt = new Date();
      log.errorMessage = err.message;
      await log.save();
      throw err;
    }
  }
}

export const recalcService = new RecalcService();
