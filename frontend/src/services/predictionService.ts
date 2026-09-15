import type { Prediction } from "../../../shared/types";

import type { PredictionType } from "../../../shared/constants";

import { api, getOrNull } from "./apiClient";

const PREDICTIONS_PATH = "/predictions";

export const createPrediction = async (
  prediction: Omit<
    Prediction,
    "id" | "createdAt" | "updatedAt"
  >
): Promise<string> => {
  const created = await api.post<Prediction>(
    PREDICTIONS_PATH,
    prediction
  );

  return created.id ?? "";
};

export const getPredictionById = async (
  id: string
): Promise<Prediction | null> => {
  return getOrNull(() =>
    api.get<Prediction>(
      `${PREDICTIONS_PATH}/${encodeURIComponent(id)}`
    )
  );
};

export const getPredictionsByProjectId = async (
  projectId: string
): Promise<Prediction[]> => {
  return api.get<Prediction[]>(
    `${PREDICTIONS_PATH}?projectId=${encodeURIComponent(projectId)}`
  );
};

export const getLatestPrediction = async (
  projectId: string,
  predictionType: PredictionType
): Promise<Prediction | null> => {
  return getOrNull(() =>
    api.get<Prediction>(
      `${PREDICTIONS_PATH}/latest?projectId=${encodeURIComponent(
        projectId
      )}&predictionType=${encodeURIComponent(predictionType)}`
    )
  );
};

export const updatePrediction = async (
  id: string,
  data: Partial<Prediction>
): Promise<void> => {
  await api.patch<Prediction>(
    `${PREDICTIONS_PATH}/${encodeURIComponent(id)}`,
    data
  );
};

export const deletePrediction = async (
  id: string
): Promise<void> => {
  await api.delete(
    `${PREDICTIONS_PATH}/${encodeURIComponent(id)}`
  );
};
