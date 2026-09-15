import { Request, Response } from "express";
import { Project, ProjectSnapshot } from "../models";
import { validateSnapshotRow } from "../validators/snapshotValidator";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { serializeDoc, serializeDocs } from "../utils/serialize";

/** GET /api/v1/projects/snapshots[?projectId=] */
export const listAllSnapshots = asyncHandler(
  async (req: Request, res: Response) => {
    const filter: Record<string, unknown> = {};
    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }

    const snapshots = await ProjectSnapshot.find(filter)
      .sort({ reportDate: -1 })
      .lean();

    res.json({ data: serializeDocs(snapshots) });
  },
);

/** GET /api/v1/projects/:projectId/snapshots */
export const listProjectSnapshots = asyncHandler(
  async (req: Request, res: Response) => {
    const snapshots = await ProjectSnapshot.find({
      projectId: req.params.projectId,
    })
      .sort({ reportDate: -1 })
      .lean();

    res.json({ data: serializeDocs(snapshots) });
  },
);

/** GET /api/v1/projects/:projectId/snapshots/latest */
export const getLatestSnapshot = asyncHandler(
  async (req: Request, res: Response) => {
    const snapshot = await ProjectSnapshot.findOne({
      projectId: req.params.projectId,
    })
      .sort({ reportDate: -1 })
      .lean();

    res.json({ data: serializeDoc(snapshot) });
  },
);

/** POST /api/v1/projects/:projectId/snapshots */
export const createSnapshot = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = req.params.projectId;
    const row = { ...(req.body ?? {}), projectId };

    const { valid, errors } = validateSnapshotRow(row);
    if (!valid) throw ApiError.badRequest(errors.join("; "));

    const project = await Project.findOne({ projectId }).lean();
    if (!project) {
      throw ApiError.notFound(`Project '${projectId}' not found`);
    }

    const existing = await ProjectSnapshot.findOne({
      projectId,
      reportDate: row.reportDate,
      reportType: row.reportType,
    }).lean();
    if (existing) {
      throw ApiError.conflict(
        "A snapshot for this project, report date and type already exists",
      );
    }

    const created = await ProjectSnapshot.create(row);
    res.status(201).json({ data: serializeDoc(created) });
  },
);

/** PATCH /api/v1/projects/snapshots/:id */
export const updateSnapshot = asyncHandler(
  async (req: Request, res: Response) => {
    const updated = await ProjectSnapshot.findByIdAndUpdate(
      req.params.id,
      req.body ?? {},
      { new: true, runValidators: true },
    ).lean();
    if (!updated) throw ApiError.notFound("Snapshot not found");
    res.json({ data: serializeDoc(updated) });
  },
);

/** DELETE /api/v1/projects/snapshots/:id */
export const deleteSnapshot = asyncHandler(
  async (req: Request, res: Response) => {
    const deleted = await ProjectSnapshot.findByIdAndDelete(
      req.params.id,
    ).lean();
    if (!deleted) throw ApiError.notFound("Snapshot not found");
    res.json({ data: { id: req.params.id, deleted: true } });
  },
);
