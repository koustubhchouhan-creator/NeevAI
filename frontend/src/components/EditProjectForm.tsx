import { useEffect, useState } from "react";

import type { Project } from "../../../shared/types/project";

import type { ProjectSnapshot } from "../../../shared/types/projectSnapshot";

import type {
  ProjectStatus,
  ProjectDomain,
  ProjectType,
} from "../../../shared/constants";

import {
  PROJECT_TYPES,
  PROJECT_STATUSES,
  PROJECT_DOMAINS,
} from "../../../shared/constants";

import {
  updateProject,
} from "../services/projectService";

import {
  getProjectSnapshots,
  updateProjectSnapshot,
  createProjectSnapshot,
} from "../services/projectSnapshotService";

import "./EditProjectForm.css";


interface EditProjectFormProps {
  project: Project;

  onCancel: () => void;

  onSuccess: () => void;
}


function EditProjectForm({
  project,
  onCancel,
  onSuccess,
}: EditProjectFormProps) {

  const [name, setName] =
    useState(project.projectName);

  const [description, setDescription] =
    useState(
      project.description ?? ""
    );


  const [projectType, setProjectType] =
    useState<string>(
      project.projectType ??
        PROJECT_TYPES[0]
    );


  const [domain, setDomain] =
    useState<ProjectDomain>(
      project.domain
    );


  const [ministry, setMinistry] =
    useState(
      project.ministry
    );


  const [
    implementingAgency,
    setImplementingAgency,
  ] = useState(
    project.implementingAgency ?? ""
  );


  const [state, setState] =
    useState(
      project.state ?? ""
    );


  const [district, setDistrict] =
    useState(
      project.district ?? ""
    );


  const [city, setCity] =
    useState(
      project.city ?? ""
    );


  const [budget, setBudget] =
    useState(
      (project.originalCostCr ?? 0).toString()
    );


  const [expenditure, setExpenditure] =
    useState("");


  const [
    progressPercentage,
    setProgressPercentage,
  ] = useState("");


  const [status, setStatus] =
    useState<ProjectStatus>(
      PROJECT_STATUSES[0]
    );


  const [snapshot, setSnapshot] =
    useState<ProjectSnapshot | null>(
      null
    );


  useEffect(() => {

    let active = true;

    const loadSnapshot = async () => {

      try {

        const snapshots =
          await getProjectSnapshots(
            project.projectId
          );

        if (!active) {
          return;
        }

        const latest =
          snapshots.length > 0
            ? snapshots[0]
            : null;

        setSnapshot(latest);

        if (latest) {

          setExpenditure(
            (
              latest.cumulativeExpenditureCr ??
              0
            ).toString()
          );

          setProgressPercentage(
            (
              latest.physicalProgressPct ??
              0
            ).toString()
          );

          if (
            latest.projectStatus
          ) {

            setStatus(
              latest.projectStatus as ProjectStatus
            );

          }

        }

      } catch (err) {

        console.error(
          "Failed to load latest snapshot:",
          err
        );

      }

    };

    loadSnapshot();

    return () => {
      active = false;
    };

  }, [project.projectId]);


  const [submitting, setSubmitting] =
    useState(false);


  const [error, setError] =
    useState<string | null>(null);


  const [success, setSuccess] =
    useState(false);


  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();


    if (!project.id) {

      setError(
        "Project document ID is missing."
      );

      return;

    }


    try {

      setSubmitting(true);

      setError(null);

      setSuccess(false);


      await updateProject(
        project.id,
        {

          projectName: name,

          description,

          projectType,

          domain,

          ministry,

          implementingAgency,

          state,

          district,

          city,


          originalCostCr:
            Number(budget),

        }
      );


      if (snapshot?.id) {

        await updateProjectSnapshot(
          snapshot.id,
          {

            originalCostCr:
              Number(budget),

            cumulativeExpenditureCr:
              Number(expenditure),

            physicalProgressPct:
              Number(progressPercentage),

            projectStatus: status,

          }
        );

      } else {

        await createProjectSnapshot(

          {

            projectId:
              project.projectId,

            reportType: "Other",

            reportPeriod: "Initial",

            reportDate: new Date(),

            originalCostCr:
              Number(budget),

            cumulativeExpenditureCr:
              Number(expenditure),

            physicalProgressPct:
              Number(progressPercentage),

            projectStatus: status,

            sourceReport: "Manual Entry",

          }

        );

      }


      setSuccess(true);


      setTimeout(() => {

        onSuccess();

      }, 800);


    } catch (err) {

      console.error(
        "Failed to update project:",
        err
      );


      setError(
        "Failed to update project. Please try again."
      );


    } finally {

      setSubmitting(false);

    }

  };


  return (

    <div className="edit-project-page">


      {/* PAGE HEADER */}

      <div className="edit-project-header">

        <div>

          <h1>
            Edit Project
          </h1>

          <p>
            Update project information and
            current progress.
          </p>

        </div>


        <button
          type="button"
          className="edit-cancel-button"
          onClick={onCancel}
          disabled={submitting}
        >
          ← Cancel
        </button>

      </div>


      {/* FORM */}

      <form
        className="edit-project-form"
        onSubmit={handleSubmit}
      >


        {/* BASIC INFORMATION */}

        <section className="edit-form-card">

          <h2>
            Basic Information
          </h2>


          <div className="edit-form-grid">


            <div className="edit-form-group">

              <label>
                Project ID
              </label>

              <input
                type="text"
                value={project.projectId}
                disabled
              />

            </div>


            <div className="edit-form-group">

              <label>
                Project Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />

            </div>


            <div className="edit-form-group full-width">

              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={5}
              />

            </div>


          </div>

        </section>



        {/* CLASSIFICATION */}

        <section className="edit-form-card">

          <h2>
            Classification
          </h2>


          <div className="edit-form-grid">


            <div className="edit-form-group">

              <label>
                Project Type
              </label>

              <select
                value={projectType}
                onChange={(e) =>
                  setProjectType(
                    e.target.value as ProjectType
                  )
                }
              >

                {PROJECT_TYPES.map(
                  (type) => (

                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>

                ))}

              </select>

            </div>



            <div className="edit-form-group">

              <label>
                Domain
              </label>

              <select
                value={domain}
                onChange={(e) =>
                  setDomain(
                    e.target.value as ProjectDomain
                  )
                }
              >

                {PROJECT_DOMAINS.map(
                  (item) => (

                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>

                  )
                )}

              </select>

            </div>



            <div className="edit-form-group">

              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as ProjectStatus
                  )
                }
              >

                {PROJECT_STATUSES.map(
                  (item) => (

                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>

                  )
                )}

              </select>

            </div>


          </div>

        </section>



        {/* ORGANIZATION */}

        <section className="edit-form-card">

          <h2>
            Organization
          </h2>


          <div className="edit-form-grid">

            <div className="edit-form-group">

              <label>
                Ministry / Department
              </label>

              <input
                type="text"
                value={ministry}
                onChange={(e) =>
                  setMinistry(e.target.value)
                }
                required
              />

            </div>


            <div className="edit-form-group full-width">

              <label>
                Implementing Agency
              </label>

              <input
                type="text"
                value={implementingAgency}
                onChange={(e) =>
                  setImplementingAgency(
                    e.target.value
                  )
                }
                required
              />

            </div>

          </div>

        </section>



        {/* LOCATION */}

        <section className="edit-form-card">

          <h2>
            Location
          </h2>


          <div className="edit-form-grid">


            <div className="edit-form-group">

              <label>
                State
              </label>

              <input
                type="text"
                value={state}
                onChange={(e) =>
                  setState(e.target.value)
                }
              />

            </div>



            <div className="edit-form-group">

              <label>
                District
              </label>

              <input
                type="text"
                value={district}
                onChange={(e) =>
                  setDistrict(e.target.value)
                }
              />

            </div>



            <div className="edit-form-group">

              <label>
                City
              </label>

              <input
                type="text"
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
              />

            </div>


          </div>

        </section>



        {/* FINANCIAL INFORMATION */}

        <section className="edit-form-card">

          <h2>
            Financial Information
          </h2>


          <div className="edit-form-grid">


            <div className="edit-form-group">

              <label>
                Original Cost (₹ crore)
              </label>

              <input
                type="number"
                value={budget}
                onChange={(e) =>
                  setBudget(e.target.value)
                }
                min="0"
                required
              />

            </div>



            <div className="edit-form-group">

              <label>
                Cumulative Expenditure (₹ crore)
              </label>

              <input
                type="number"
                value={expenditure}
                onChange={(e) =>
                  setExpenditure(e.target.value)
                }
                min="0"
                required
              />

            </div>


          </div>

        </section>



        {/* PROGRESS */}

        <section className="edit-form-card">

          <h2>
            Project Progress
          </h2>


          <div className="edit-form-grid">

            <div className="edit-form-group">

              <label>
                Progress Percentage
              </label>

              <input
                type="number"
                value={progressPercentage}
                onChange={(e) =>
                  setProgressPercentage(
                    e.target.value
                  )
                }
                min="0"
                max="100"
                required
              />

            </div>

          </div>

        </section>



        {/* ACTIONS */}

        <div className="edit-form-actions">


          <button
            type="button"
            className="edit-cancel-button"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>


          <button
            type="submit"
            className="save-project-button"
            disabled={submitting}
          >

            {submitting
              ? "Saving Changes..."
              : "Save Changes"}

          </button>


        </div>



        {/* SUCCESS */}

        {success && (

          <div className="edit-success-message">

            ✅ Project updated successfully!

          </div>

        )}



        {/* ERROR */}

        {error && (

          <div className="edit-error-message">

            ❌ {error}

          </div>

        )}


      </form>

    </div>

  );

}


export default EditProjectForm;