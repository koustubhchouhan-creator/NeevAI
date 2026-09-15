import { Schema, model, Document } from "mongoose";
import {
  REPORT_TYPES,
  HEALTH_STATUSES,
  PROJECT_STATUSES,
  ReportType,
  HealthStatus,
  ProjectStatus,
} from "../constants";

export interface IProjectSnapshot extends Document {
  projectId: string;
  reportType: ReportType;
  reportPeriod: string;
  reportDate: Date;
  originalCostCr?: number;
  revisedCostCr?: number;
  anticipatedCostCr?: number;
  cumulativeExpenditureCr?: number;
  physicalProgressPct?: number;
  healthStatus?: HealthStatus;
  originalCompletionDate?: Date;
  revisedCompletionDate?: Date;
  anticipatedCompletionDate?: Date;
  projectStatus?: ProjectStatus;
  remarks?: string;
  sourceReport: string;
  sourcePage?: string;
}

const ProjectSnapshotSchema = new Schema<IProjectSnapshot>(
  {
    projectId: { type: String, required: true, index: true },
    reportType: { type: String, enum: REPORT_TYPES, required: true },
    reportPeriod: { type: String, required: true },
    reportDate: { type: Date, required: true },
    originalCostCr: { type: Number, min: 0 },
    revisedCostCr: { type: Number, min: 0 },
    anticipatedCostCr: { type: Number, min: 0 },
    cumulativeExpenditureCr: { type: Number, min: 0 },
    physicalProgressPct: { type: Number, min: 0, max: 100 },
    healthStatus: { type: String, enum: HEALTH_STATUSES },
    originalCompletionDate: { type: Date },
    revisedCompletionDate: { type: Date },
    anticipatedCompletionDate: { type: Date },
    projectStatus: { type: String, enum: PROJECT_STATUSES },
    remarks: { type: String },
    sourceReport: { type: String, required: true },
    sourcePage: { type: String },
  },
  { timestamps: true }
);

// Ensure only one snapshot per project per date and report type
ProjectSnapshotSchema.index({ projectId: 1, reportDate: 1, reportType: 1 }, { unique: true });

export default model<IProjectSnapshot>("ProjectSnapshot", ProjectSnapshotSchema);
