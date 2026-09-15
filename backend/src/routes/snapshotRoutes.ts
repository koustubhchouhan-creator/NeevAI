// src/routes/snapshotRoutes.ts
import { Router } from "express";
import {
  createSnapshot,
  deleteSnapshot,
  getLatestSnapshot,
  listAllSnapshots,
  listProjectSnapshots,
  updateSnapshot,
} from "../controllers/snapshotController";

const router = Router();

// Flat snapshot routes (by snapshot id) must precede the nested project routes.
router.get("/snapshots", listAllSnapshots);
router.patch("/snapshots/:id", updateSnapshot);
router.delete("/snapshots/:id", deleteSnapshot);

// Nested routes scoped to a project.
router.get("/:projectId/snapshots/latest", getLatestSnapshot);
router.get("/:projectId/snapshots", listProjectSnapshots);
router.post("/:projectId/snapshots", createSnapshot);

export default router;
