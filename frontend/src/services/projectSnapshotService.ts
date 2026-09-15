import type { ProjectSnapshot } from "../../../shared/types";

import { api, getOrNull } from "./apiClient";

const projectSnapshotsPath = (projectId: string): string =>
  `/projects/${encodeURIComponent(projectId)}/snapshots`;

/**
 * Create a new project snapshot
 */
export const createProjectSnapshot = async (
  snapshot: Omit<
    ProjectSnapshot,
    "id" | "createdAt" | "updatedAt"
  >
): Promise<string> => {
  const created = await api.post<ProjectSnapshot>(
    projectSnapshotsPath(snapshot.projectId),
    snapshot
  );

  return created.id ?? "";
};

/**
 * Get all snapshots for a project (newest first)
 */
export const getProjectSnapshots = async (
  projectId: string
): Promise<ProjectSnapshot[]> => {
  return api.get<ProjectSnapshot[]>(
    projectSnapshotsPath(projectId)
  );
};

/**
 * Get latest snapshot of a project
 */
export const getLatestProjectSnapshot = async (
  projectId: string
): Promise<ProjectSnapshot | null> => {
  return getOrNull(() =>
    api.get<ProjectSnapshot>(
      `${projectSnapshotsPath(projectId)}/latest`
    )
  );
};

/**
 * Update a snapshot
 */
export const updateProjectSnapshot = async (
  id: string,
  updates: Partial<ProjectSnapshot>
): Promise<void> => {
  await api.patch<ProjectSnapshot>(
    `/projects/snapshots/${encodeURIComponent(id)}`,
    updates
  );
};

/**
 * Delete a snapshot
 */
export const deleteProjectSnapshot = async (
  id: string
): Promise<void> => {
  await api.delete(
    `/projects/snapshots/${encodeURIComponent(id)}`
  );
};

/**
 * Get all project snapshots
 */
export const getAllProjectSnapshots = async (): Promise<
  ProjectSnapshot[]
> => {
  return api.get<ProjectSnapshot[]>("/projects/snapshots");
};
