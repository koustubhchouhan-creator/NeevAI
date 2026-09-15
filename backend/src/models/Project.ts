import { Schema, model, Document } from "mongoose";
import {
  PROJECT_DOMAINS,
  PROJECT_TYPES,
  ProjectDomain,
  ProjectType,
} from "../constants";

export interface IProject extends Document {
  projectId: string;
  projectName: string;
  description?: string;
  domain: ProjectDomain;
  projectType?: ProjectType;
  ministry: string;
  implementingAgency?: string;
  state?: string;
  district?: string;
  city?: string;
  approvalDate?: Date;
  originalCostCr?: number;
  originalCompletionDate?: Date;
  dataSource: string;
  sourceProjectCode?: string;
}

const ProjectSchema = new Schema<IProject>(
  {
    projectId: { type: String, required: true, unique: true, trim: true, index: true },
    projectName: { type: String, required: true, trim: true },
    description: { type: String },
    domain: { type: String, enum: PROJECT_DOMAINS, required: true },
    projectType: { type: String, enum: PROJECT_TYPES },
    ministry: { type: String, required: true, trim: true },
    implementingAgency: { type: String, trim: true },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true },
    approvalDate: { type: Date },
    originalCostCr: { type: Number, min: 0 },
    originalCompletionDate: { type: Date },
    dataSource: { type: String, required: true, trim: true },
    sourceProjectCode: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Project = model<IProject>('Project', ProjectSchema);
