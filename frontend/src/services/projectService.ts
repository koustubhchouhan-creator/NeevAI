import type { Project } from "../../../shared/types";

import { api, getOrNull } from "./apiClient";

const PROJECTS_PATH = "/projects";

/**
 * Create a new project
 */
export const createProject = async (
  project: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const created = await api.post<Project>(
    PROJECTS_PATH,
    project
  );

  return created.id ?? created.projectId;
};

/**
 * Get all projects
 */
export const getProjects = async (): Promise<Project[]> => {
  return api.get<Project[]>(PROJECTS_PATH);
};

/**
 * Get project by internal API id
 */
export const getProjectById = async (
  id: string
): Promise<Project | null> => {
  return getOrNull(() =>
    api.get<Project>(
      `${PROJECTS_PATH}/${encodeURIComponent(id)}`
    )
  );
};

/**
 * Get project using official project ID
 */
export const getProjectByProjectId = async (
  projectId: string
): Promise<Project | null> => {
  return getOrNull(() =>
    api.get<Project>(
      `${PROJECTS_PATH}/${encodeURIComponent(projectId)}`
    )
  );
};

/**
 * Update a project
 */
export const updateProject = async (
  id: string,
  projectData: Partial<Project>
): Promise<void> => {
  await api.patch<Project>(
    `${PROJECTS_PATH}/${encodeURIComponent(id)}`,
    projectData
  );
};

/**
 * Delete a project
 */
export const deleteProject = async (
  id: string
): Promise<void> => {
  await api.delete(
    `${PROJECTS_PATH}/${encodeURIComponent(id)}`
  );
};
