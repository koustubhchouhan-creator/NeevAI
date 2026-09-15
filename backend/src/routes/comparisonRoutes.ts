// src/routes/comparisonRoutes.ts
import { Router } from "express";
import { compareProjects } from "../controllers/comparisonController";

const router = Router();

router.get("/", compareProjects);

export default router;
