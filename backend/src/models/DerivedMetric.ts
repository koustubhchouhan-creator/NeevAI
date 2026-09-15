import { Schema, model, Document } from 'mongoose';

export interface IDerivedMetric extends Document {
  projectId: string;
  snapshotId?: string;
  metricName: string;
  value: number;
  calculatedAt: Date;
  financialProgress?: number;
  physicalProgressPct?: number;
  costVariance?: number;
  expectedVelocity?: number;
  actualVelocity?: number;
  scheduleVariance?: number;
  overallRiskScore?: number;
  riskLevel?: string;
  computedAt?: Date;
}

const DerivedMetricSchema = new Schema<IDerivedMetric>(
  {
    projectId: { type: String, required: true, index: true },
    snapshotId: { type: String },
    metricName: { type: String, required: true },
    value: { type: Number, required: true },
    calculatedAt: { type: Date, default: Date.now },
    financialProgress: { type: Number },
    physicalProgressPct: { type: Number },
    costVariance: { type: Number },
    expectedVelocity: { type: Number },
    actualVelocity: { type: Number },
    scheduleVariance: { type: Number },
    overallRiskScore: { type: Number },
    riskLevel: { type: String },
    computedAt: { type: Date },
  },
  { timestamps: true }
);

export const DerivedMetric = model<IDerivedMetric>('DerivedMetric', DerivedMetricSchema);
