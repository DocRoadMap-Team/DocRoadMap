import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

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
  onClose,
  onUpdateEndedAt,
  selectedDate,
  setSelectedDate,
}) => {
  const { t } = useTranslation();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div className="card steps-card">
      <style>{`
        .steps-card {
          width: 100%;
          height: 420px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44,62,80,0.13);
          background: #fff;
          border: 1px solid #e3e6ef;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .steps-card .card-header {
          background: #007bff;
          padding: 1rem;
          border-radius: 16px 16px 0 0;
          display: flex;
          align-items: center;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .close-button {
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
        }
        .close-button:hover {
          color: #e53e3e;
        }
        .steps-timeline {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .timeline-step {
          display: flex;
          gap: 1rem;
          position: relative;
        }
        .timeline-index {
          width: 32px;
          height: 32px;
          background: #e0e0e0;
          color: #20498A;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .timeline-index.completed {
          background: #30c36b;
          color: #fff;
        }
        .timeline-content {
          flex: 1;
        }
        .timeline-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          cursor: pointer;
        }
        .timeline-description {
          margin-top: 0.5rem;
          background: #f8fafd;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          color: #20498A;
          font-size: 0.95rem;
          box-shadow: 0 2px 8px rgba(44,62,80,0.04);
        }
        .timeline-date-input-row {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .timeline-date-input-row input {
          padding: 0.3rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 0.85em;
        }
        .timeline-date-input-row button {
          padding: 0.3rem 0.75rem;
          background: #4A88C5;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85em;
        }
      `}</style>

      <button
        className="close-button"
        onClick={onClose}
        aria-label={t("close")}
      >
        ×
      </button>
      <div className="card-header">{processName}</div>
      <div className="steps-timeline">
        {steps.length > 0 ? (
          steps.map((step, idx) => (
            <div key={step.id} className="timeline-step">
              <div
                className={`timeline-index${step.status === "COMPLETED" ? " completed" : ""}`}
              >
                {idx + 1}
              </div>
              <div className="timeline-content">
                <div
                  className="timeline-title"
                  onClick={() =>
                    setExpandedStep(expandedStep === step.id ? null : step.id)
                  }
                >
                  {step.name}
                  <button className="timeline-expand-btn">
                    {expandedStep === step.id ? <FaArrowUp /> : <FaArrowDown />}
                  </button>
                </div>
                {expandedStep === step.id && (
                  <div className="timeline-description">
                    <p style={{ whiteSpace: "pre-line" }}>{step.description}</p>
                    <div className="timeline-date-input-row">
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
                      />
                      <button onClick={() => onUpdateEndedAt(step.id)}>
                        📅
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>{t("roadmapFetchError")}</p>
        )}
      </div>
    </div>
  );
};

export default RoadmapAdvance;
