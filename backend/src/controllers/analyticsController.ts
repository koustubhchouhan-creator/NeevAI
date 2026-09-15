import { Request, Response } from "express";
import { Project, ProjectSnapshot } from "../models";
import { riskService } from "../services/riskService";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { buildIdQuery } from "../utils/serialize";

type Plain = Record<string, any>;

function countBy(items: Plain[], key: string, fallback = "No Data") {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = item?.[key] ?? fallback;
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

/** GET /api/v1/analytics/overview */
export const getOverview = asyncHandler(
  async (_req: Request, res: Response) => {
    const projects = (await Project.find().lean()) as Plain[];

    const latestSnapshots = (await ProjectSnapshot.aggregate([
      { $sort: { reportDate: -1 } },
      { $group: { _id: "$projectId", doc: { $first: "$$ROOT" } } },
    ])) as { _id: string; doc: Plain }[];

    const latestByProject = new Map(
      latestSnapshots.map((entry) => [entry._id, entry.doc]),
    );

    const latestList = projects
      .map((project) => latestByProject.get(project.projectId))
      .filter(Boolean) as Plain[];

    const sum = (
      items: Plain[],
      key: string,
    ): number =>
      items.reduce(
        (total, item) => total + (Number(item?.[key]) || 0),
        0,
      );

    const projectsWithSnapshots = latestList.length;
    let dataStatus: "complete" | "partial" | "insufficient_data";
    if (projects.length === 0 || projectsWithSnapshots === 0) {
      dataStatus = "insufficient_data";
    } else if (projectsWithSnapshots === projects.length) {
      dataStatus = "complete";
    } else {
      dataStatus = "partial";
    }

    res.json({
      data: {
        totalProjects: projects.length,
        projectsWithSnapshots,
        totalOriginalCostCr: sum(projects, "originalCostCr"),
        totalCumulativeExpenditureCr: sum(
          latestList,
          "cumulativeExpenditureCr",
        ),
        averagePhysicalProgressPct:
          projectsWithSnapshots > 0
            ? sum(latestList, "physicalProgressPct") /
              projectsWithSnapshots
            : 0,
        byDomain: countBy(projects, "domain"),
        byStatus: countBy(latestList, "projectStatus"),
        byHealthStatus: countBy(latestList, "healthStatus"),
        dataStatus,
        generatedAt: new Date().toISOString(),
      },
    });
  },
);

/** GET /api/v1/analytics/projects/:projectId */
export const getProjectAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const project = (await Project.findOne(
      buildIdQuery(req.params.projectId),
    ).lean()) as Plain | null;
    if (!project) throw ApiError.notFound("Project not found");

    const latest = (await ProjectSnapshot.findOne({
      projectId: project.projectId,
    })
      .sort({ reportDate: -1 })
      .lean()) as Plain | null;

    const risk = await riskService.computeRiskComponents(
      project.projectId,
    );

    const calculated = risk.overallRiskScore !== null;

    res.json({
      data: {
        projectId: project.projectId,
        physicalProgress: latest?.physicalProgressPct ?? undefined,
        financialProgress: risk.derived?.financialProgress ?? undefined,
        costVariance: risk.derived?.costVariance ?? undefined,
        scheduleVariance: risk.derived?.scheduleVariance ?? undefined,
        actualVelocity: risk.derived?.actualVelocity ?? undefined,
        expectedVelocity: risk.derived?.expectedVelocity ?? undefined,
        overallRiskScore: risk.overallRiskScore,
        riskLevel: risk.riskLevel,
        healthStatus: latest?.healthStatus ?? undefined,
        dataStatus: risk.dataStatus,
        analyticsStatus: calculated
          ? "calculated"
          : "not_calculated",
        components: risk.components,
        computedAt: new Date().toISOString(),
      },
    });
  },
);
