import { Schema, model, Document } from 'mongoose';

export interface RecalcLogDocument extends Document {
  projectId: string;
  status: 'started' | 'completed' | 'failed';
  startedAt: Date;
  endedAt?: Date;
  errorMessage?: string;
  computedAt?: Date;
}

const RecalcLogSchema = new Schema<RecalcLogDocument>({
  projectId: { type: String, required: true, index: true },
  status: { type: String, enum: ['started', 'completed', 'failed'], required: true },
  startedAt: { type: Date, default: Date.now, required: true },
  endedAt: { type: Date },
  errorMessage: { type: String },
  computedAt: { type: Date },
});

export const RecalcLog = model<RecalcLogDocument>('RecalcLog', RecalcLogSchema);
