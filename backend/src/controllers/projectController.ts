import { Request, Response } from "express";
import { Project, ProjectSnapshot } from "../models";
import { validateProjectRow } from "../validators/projectValidator";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  buildIdQuery,
  serializeDoc,
  serializeDocs,
} from "../utils/serialize";

/** GET /api/v1/projects */
export const listProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const { q, domain, projectType, state, ministry, limit, offset } =
      req.query;

    const filter: Record<string, unknown> = {};
    if (domain) filter.domain = domain;
    if (projectType) filter.projectType = projectType;
    if (state) filter.state = state;
    if (ministry) filter.ministry = ministry;
    if (q) {
      filter.projectName = {
        $regex: String(q),
        $options: "i",
      };
    }

    const max = Math.min(Number(limit) || 500, 2000);
    const skip = Number(offset) || 0;

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(max)
      .lean();

    res.json({ data: serializeDocs(projects) });
  },
);

/** POST /api/v1/projects */
export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const row = req.body ?? {};
    const { valid, errors } = validateProjectRow(row);
    if (!valid) throw ApiError.badRequest(errors.join("; "));

    const existing = await Project.findOne({
      projectId: row.projectId,
    }).lean();
    if (existing) {
      throw ApiError.conflict(
        `Project '${row.projectId}' already exists`,
      );
    }

    const created = await Project.create(row);
    res.status(201).json({ data: serializeDoc(created) });
  },
);

/** GET /api/v1/projects/:id */
export const getProject = asyncHandler(
  async (req: Request, res: Response) => {
    const project = await Project.findOne(
      buildIdQuery(req.params.id),
    ).lean();
    if (!project) throw ApiError.notFound("Project not found");
    res.json({ data: serializeDoc(project) });
  },
);

/** PATCH /api/v1/projects/:id */
export const updateProject = asyncHandler(
  async (req: Request, res: Response) => {
    const updated = await Project.findOneAndUpdate(
      buildIdQuery(req.params.id),
      req.body ?? {},
      { new: true, runValidators: true },
    ).lean();
    if (!updated) throw ApiError.notFound("Project not found");
    res.json({ data: serializeDoc(updated) });
  },
);

/** DELETE /api/v1/projects/:id */
export const deleteProject = asyncHandler(
  async (req: Request, res: Response) => {
    const project = await Project.findOneAndDelete(
      buildIdQuery(req.params.id),
    ).lean();
    if (!project) throw ApiError.notFound("Project not found");

    await ProjectSnapshot.deleteMany({
      projectId: project.projectId,
    });

    res.json({
      data: { projectId: project.projectId, deleted: true },
    });
  },
);
