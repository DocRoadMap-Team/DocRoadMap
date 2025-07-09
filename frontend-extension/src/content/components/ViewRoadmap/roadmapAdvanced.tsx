import { useEffect, useRef, useState } from "react";
import {
  FaArrowDown,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

import { openModifyChat } from "../../InjectedComponent";

import { useTranslation } from "react-i18next";
import getToken from "../../utils/utils";

const backendUrl = "https://www.docroadmap.fr";

interface Step {
  id: number;
  name: string;
  description: string;
  endedAt: string;
  status: string;
}

interface Props {
  steps: Step[];
  processName: string;
  processId: number;
  onClose: () => void;
  onUpdateEndedAt: (stepId: number) => void;
  selectedDate: { [key: number]: string };
  setSelectedDate: React.Dispatch<
    React.SetStateAction<{ [key: number]: string }>
  >;
}

const RoadmapAdvance: React.FC<Props> = ({
  steps,
  processName,
  processId,
  onClose,
  onUpdateEndedAt,
  selectedDate,
  setSelectedDate,
}) => {
  const { t } = useTranslation();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const endProcess = async (stepId: number) => {
    try {
      const token = await getToken();

      if (!token) {
        console.error("Aucun token trouvé");
        return;
      }

      const response = await fetch(`${backendUrl}/steps/end-status/${stepId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(
          `Erreur backend (${response.status}) pour l'étape ${stepId}:`,
          data
        );
        alert(`Erreur lors de la finalisation de la démarche ${stepId}`);
        return;
      }

      onUpdateEndedAt(stepId);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la requête PATCH:", error);
    }
  };

  const sortedSteps = [...steps]; //.sort((a, b) => a.id - b.id);

  return (
    <div className="advanced-steps-container">
      <style>{`
      .link {
        color: #007bff;
        text-decoration: none;
      }
      .link:hover {
        text-decoration: underline;
      }
      .advanced-steps-container {
        width: 100%;
        height: 100%;
        background: #f9fafc;
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        .advanced-header {
          background: royalblue;
          color: white;
          padding: 1rem 1.5rem;
          font-size: 14px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .steps-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;

          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
        }
        .steps-scroll::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }
        .step-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          padding: 1rem;
          transition: box-shadow 0.2s;
        }
        .step-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }
        .step-title {
          font-weight: 600;
          font-size: 1rem;
          color: #20498a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .step-index {
          background: #dee2e6;
          color: #20498a;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          font-size: 0.9rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .step-description {
          margin-top: 0.75rem;
          background: #f0f4ff;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          color: #20498a;
          font-size: 0.95rem;
          white-space: pre-line;
        }
        .step-footer {
          margin-top: 0.5rem;
          display: flex;
          gap: 0.5rem;
        }
        .step-footer input {
          flex: 1;
          padding: 0.4rem;
          font-size: 0.9rem;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .step-footer button {
          background:rgb(255, 255, 255);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transition: background 0.2s ease;
        }
        .no-steps {
          text-align: center;
          color: #888;
          font-style: italic;
        }
        .chevron-icon {
          font-size: 0.9rem;
          color: #555;
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
        .step-header.completed {
          cursor: default;
        }

        .step-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .step-right-icon {
          width: 24px; /* ou 28px */
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .validation-icon {
          color: #30c36b;
          font-size: 1.3rem;
        }
        .validate-button {
          background: #30c36b; /* vert de validation */
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
          transition: background 0.2s ease;
        }
        .step-icons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
      `}</style>

      <div className="advanced-header">
        {processName}
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            color: "white",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
          aria-label={t("close")}
        >
          ✖
        </button>
      </div>

      <div
        className="steps-scroll"
        ref={scrollRef}
        tabIndex={0}
        aria-label="Scrollable Steps Container"
      >
        {sortedSteps.length > 0 ? (
          sortedSteps
            .sort((a, b) => a.id - b.id)
            .map((step, idx) => (
              <div className="step-card" key={step.id}>
                <div
                  className={`step-header${step.status === "COMPLETED" ? " completed" : ""}`}
                  onClick={() => {
                    setExpandedStep(expandedStep === step.id ? null : step.id);
                  }}
                >
                  <div className="step-title">
                    <span className="step-index">{idx + 1}</span>
                    <span>{step.name}</span>
                  </div>

                  <div className="step-icons">
                    <div className="step-right-icon">
                      {expandedStep === step.id ? (
                        <FaChevronUp className="chevron-icon" />
                      ) : (
                        <FaChevronDown className="chevron-icon" />
                      )}
                    </div>
                    {step.status === "COMPLETED" && (
                      <FaCheckCircle
                        className="validation-icon"
                        title={t("completed")}
                      />
                    )}
                  </div>
                </div>

                {expandedStep === step.id && (
                  <>
                    <div className="step-description">
                      {step.description
                        .split(/(https?:\/\/[^\s]+)/g)
                        .map((part, i) =>
                          part.match(/^https?:\/\/[^\s]+$/) ? (
                            <a
                              key={i}
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link"
                            >
                              {part}
                            </a>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      {step.description}
                    </div>
                    {step.status !== "COMPLETED" && (
                      <div className="step-footer">
                        <input
                          aria-label="Select date and time"
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
                        />
                        <button onClick={() => endProcess(step.id)}>✅</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
        ) : (
          <p className="no-steps">{t("roadmapFetchError")}</p>
        )}
      </div>

      <button
        onClick={() => openModifyChat(processId)}
        style={{
          background: "royalblue",
          color: "white",
          padding: "0.4rem 0.8rem",
          fontSize: "14px",
          border: "none",
          borderRadius: "4px",
          fontWeight: 500,
          cursor: "pointer",
          marginTop: "0.5rem",
          marginBottom: "0.5rem",
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",
          whiteSpace: "nowrap",
        }}
      >
        ✏️ {t("updateRoadmap")}
      </button>

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

export default RoadmapAdvance;
