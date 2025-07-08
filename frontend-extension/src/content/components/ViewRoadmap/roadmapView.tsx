import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowDown, FaEye } from "react-icons/fa";
import Header from "../../utils/Header";
import getToken from "../../utils/utils";
import ModifyRoadmapChat from "./ModifyRoadmapChat";
import RoadmapAdvance from "./roadmapAdvanced";

const backendUrl = "https://www.docroadmap.fr";

// const env = import.meta.env.VITE_ENV_MODE;
// const backendUrl =
//   env === "development" ? "http://localhost:8082" : "https://www.docroadmap.fr";

const isDev = process.env.NODE_ENV !== "production";
const basePath = isDev ? "./assets/" : "./assets/";

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

interface Step {
  id: number;
  name: string;
  description: string;
  endedAt: string;
  status: string;
}

interface Card {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
  steps: Step[];
}

const RoadmapView: React.FC = () => {
  const { t } = useTranslation();
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [chatProcessId, setChatProcessId] = useState<number | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedProcessName, setSelectedProcessName] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ [key: number]: string }>(
    {},
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  useEffect(() => {
    fetchUserProcesses();
  }, []);

  const fetchUserProcesses = async () => {
    const token = await getToken();
    setToken(token);
    if (!token) return setError(t("missingToken"));
    try {
      const res = await axios.get(`${backendUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allCards: Card[] = res.data.processes || [];
      const completed: Card[] = [];

      for (const card of allCards) {
        const allDone =
          card.steps.length > 0 &&
          card.steps.every((s) => s.status === "COMPLETED");
        if (allDone) {
          try {
            await axios.post(
              `${backendUrl}/process/end-process/${card.id}`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
          } catch (e) {
            console.error("Error closing process:", e);
          }
          completed.push(card);
        }
      }

      setCards(allCards.filter((card) => !completed.includes(card)));
    } catch {
      setError(t("fetchError"));
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollArrow(scrollTop + clientHeight < scrollHeight - 10);
    };
    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const updateEndedAt = async (stepId: number) => {
    try {
      const date = selectedDate[stepId];
      if (!date) return;
      const formatted = `${date}:00.000Z`;
      await axios.patch(
        `${backendUrl}/steps/${stepId}`,
        { endedAt: formatted },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, endedAt: formatted } : s)),
      );
    } catch {
      console.error(t("updateEndedAtError"));
      setError(t("updateEndedAtError"));
    }
  };

  const getSteps = async (id: number, name: string) => {
    try {
      const res = await axios.get(`${backendUrl}/process/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSteps(res.data.steps.sort((a: Step, b: Step) => a.id - b.id));
      setSelectedProcessName(name);
      setShowSteps(true);
    } catch {
      setError(t("fetchStepsError"));
    }
  };

  return (
    <div
      className="roadmap-panel-container"
      role="region"
      aria-label="Roadmap Extension Panel"
    >
      <style>{`
        .roadmap-panel-container {
          width: 100%;
          position: relative;
          height: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
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
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .card {
          background: #fff;
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
          width: 100%;
        }
        .card-header {
          background: #007bff;
          padding: 0.5rem 0.75rem;
        }
        .card-header h3 {
          font-size: 1rem;
          font-weight: 600;
          background: #007bff;
          color: white;
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
        .modify-button {
          margin-top: 0.5rem;
          width: 90%;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.18s;
          padding: 0.5rem 0.75rem;
        }
        .modify-button:hover {
          background: #5a6268;
        }
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .scroll-arrow-button {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 50%;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>

      <Header title={t("currentRoadmaps") || ""} icon={<FaEye />} />
      {error && <p className="error-message">{error}</p>}

      {!showSteps ? (
        <div className="carousel-container" ref={scrollRef}>
          {cards
            .sort((a, b) => b.id - a.id)
            .map((card) => (
              <div className="card" key={card.id}>
                <img
                  className="card-image"
                  src={getImageForCardName(card.name)}
                  alt={t("imageAlt") || ""}
                />
                <div className="card-header">
                  <h3>{card.name}</h3>
                </div>
                <div className="card-body">
                  <p>
                    {card.steps.filter((s) => s.status === "COMPLETED").length}{" "}
                    {t("step")}
                    {card.steps.filter((s) => s.status === "COMPLETED").length >
                    1
                      ? "s"
                      : ""}{" "}
                    {t("validated")} {card.steps.length}
                  </p>
                  <button
                    className="continue-button"
                    onClick={() => getSteps(card.id, card.name)}
                  >
                    {t("continue")}
                  </button>
                  <button
                    className="modify-button"
                    onClick={() => setChatProcessId(card.id)}
                  >
                    {t("update_roadmap")}
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <RoadmapAdvance
          steps={steps}
          processName={selectedProcessName}
          onClose={async () => {
            setShowSteps(false);
            await fetchUserProcesses();
          }}
          onUpdateEndedAt={updateEndedAt}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      )}

      {chatProcessId && (
        <ModifyRoadmapChat
          processId={chatProcessId}
          onClose={() => setChatProcessId(null)}
          onRefresh={() => getSteps(chatProcessId, selectedProcessName)}
        />
      )}

      {showScrollArrow && (
        <button
          className="scroll-arrow-button"
          onClick={() =>
            scrollRef.current?.scrollBy({
              top: scrollRef.current.clientHeight * 0.8,
              behavior: "smooth",
            })
          }
          aria-label="Scroll down"
        >
          <FaArrowDown />
        </button>
      )}
    </div>
  );
};

export default RoadmapView;
