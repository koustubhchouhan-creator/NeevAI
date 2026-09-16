import {
  useEffect,
  useMemo,
  useState,
} from "react";

import DashboardLayout from "./DashboardLayout";

import {
  RefreshCw,
  TriangleAlert,
  ShieldAlert,
  ShieldCheck,
  Activity,
  CircleHelp,
  Gauge,
  TrendingDown,
  Clock3,
  Wallet,
  ChevronRight,
} from "lucide-react";

import {
  getRiskRanking,
  getProjectRisk,
} from "../services/riskService";

import type {
  ProjectRisk,
  ProjectRiskDetail,
  RiskComponents,
} from "../services/riskService";

import type {
  RiskLevel,
} from "../../../shared/constants";

import "./Predictions.css";


/* =========================================
   RISK LEVEL ORDERING
========================================= */

const RISK_LEVEL_ORDER: Record<
  RiskLevel,
  number
> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};


/* =========================================
   RISK COMPONENT METADATA
========================================= */

const COMPONENT_META: {
  key: keyof RiskComponents;
  label: string;
  icon: typeof Wallet;
}[] = [
  {
    key: "costRisk",
    label: "Cost Risk",
    icon: Wallet,
  },
  {
    key: "scheduleRisk",
    label: "Schedule Risk",
    icon: Clock3,
  },
  {
    key: "velocityRisk",
    label: "Velocity Risk",
    icon: TrendingDown,
  },
  {
    key: "efficiencyRisk",
    label: "Efficiency Risk",
    icon: Activity,
  },
];


const riskLevelClass = (
  level: RiskLevel | null
): string =>
  level
    ? `prediction-risk-${level.toLowerCase()}`
    : "prediction-risk-unknown";


/**
 * Order projects by risk level first, then by descending overall score.
 * Projects without a score are placed last.
 */
const sortRisks = (
  risks: ProjectRisk[]
): ProjectRisk[] =>
  [...risks].sort((a, b) => {

    const levelA =
      a.riskLevel
        ? RISK_LEVEL_ORDER[a.riskLevel]
        : 99;

    const levelB =
      b.riskLevel
        ? RISK_LEVEL_ORDER[b.riskLevel]
        : 99;

    if (levelA !== levelB) {

      return levelA - levelB;

    }

    return (
      (b.overallRiskScore ?? -1) -
      (a.overallRiskScore ?? -1)
    );

  });


const formatNumber = (
  value: number | null | undefined,
  digits = 1
): string =>
  typeof value === "number" &&
  Number.isFinite(value)
    ? value.toFixed(digits)
    : "--";


/* =========================================
   PREDICTIONS PAGE
========================================= */

