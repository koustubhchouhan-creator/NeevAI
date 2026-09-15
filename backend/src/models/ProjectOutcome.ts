import { Schema, model, Document } from "mongoose";
import {
  OUTCOME_STATUSES,
  RISK_LEVELS,
  OutcomeStatus,
  RiskLevel,
} from "../constants";

export interface IProjectOutcome extends Document {
  projectId: string;
  finalStatus: OutcomeStatus;
  finalCostCr: number;
  finalSchedule: Date;
  riskLevel: RiskLevel;
  summary?: string;
}

const ProjectOutcomeSchema = new Schema<IProjectOutcome>(
  {
    projectId: { type: String, required: true, index: true },
    finalStatus: { type: String, enum: OUTCOME_STATUSES, required: true },
    finalCostCr: { type: Number, min: 0, required: true },
    finalSchedule: { type: Date, required: true },
    riskLevel: { type: String, enum: RISK_LEVELS, required: true },
    summary: { type: String },
  },
  { timestamps: true }
);

export default model<IProjectOutcome>("ProjectOutcome", ProjectOutcomeSchema);
