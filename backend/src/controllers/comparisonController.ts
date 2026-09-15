import { Request, Response } from "express";
import { Project, ProjectSnapshot } from "../models";
import { riskService } from "../services/riskService";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { buildIdQuery, serializeDoc } from "../utils/serialize";

function parseIds(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap((value) => String(value).split(","));
  }
  return String(raw)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/** GET /api/v1/comparison?projectIds=a,b,c */
export const compareProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const ids = parseIds(req.query.projectIds);
    if (ids.length === 0) {
      throw ApiError.badRequest(
        "At least one 'projectIds' value is required",
      );
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        const project = await Project.findOne(buildIdQuery(id)).lean();
        if (!project) {
          return { projectId: id, found: false } as const;
        }

        const latest = await ProjectSnapshot.findOne({
          projectId: project.projectId,
        })
          .sort({ reportDate: -1 })
          .lean();

        const risk = await riskService.computeRiskComponents(
          project.projectId,
        );

        return {
          projectId: project.projectId,
          found: true,
          project: serializeDoc(project),
          latestSnapshot: serializeDoc(latest),
          risk: {
            overallRiskScore: risk.overallRiskScore,
            riskLevel: risk.riskLevel,
            dataStatus: risk.dataStatus,
            components: risk.components,
          },
        } as const;
      }),
    );

    res.json({ data: results });
  },
);
