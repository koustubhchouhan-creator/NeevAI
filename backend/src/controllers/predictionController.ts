import { Request, Response } from "express";
import { Prediction } from "../models";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { serializeDoc, serializeDocs } from "../utils/serialize";

/** GET /api/v1/predictions[?projectId=&predictionType=&limit=] */
export const listPredictions = asyncHandler(
  async (req: Request, res: Response) => {
    const { projectId, predictionType, limit } = req.query;

    const filter: Record<string, unknown> = {};
    if (projectId) filter.projectId = projectId;
    if (predictionType) filter.predictionType = predictionType;

    const max = Math.min(Number(limit) || 200, 1000);

    const predictions = await Prediction.find(filter)
      .sort({ createdAt: -1 })
      .limit(max)
      .lean();

    res.json({ data: serializeDocs(predictions) });
  },
);

/** GET /api/v1/predictions/latest?projectId=&predictionType= */
export const getLatestPrediction = asyncHandler(
  async (req: Request, res: Response) => {
    const { projectId, predictionType } = req.query;
    if (!projectId) {
      throw ApiError.badRequest("'projectId' query parameter is required");
    }

    const filter: Record<string, unknown> = { projectId };
    if (predictionType) filter.predictionType = predictionType;

    const prediction = await Prediction.findOne(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: serializeDoc(prediction) });
  },
);

/** GET /api/v1/predictions/:id */
export const getPrediction = asyncHandler(
  async (req: Request, res: Response) => {
    const prediction = await Prediction.findById(
      req.params.id,
    ).lean();
    if (!prediction) throw ApiError.notFound("Prediction not found");
    res.json({ data: serializeDoc(prediction) });
  },
);

/** POST /api/v1/predictions */
export const createPrediction = asyncHandler(
  async (req: Request, res: Response) => {
    const created = await Prediction.create(req.body ?? {});
    res.status(201).json({ data: serializeDoc(created) });
  },
);

/** PATCH /api/v1/predictions/:id */
export const updatePrediction = asyncHandler(
  async (req: Request, res: Response) => {
    const updated = await Prediction.findByIdAndUpdate(
      req.params.id,
      req.body ?? {},
      { new: true, runValidators: true },
    ).lean();
    if (!updated) throw ApiError.notFound("Prediction not found");
    res.json({ data: serializeDoc(updated) });
  },
);

/** DELETE /api/v1/predictions/:id */
export const deletePrediction = asyncHandler(
  async (req: Request, res: Response) => {
    const deleted = await Prediction.findByIdAndDelete(
      req.params.id,
    ).lean();
    if (!deleted) throw ApiError.notFound("Prediction not found");
    res.json({ data: { id: req.params.id, deleted: true } });
  },
);
