// src/routes/analyticsRoutes.ts
import { Router } from "express";
import {
  getOverview,
  getProjectAnalytics,
} from "../controllers/analyticsController";

const router = Router();

router.get("/overview", getOverview);
router.get("/projects/:projectId", getProjectAnalytics);

export default router;
