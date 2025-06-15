import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import getToken from "../../utils/utils";

const isDev = process.env.NODE_ENV !== "production";
const basePath = isDev ? "./assets/" : "./assets/";

const backendUrl = "https://www.docroadmap.fr";

const normalize = (str: string): string =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getImageForCardName = (name: string): string => {
  const lower = normalize(name);

  if (lower.includes("naissance"))
    return chrome.runtime.getURL(`${basePath}born_roadmap.png`);
  if (lower.includes("demenagement"))
    return chrome.runtime.getURL(`${basePath}moving_roadmap.png`);
  if (lower.includes("enfant"))
    return chrome.runtime.getURL(`${basePath}keep_children.png`);
  if (lower.includes("parent"))
    return chrome.runtime.getURL(`${basePath}move_from_parents_roadmap.png`);
  if (lower.includes("logement") || lower.includes("acheter"))
    return chrome.runtime.getURL(`${basePath}buy_roadmap.png`);
  if (lower.includes("emploi") || lower.includes("travail"))
    return chrome.runtime.getURL(`${basePath}find_job_roadmap.png`);
  if (lower.includes("passeport") || lower.includes("passport"))
    return chrome.runtime.getURL(`${basePath}passport_roadmap.png`);
  if (lower.includes("carte") && lower.includes("identite"))
    return chrome.runtime.getURL(`${basePath}id_roadmap.png`);
  return chrome.runtime.getURL(`${basePath}docroadmap.png`);
};

interface Card {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
  steps: unknown[];
}

