// src/routes/predictionRoutes.ts
import { Router } from "express";
import {
  createPrediction,
  deletePrediction,
  getLatestPrediction,
  getPrediction,
  listPredictions,
  updatePrediction,
} from "../controllers/predictionController";

const router = Router();

router.get("/latest", getLatestPrediction);
router.get("/", listPredictions);
router.post("/", createPrediction);
router.get("/:id", getPrediction);
router.patch("/:id", updatePrediction);
router.delete("/:id", deletePrediction);

export default router;
