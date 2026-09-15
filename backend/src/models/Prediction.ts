import { Schema, model, Document } from "mongoose";
import {
  PREDICTION_TYPES,
  RISK_LEVELS,
  DATA_STATUSES,
  PredictionType,
  RiskLevel,
  DataStatus,
} from "../constants";

export interface IPrediction extends Document {
  projectId: string;
  predictionType: PredictionType;
  predictedValue?: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  explanation?: string;
  dataStatus: DataStatus;
  modelVersion?: string;
}

const PredictionSchema = new Schema<IPrediction>(
  {
    projectId: { type: String, required: true, index: true },
    predictionType: {
      type: String,
      enum: Object.values(PREDICTION_TYPES),
      required: true,
    },
    predictedValue: { type: Number },
    confidenceScore: { type: Number, min: 0, max: 100, required: true },
    riskLevel: { type: String, enum: RISK_LEVELS, required: true },
    explanation: { type: String },
    dataStatus: { type: String, enum: DATA_STATUSES, required: true },
    modelVersion: { type: String },
  },
  { timestamps: true }
);

export default model<IPrediction>("Prediction", PredictionSchema);
