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
    {}
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
              }
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, endedAt: formatted } : s))
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
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        font-family: 'Segoe UI', sans-serif;
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
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0rem 0.5rem 0.5rem 0.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        background: #e5e7eb;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
        .carousel-container::-webkit-scrollbar {
        display: none;
      }
      .card {
        background: #ffffff;
        border-radius: 16px;
        padding: 0.5rem 0.5rem;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12), 0 4px 6px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        width: 100%;
        max-width: 1500px;
      }
      .card-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #2b2d42;
        margin-bottom: 0.3rem;
      }
      .progress-label-alt {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        color: #1f2937;
        font-weight: 600;
        margin-top: 0.5rem;
      }
      .progress-bar-container {
        background-color:rgb(184, 189, 197);
        height: 8px;
        border-radius: 6px;
        width: 100%;
        overflow: hidden;
        margin-top: 0.2rem;
      }
      .progress-bar-fill {
        height: 100%;
        background-color: #4a63f3;
        transition: width 0.3s ease;
      }
      .continue-button {
        margin: 0.5rem auto 0 auto;
        background: linear-gradient(90deg, #4a63f3 0%, #6a82fb 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 0.5rem 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.25s ease;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        max-width: 90%;
        min-width: 320px;
      }
      .continue-button:hover {
        background: linear-gradient(90deg, #3c4edb 0%, #5f75eb 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(74, 99, 243, 0.25);
      }
      .continue-button .arrow {
        transition: transform 0.2s ease;
      }
      .continue-button:hover .arrow {
        transform: translateX(4px);
      }
      .modify-button {
        margin-top: 0.4rem;
        background: #f0f0f0;
        color: #333;
        border: none;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        cursor: pointer;
        width: 100%;
        transition: background 0.2s;
      }
      .modify-button:hover {
        background: #e0e0e0;
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
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .card-header-left {
        display: flex;
        align-items: center;
      }
      .doc-icon {
        font-size: 1.6rem;
      }
      .card-header-center {
        text-align: center;
        flex-grow: 1;
      }
      .card-subtitle {
        font-size: 0.85rem;
        color: #9ca3af;
        margin-top: -4px;
      }
      .card-header-right {
        display: flex;
        align-items: center;
      }
      .progress-circle {
        background: #dbeafe;
        color: #1e3a8a;
        border-radius: 999px;
        width: 50px;
        height: 50px;
        font-weight: 700;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .progress-label-alt {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        color: #6b7280;
        margin-top: 0.5rem;
      }
      .card-header-banner {
        background: #4a63f3;
        border-radius: 12px 12px 0 0;
        padding: 1rem 1.2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: white;
      }
      .card-banner-left {
        font-size: 1.4rem;
        }
      .card-banner-center {
        flex-grow: 1;
        text-align: center;
        font-size: 1rem;
        font-weight: 600;
        }
      .card-banner-right {
         display: flex;
          align-items: center;
        }
       .circle-badge {
          background-color: rgba(255, 255, 255, 0.2);
          border: 2px solid white;
          border-radius: 50%;
          width: 46px;
          height: 46px;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }
    `}</style>

      <Header title={t("currentRoadmaps") || ""} icon={<FaEye />} />
      {error && <p className="error-message">{error}</p>}

      {!showSteps ? (
        <div className="carousel-container" ref={scrollRef}>
          {cards
            .sort((a, b) => b.id - a.id)
            .map((card) => {
              const totalSteps = card.steps.length;
              const validatedSteps = card.steps.filter(
                (s) => s.status === "COMPLETED"
              ).length;
              const percentage = totalSteps
                ? Math.round((validatedSteps / totalSteps) * 100)
                : 0;

              return (
                <div className="card" key={card.id}>
                  <div className="card-header-banner">
                    <div className="card-banner-left">📄</div>
                    <div className="card-banner-center">
                      <div className="card-banner-title">{card.name}</div>
                      <div className="card-banner-subtitle">
                        Dossier #{card.id}
                      </div>
                    </div>
                    <div className="card-banner-right">
                      <div className="circle-badge">{percentage}%</div>
                    </div>
                  </div>

                  <div className="progress-label-alt">
                    <span>{t("Progress")}</span>
                    <span style={{ fontWeight: 600 }}>
                      {percentage}% {t("completed")}
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <button
                    className="continue-button"
                    onClick={() => getSteps(card.id, card.name)}
                  >
                    {percentage === 0 ? t("start") : t("continue")}
                  </button>
                </div>
              );
            })}
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
