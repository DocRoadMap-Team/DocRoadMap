import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";

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
    <div className="advanced-steps-container">
      <style>{`
        .advanced-steps-container {
          width: 100%;
          height: 100%;
          background: #f9fafc;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .advanced-header {
          background: #007bff;
          color: white;
          padding: 1rem 1.5rem;
          font-size: 1.1rem;
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

        .step-index.completed {
          background: #30c36b;
          color: white;
        }

        .step-description {
          margin-top: 0.75rem;
          background: #f0f4ff;
          border-left: 4px solid #007bff;
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
          background: #343aeb;
          color: white;
          border: none;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
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

      <div className="steps-scroll">
        {steps.length > 0 ? (
          steps.map((step, idx) => (
            <div className="step-card" key={step.id}>
              <div
                className="step-header"
                onClick={() =>
                  setExpandedStep(expandedStep === step.id ? null : step.id)
                }
              >
                <div className="step-title">
                  <span
                    className={`step-index${
                      step.status === "COMPLETED" ? " completed" : ""
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {step.name}
                  {step.status === "COMPLETED" && (
                    <FaCheckCircle style={{ color: "#30c36b" }} />
                  )}
                </div>
                {expandedStep === step.id ? (
                  <FaChevronUp className="chevron-icon" />
                ) : (
                  <FaChevronDown className="chevron-icon" />
                )}
              </div>

              {expandedStep === step.id && (
                <>
                  <div className="step-description">{step.description}</div>
                  <div className="step-footer">
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
                    <button onClick={() => onUpdateEndedAt(step.id)}>✅</button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="no-steps">{t("roadmapFetchError")}</p>
        )}
      </div>
    </div>
  );
};

export default RoadmapAdvance;