function Predictions() {

  const [
    risks,
    setRisks,
  ] = useState<ProjectRisk[]>([]);


  const [
    selected,
    setSelected,
  ] = useState<
    ProjectRiskDetail | null
  >(null);


  const [
    selectedId,
    setSelectedId,
  ] = useState<
    string | null
  >(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);


  /* =========================================
     LOAD RISK RANKING
  ========================================= */

  const loadRisks = async () => {

    try {

      setLoading(true);

      setError(null);


      const data =
        await getRiskRanking();


      const sorted =
        sortRisks(data);


      setRisks(sorted);


      if (
        sorted.length > 0 &&
        !selectedId
      ) {

        void loadDetail(
          sorted[0].projectId
        );

      }

    } catch (err) {

      console.error(
        "Failed to load risk ranking:",
        err
      );


      setError(
        "Failed to load prediction data."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =========================================
     LOAD PROJECT DETAIL
  ========================================= */

  const loadDetail = async (
    projectId: string
  ) => {

    try {

      setSelectedId(projectId);

      setDetailLoading(true);


      const detail =
        await getProjectRisk(projectId);


      setSelected(detail);

    } catch (err) {

      console.error(
        "Failed to load project risk:",
        err
      );

    } finally {

      setDetailLoading(false);

    }

  };


  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {

    loadRisks();

  }, []);


  /* =========================================
     SUMMARY COUNTS
  ========================================= */

  const summary = useMemo(() => {

    const counts = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      unscored: 0,
    };


    risks.forEach((risk) => {

      if (risk.riskLevel) {

        counts[risk.riskLevel] += 1;

      } else {

        counts.unscored += 1;

      }

    });


    return counts;

  }, [risks]);


  /* =========================================
     SORTED RANKING
  ========================================= */

  const ranked = useMemo(
    () => sortRisks(risks),
    [risks]
  );


  /* =========================================
     TOP DRIVER (selected)
  ========================================= */

  const topDriver = useMemo(() => {

    if (!selected?.components) {

      return null;

    }


    return COMPONENT_META.reduce<{
      label: string;
      value: number;
    } | null>((highest, meta) => {

      const value =
        selected.components[meta.key];

      if (
        typeof value !== "number" ||
        !Number.isFinite(value)
      ) {

        return highest;

      }

      if (
        !highest ||
        value > highest.value
      ) {

        return {
          label: meta.label,
          value,
        };

      }

      return highest;

    }, null);

  }, [selected]);


  /* =========================================
     LOADING STATE
  ========================================= */

  if (loading) {

    return (

      <DashboardLayout>

        <div className="predictions-page">

          <div className="predictions-message">

            Loading predictions...

          </div>

        </div>

      </DashboardLayout>

    );

  }


  /* =========================================
     ERROR STATE
  ========================================= */

  if (error) {

    return (

      <DashboardLayout>

        <div className="predictions-page">

          <div className="predictions-message predictions-error">

            <p>
              {error}
            </p>


            <button
              type="button"
              onClick={loadRisks}
            >

              Retry

            </button>

          </div>

        </div>

      </DashboardLayout>

    );

  }


  return (

    <DashboardLayout>

      <div className="predictions-page">


        {/* =====================================
           PAGE HEADER
        ===================================== */}

        <div className="predictions-header">

          <div className="predictions-title-row">

            <div className="predictions-title-icon">

              <TriangleAlert
                size={22}
              />

            </div>


            <div>

              <h1>
                Predictions &amp; Risk
              </h1>


              <p>
                Unified risk scores, early warnings
                and risk drivers across the portfolio
              </p>

            </div>

          </div>


          <button
            type="button"
            className="predictions-refresh-button"
            onClick={loadRisks}
          >

            <RefreshCw
              size={17}
            />

            Refresh Data

          </button>

        </div>


        {/* =====================================
           SUMMARY METRICS
        ===================================== */}

        <section className="predictions-metrics-grid">


          <div className="prediction-metric-card prediction-metric-critical">

            <div className="prediction-metric-icon">

              <ShieldAlert
                size={21}
              />

            </div>


            <div>

              <span>
                Critical &amp; High
              </span>


              <h2>

                {summary.Critical + summary.High}

              </h2>

            </div>

          </div>


          <div className="prediction-metric-card prediction-metric-medium">

            <div className="prediction-metric-icon">

              <Gauge
                size={21}
              />

            </div>


            <div>

              <span>
                Medium Risk
              </span>


              <h2>
                {summary.Medium}
              </h2>

            </div>

          </div>


          <div className="prediction-metric-card prediction-metric-low">

            <div className="prediction-metric-icon">

              <ShieldCheck
                size={21}
              />

            </div>


            <div>

              <span>
                Low Risk
              </span>


              <h2>
                {summary.Low}
              </h2>

            </div>

          </div>


          <div className="prediction-metric-card prediction-metric-unscored">

            <div className="prediction-metric-icon">

              <CircleHelp
                size={21}
              />

            </div>


            <div>

              <span>
                Insufficient Data
              </span>


              <h2>
                {summary.unscored}
              </h2>

            </div>

          </div>

        </section>


        {/* =====================================
           RANKING + DETAIL
        ===================================== */}

        <section className="predictions-layout">


          {/* RISK RANKING */}

          <div className="predictions-card predictions-ranking-card">

            <div className="predictions-card-header">

              <div>

                <h2>
                  Risk Ranking
                </h2>


                <p>
                  Projects ordered by risk level
                  and overall risk score
                </p>

              </div>

            </div>


            {ranked.length === 0 ? (

              <div className="predictions-empty">

                No projects available for risk
                assessment.

              </div>

            ) : (

              <div className="predictions-ranking-list">

                {ranked.map((risk) => (

                  <button
                    type="button"
                    key={risk.projectId}
                    className={
                      `predictions-ranking-row ${
                        selectedId === risk.projectId
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      loadDetail(risk.projectId)
                    }
                  >

                    <div className="predictions-ranking-main">

                      <strong>

                        {risk.projectName ??
                          risk.projectId}

                      </strong>


                      <span className="predictions-ranking-id">

                        {risk.projectId}

                      </span>

                    </div>


                    <div className="predictions-ranking-score">

                      <span>

                        {formatNumber(
                          risk.overallRiskScore
                        )}

                      </span>


                      <span
                        className={
                          `prediction-risk-badge ${
                            riskLevelClass(
                              risk.riskLevel
                            )
                          }`
                        }
                      >

                        {risk.riskLevel ??
                          "No Data"}

                      </span>

                    </div>


                    <ChevronRight
                      size={16}
                      className="predictions-ranking-chevron"
                    />

                  </button>

                ))}

              </div>

            )}

          </div>


          {/* PROJECT DETAIL */}

          <div className="predictions-card predictions-detail-card">

            {!selected ? (

              <div className="predictions-empty">

                {detailLoading
                  ? "Loading project risk..."
                  : "Select a project to view its risk drivers."}

              </div>

            ) : (

              <>


                <div className="predictions-card-header">

                  <div>

                    <h2>

                      {selected.projectName ??
                        selected.projectId}

                    </h2>


                    <p>

                      Updated{" "}

                      {selected.computedAt
                        ? new Date(
                            selected.computedAt
                          ).toLocaleString(
                            "en-IN"
                          )
                        : "--"}

                    </p>

                  </div>


                  <span
                    className={
                      `prediction-risk-badge ${
                        riskLevelClass(
                          selected.riskLevel
                        )
                      }`
                    }
                  >

                    {selected.riskLevel ??
                      "No Data"}

                  </span>

                </div>


                {/* OVERALL SCORE */}

                <div className="predictions-score-panel">

                  <div>

                    <span>
                      Overall Risk Score
                    </span>


                    <strong>

                      {formatNumber(
                        selected.overallRiskScore
                      )}

                      <small>
                        {" "} / 100
                      </small>

                    </strong>

                  </div>


                  <div className="predictions-score-bar">

                    <div
                      className="predictions-score-fill"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            selected.overallRiskScore ??
                              0,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>


                  <span className="predictions-data-status">

                    Data status:{" "}

                    {selected.dataStatus.replace(
                      /_/g,
                      " "
                    )}

                  </span>

                </div>


                {/* EARLY WARNING */}

                {topDriver && (

                  <div className="predictions-warning">

                    <TriangleAlert
                      size={18}
                    />


                    <div>

                      <strong>
                        Primary risk driver
                      </strong>


                      <p>

                        {topDriver.label} is the
                        largest contributing factor

                        {" "}

                        ({formatNumber(
                          topDriver.value
                        )}

                        /100).

                      </p>

                    </div>

                  </div>

                )}


                {/* COMPONENT BREAKDOWN */}

                <div className="predictions-components">

                  {COMPONENT_META.map((meta) => {

                    const value =
                      selected.components?.[
                        meta.key
                      ];

                    const Icon =
                      meta.icon;


                    return (

                      <div
                        className="predictions-component"
                        key={meta.key}
                      >

                        <div className="predictions-component-head">

                          <div className="predictions-component-label">

                            <Icon
                              size={16}
                            />

                            <span>
                              {meta.label}
                            </span>

                          </div>


                          <strong>

                            {formatNumber(value)}

                          </strong>

                        </div>


                        <div className="predictions-component-bar">

                          <div
                            className="predictions-component-fill"
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  value ?? 0,
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                    );

                  })}

                </div>


                {/* DERIVED METRICS */}

                <div className="predictions-derived">

                  <div className="prediction-derived-item">

                    <span>
                      Financial Progress
                    </span>

                    <strong>

                      {formatNumber(
                        selected.derived
                          ?.financialProgress
                      )}

                      %

                    </strong>

                  </div>


                  <div className="prediction-derived-item">

                    <span>
                      Physical Progress
                    </span>

                    <strong>

                      {formatNumber(
                        selected.derived
                          ?.physicalProgressPct
                      )}

                      %

                    </strong>

                  </div>


                  <div className="prediction-derived-item">

                    <span>
                      Cost Variance
                    </span>

                    <strong>

                      {formatNumber(
                        selected.derived
                          ?.costVariance
                      )}

                    </strong>

                  </div>


                  <div className="prediction-derived-item">

                    <span>
                      Schedule Variance
                    </span>

                    <strong>

                      {formatNumber(
                        selected.derived
                          ?.scheduleVariance
                      )}

                    </strong>

                  </div>

                </div>

              </>

            )}

          </div>

        </section>

      </div>

    </DashboardLayout>

  );

}


export default Predictions;
