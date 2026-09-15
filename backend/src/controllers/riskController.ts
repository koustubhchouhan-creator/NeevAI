import { Request, Response } from "express";
import { Project } from "../models";
import { riskService } from "../services/riskService";
import { recalcService } from "../services/recalcService";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { buildIdQuery } from "../utils/serialize";

/** GET /api/v1/risk */
export const listRisks = asyncHandler(
  async (_req: Request, res: Response) => {
    const projects = await Project.find()
      .select("projectId projectName")
      .lean();

    const results = await Promise.all(
      projects.map(async (project) => {
        const risk = await riskService.computeRiskComponents(
          project.projectId,
        );
        return {
          projectId: project.projectId,
          projectName: project.projectName,
          overallRiskScore: risk.overallRiskScore,
          riskLevel: risk.riskLevel,
          dataStatus: risk.dataStatus,
          components: risk.components,
        };
      }),
    );

    results.sort(
      (a, b) =>
        (b.overallRiskScore ?? -1) - (a.overallRiskScore ?? -1),
    );

    res.json({ data: results });
  },
);

/** GET /api/v1/risk/:projectId */
export const getProjectRisk = asyncHandler(
  async (req: Request, res: Response) => {
    const project = await Project.findOne(
      buildIdQuery(req.params.projectId),
    ).lean();
    if (!project) throw ApiError.notFound("Project not found");

    const risk = await riskService.computeRiskComponents(
      project.projectId,
    );

    res.json({
      data: {
        projectId: project.projectId,
        projectName: project.projectName,
        ...risk,
        computedAt: new Date().toISOString(),
      },
    });
  },
);

/** POST /api/v1/risk/:projectId/recalculate */
export const recalculateProjectRisk = asyncHandler(
  async (req: Request, res: Response) => {
    const project = await Project.findOne(
      buildIdQuery(req.params.projectId),
    ).lean();
    if (!project) throw ApiError.notFound("Project not found");

    const result = await recalcService.recalculate(project.projectId);
    res.json({ data: result });
  },
);