const RoadmapView: React.FC = () => {
  const { t } = useTranslation();
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  interface Step {
    id: number;
    name: string;
    description: string;
    endedAt: string;
    status: string;
  }

  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedProcessName, setSelectedProcessName] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ [key: number]: string }>(
    {},
  );

  useEffect(() => {
    const fetchUserProcesses = async () => {
      const token = await getToken();
      setToken(token);

      if (!token) {
        setError(t("missingToken"));
        return;
      }
      try {
        const response = await axios.get(`${backendUrl}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const processes = response.data.processes || [];
        setCards(processes);
      } catch (error) {
        console.error("Erreur lors de la récupération des roadmaps :", error);
        setError(t("fetchError"));
      }
    };

    fetchUserProcesses();
  }, [t]);

  const updateEndedAt = async (stepId: number) => {
    try {
      const dateValue = selectedDate[stepId];
      if (!dateValue) return;

      const formattedDate = `${dateValue}:00.000Z`;

      await axios.patch(
        `${backendUrl}/steps/${stepId}`,
        { endedAt: formattedDate },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSteps(
        steps.map((step) =>
          step.id === stepId ? { ...step, endedAt: formattedDate } : step,
        ),
      );

      alert(t("dateUpdatedAlert"));
    } catch (error) {
      console.error("Update failed:", error);
      alert(t("updateError"));
    }
  };

  const getValidatedStepsCount = (status: string) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "IN_PROGRESS":
        return 1;
      case "COMPLETED":
        return 3;
      default:
        return 0;
    }
  };

  const getSteps = async (id: number, name: string) => {
    try {
      const response = await axios.get(`${backendUrl}/process/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSteps(response.data.steps);
      setSelectedProcessName(name);
      setShowSteps(true);
    } catch {
      setError(t("fetchStepsError"));
    }
  };

  const closeSteps = () => {
    setShowSteps(false);
    setSteps([]);
    setSelectedProcessName("");
  };

  return (
    <div className="roadmap-panel-container">
      <style>
        {`
        .roadmap-panel-container {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .roadmap-header {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          padding-bottom: 0.25rem;
          flex-direction: row;
          border-bottom: 1px solid #e0e0e0;
        }
        .roadmap-title {
          font-size: 1.1rem;
          font-weight: bold;
          padding: 0.5rem 0;
          color:black;
          flex-direction: row;
          margin: 0;
        }
        .error-message {
          color: #e53e3e;
          background: #fff0f0;
          border: 1px solid #e53e3e;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        .carousel-container {
          flex: 1 1 auto;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-bottom: 0.5rem;
        }
        .card {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(44,62,80,0.08);
          width: 100%;
          max-width: 100%;
          flex-direction: row;
          align-items: flex-start;
          transition: box-shadow 0.2s;
          position: relative;
          box-sizing: border-box;
        }
        .card:hover {
          box-shadow: 0 4px 16px rgba(44,62,80,0.14);
        }
        .card-image {
          width:100%;
          border-radius: 10px 10px 0 0;
        }
        .card-header {
          margin-bottom: 0.2rem;
          background: #007bff;
          padding: 0.5rem 0.75rem;
        }
        .card-header h3 {
          font-size: 1rem;
          font-weight: 600;
          background: #007bff;
          color:white;
          margin: 0;
          text-align: center;
          word-break: break-word;
        }
        .card-body {
          flex: 1 1 auto;
          padding: 0.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .process {
          font-size: 0.95rem;
          color: black;
          margin-bottom: 0.3rem;
          text-align: center;
          word-break: break-word;
        }
        .card-body p {
          margin: 0;
          color: black;
          font-size: 0.9rem;
        }
        .continue-button {
          margin-top: 0.5rem;
          width: 90%;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.18s;
          padding: 0.5rem 0.75rem;
        }
        .continue-button:hover {
          background: #225ea8;
        }
        .carousel-container::-webkit-scrollbar {
          width: 6px;
        }
        .carousel-container::-webkit-scrollbar-thumb {
          background: #e0e0e0;
          border-radius: 3px;
        }
        .carousel-container {
          scrollbar-width: thin;
          scrollbar-color: #e0e0e0 #f7f8fa;
        }
        .steps-card {
          width: 100%;
          height: 420px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44,62,80,0.13);
          position: relative;
          background: #fff;
          border: 1px solid #e3e6ef;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .steps-card .card-header {
          width: 100%;
          position: sticky;
          top: 0;
          background: #007bff;
          padding: 1.1rem 2.5rem 1.1rem 1.3rem;
          border-radius: 16px 16px 0 0;
          z-index: 1;
          display: flex;
          align-items: center;
          min-height: 35px;
          flex: 0 0 auto;
        }
        .steps-card .steps-list {
          width: 85%;
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 1.2rem 1.3rem 1.3rem 1.3rem;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          background: #fff;
          scrollbar-width: thin;
          scrollbar-color: #e0e0e0 #f7f8fa;
        }
        .steps-card .close-button {
          position: absolute;
          right: 18px;
          top: 18px;
          background: white;
          border: none;
          border-radius: 50%;
          font-size: 1.35rem;
          color: #888;
          cursor: pointer;
          z-index: 2;
          transition: color 0.15s;
          padding: 0;
          line-height: 1;
        }
        .steps-card .close-button:hover {
          color: #e53e3e;
        }
        .steps-card .card-header h3 {
          color: #fff;
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0;
          flex: 1;
          flex-direction: row;
          text-align: left;
          letter-spacing: 0.01em;
        }
        .steps-card .steps-list::-webkit-scrollbar {
          width: 7px;
        }
        .steps-card .steps-list::-webkit-scrollbar-thumb {
          background: #e0e0e0;
          border-radius: 3px;
        }
        .steps-card .steps-list > p {
          color: #7a869a;
          font-size: 1.06em;
          text-align: center;
          margin: auto 0;
          padding: 2.5rem 0;
          opacity: 0.85;
          font-weight: 500;
          letter-spacing: 0.01em;
        }
        .steps-card .step-item {
          background: #F0F5FF;
          border-radius: 6px;
          color: #20498A;
          font-size: 0.9em;
          border-left: 3px solid #4A88C5;
          transition: transform 0.2s ease, background 0.18s;
          padding: 10px 12px;
          margin: 6px 0;
          box-shadow: none;
          display: block;
        }
        .steps-card .step-item:hover {
          transform: translateX(2px);
          background: #E8F1FF;
        }
        .steps-card .step-item h4 {
          color: #20498A;
          font-size: 1em;
          font-weight: 600;
          margin: 0 0 2px 0;
        }
        .steps-card .step-item p {
          color: #20498A;
          font-size: 0.95em;
          margin: 0;
        }
        .steps-card .steps-list::-webkit-scrollbar {
          width: 7px;
        }
        .steps-card .steps-list::-webkit-scrollbar-thumb {
          background: #e0e0e0;
          border-radius: 3px;
        }
        .steps-card .steps-list {
          scrollbar-width: thin;
          scrollbar-color: #e0e0e0 #f7f8fa;
        }
        .status-row {
          display: flex;
          align-items: center;
          margin-top: 0.4rem;
          gap: 0.5rem;
        }
        .status-switch {
          width: 34px;
          height: 20px;
          border-radius: 12px;
          background: #ccc;
          position: relative;
          transition: background 0.2s;
          display: inline-block;
        }
        .status-switch::before {
          content: '';
          position: absolute;
          left: 3px;
          top: 3px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          transition: left 0.2s, background 0.2s;
          box-shadow: 0 1px 4px rgba(44,62,80,0.13);
        }
        .status-switch.on {
          background: #30c36b;
        }
        .status-switch.on::before {
          left: 17px;
          background: #fff;
        }
        .status-label {
          font-size: 0.97rem;
          color: #444;
          font-weight: 500;
          letter-spacing: 0.01em;
        }`}
      </style>
      <div className="roadmap-header">
        <h1 className="roadmap-title">{t("currentRoadmaps")}</h1>
      </div>
      {error && <p className="error-message">{error}</p>}

      {!showSteps ? (
        <div className="carousel-container">
          {cards
            .sort((a, b) => b.id - a.id)
            .map((card) => (
              <div className="card" key={card.id}>
                <img
                  className="card-image"
                  src={getImageForCardName(card.name)}
                  alt={t("imageAlt")}
                />
                <div className="card-header">
                  <h3>{card.name}</h3>
                </div>
                <div className="card-body">
                  <p>
                    {getValidatedStepsCount(card.status)} {t("step")}
                    {getValidatedStepsCount(card.status) > 1 ? "s" : ""}{" "}
                    {t("validated")} 3
                  </p>
                  <button
                    className="continue-button"
                    onClick={() => getSteps(card.id, card.name)}
                  >
                    {t("continue")}
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="card steps-card">
          <button
            className="close-button"
            onClick={closeSteps}
            aria-label={t("close")}
          >
            &#x2715;
          </button>
          <div className="card-header">
            <h3>{selectedProcessName}</h3>
          </div>
          <div className="steps-list">
            {steps.length > 0 ? (
              steps
                .sort((a, b) => b.id - a.id)
                .map((step) => (
                  <div key={step.id} className="step-item">
                    <h4>{step.name}</h4>
                    <p>{step.description}</p>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      <input
                        type="datetime-local"
                        value={
                          selectedDate[step.id] ||
                          (step.endedAt ? step.endedAt.slice(0, 16) : "")
                        }
                        onChange={(e) =>
                          setSelectedDate({
                            ...selectedDate,
                            [step.id]: e.target.value,
                          })
                        }
                        style={{
                          padding: "0.3rem",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          fontSize: "0.85em",
                        }}
                      />
                      <button
                        onClick={() => updateEndedAt(step.id)}
                        style={{
                          padding: "0.3rem 0.75rem",
                          background: "#4A88C5",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.85em",
                        }}
                      >
                        📅
                      </button>
                    </div>

                    <div className="status-row">
                      <span
                        className={`status-switch ${
                          step.status === "COMPLETED" ? "on" : ""
                        }`}
                      ></span>
                      <span className="status-label">
                        {step.status === "COMPLETED"
                          ? t("validatedLabel")
                          : t("pendingLabel")}
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              <p>{t("roadmapFetchError")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapView;
