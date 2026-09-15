// src/routes/riskRoutes.ts
import { Router } from "express";
import {
  getProjectRisk,
  listRisks,
  recalculateProjectRisk,
} from "../controllers/riskController";

const router = Router();

router.get("/", listRisks);
router.post("/:projectId/recalculate", recalculateProjectRisk);
router.get("/:projectId", getProjectRisk);

export default router;
