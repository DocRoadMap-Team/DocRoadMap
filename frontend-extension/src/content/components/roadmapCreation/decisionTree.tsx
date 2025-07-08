/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRoad } from "react-icons/fa";
import Header from "../../utils/Header";
import getToken from "../../utils/utils";
import rawData from "./decisionTree.json";
import ChatMessageBubble from "./DecisionTreeComponents/ChatMessageBubble";
import OptionsColumn from "./DecisionTreeComponents/OptionsColumn";

const backendUrl = "https://www.docroadmap.fr";

// const env = import.meta.env.VITE_ENV_MODE;
// const backendUrl =
//   env === "development" ? "http://localhost:8082" : "https://www.docroadmap.fr";

type DecisionTreeData = {
  [key: string]: any;
};

const decisionTreeData: DecisionTreeData = rawData;

type QuestionNode = {
  question: string;
  options: { label: string; next: string }[];
};

type StepOption = {
  label: string | null;
  answer: string | null;
};

type StepNode = {
  step_title: string;
  step_question: string | null;
  status: "mandatory" | "optional";
  options: StepOption[];
};

type ChatHistoryEntry =
  | { type: "question"; key: string }
  | { type: "answer"; label: string };

function getProcessAnswersKey(processKey: string): string | null {
  if (processKey === "dem_answers") return "dem_answers";
  if (processKey === "aide_logement_answers") return "aide_logement_answers";
  if (processKey === "independance_answers") return "independance_answers";
  if (processKey === "emploi_answers") return "emploi_answers";
  return null;
}

function getStepsForProcess(
  processAnswers: Record<string, StepNode>,
  userAnswers: Record<string, string>
): { step_title: string; answer: string }[] {
  const steps: { step_title: string; answer: string }[] = [];
  for (const step of Object.values(processAnswers)) {
    if (step.step_question) {
      const userValue = userAnswers[step.step_question];
      const option = step.options.find((opt) => opt.label === userValue);
      if (step.status === "mandatory" && option && option.answer) {
        steps.push({ step_title: step.step_title, answer: option.answer });
      }
      if (step.status === "optional" && userValue && option && option.answer) {
        steps.push({ step_title: step.step_title, answer: option.answer });
      }
    } else {
      const option = step.options[0];
      if (option && option.answer) {
        steps.push({ step_title: step.step_title, answer: option.answer });
      }
    }
  }
  return steps;
}

const styles: { [key: string]: React.CSSProperties } = {
  outer: {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 24px rgba(75, 123, 255, 0.10)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', 'Roboto', 'Segoe UI', Arial, sans-serif",
    zIndex: 1001,
    color: "#222",
  },
  chatWindow: {
    padding: 24,
    flex: 1,
    overflowY: "auto",
    scrollBehavior: "smooth",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  botBubble: {
    background: "#F4F8FF",
    padding: "16px 20px",
    borderRadius: 20,
    alignSelf: "flex-start",
    maxWidth: "80%",
    marginBottom: 6,
    fontSize: 16,
    color: "#222",
    fontWeight: 500,
    boxShadow: "0 2px 8px rgba(75, 123, 255, 0.07)",
  },
  restartBtn: {
    marginTop: 16,
    background: "#4B7BFF",
    border: "none",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    borderRadius: 16,
    padding: "12px 32px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(75, 123, 255, 0.07)",
    transition: "background 0.18s, box-shadow 0.18s",
  },
  link: {
    color: "#4B7BFF",
    textDecoration: "underline",
    wordBreak: "break-all",
    fontWeight: 500,
  },
};

const DecisionTreeChat: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<ChatHistoryEntry[]>([
    { type: "question", key: "start" },
  ]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showSteps, setShowSteps] = useState(false);
  const [steps, setSteps] = useState<{ step_title: string; answer: string }[]>(
    []
  );
  const chatRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [hasCreatedProcess, setHasCreatedProcess] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(true);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    const fetchData = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const userRes = await axios.get(`${backendUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ id: userRes.data.id });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [history, showSteps]);

  const handleCreateProcessAndSteps = React.useCallback(async () => {
    const handleCreateSteps = async (lastProcessId: string) => {
      const token = await getToken();
      if (!user?.id || !token) return;

      try {
        await Promise.all(
          steps.map((step) =>
            axios.post(
              `${backendUrl}/steps/create`,
              {
                name: step.step_title,
                description: step.answer,
                processId: lastProcessId,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            )
          )
        );
      } catch (error) {
        console.error("Error creating steps:", error);
      }
    };

    const token = await getToken();
    if (!user?.id || !token) return;
    try {
      const response = await axios.post(
        `${backendUrl}/process/create`,
        {
          name: userAnswers.start,
          description: "description",
          status: "PENDING",
          userId: user.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const lastProcessId = response.data.id;
      await handleCreateSteps(lastProcessId);
    } catch (error) {
      console.error("Erreur lors de la création :", error);
    }
  }, [user, userAnswers.start, steps]);

  useEffect(() => {
    if (showSteps && !hasCreatedProcess && steps.length > 0) {
      handleCreateProcessAndSteps();
      setHasCreatedProcess(true);
    }
  }, [showSteps, hasCreatedProcess, steps, handleCreateProcessAndSteps]);

  const handleUserSelectsOption = (nextKey: string, label: string) => {
    setOptionsVisible(false);
    setTimeout(() => {
      const lastQuestionEntry = [...history]
        .reverse()
        .find((e) => e.type === "question");
      const newAnswers = { ...userAnswers };
      if (lastQuestionEntry && "key" in lastQuestionEntry) {
        newAnswers[lastQuestionEntry.key] = label;
      }

      const processAnswersKey = getProcessAnswersKey(nextKey);
      if (processAnswersKey && decisionTreeData[processAnswersKey]) {
        const processAnswers = decisionTreeData[processAnswersKey] as Record<
          string,
          StepNode
        >;
        const filteredSteps = getStepsForProcess(processAnswers, newAnswers);
        setSteps(filteredSteps);
        setUserAnswers(newAnswers);
        setShowSteps(true);
        setHistory([...history, { type: "answer", label }]);
        setOptionsVisible(true);
        return;
      }

      setHistory([
        ...history,
        { type: "answer", label },
        { type: "question", key: nextKey },
      ]);
      setUserAnswers(newAnswers);
      setOptionsVisible(true);
    }, 350);
  };

  const handleRestartChat = () => {
    setHistory([{ type: "question", key: "start" }]);
    setUserAnswers({});
    setShowSteps(false);
    setSteps([]);
    setHasCreatedProcess(false);
    setOptionsVisible(true);
  };

  const lastHistoryEntry = history[history.length - 1];
  let currentOptions: { label: string; next: string }[] = [];
  if (
    lastHistoryEntry &&
    lastHistoryEntry.type === "question" &&
    decisionTreeData[lastHistoryEntry.key] &&
    "options" in decisionTreeData[lastHistoryEntry.key]
  ) {
    currentOptions = (decisionTreeData[lastHistoryEntry.key] as QuestionNode)
      .options;
  }

  return (
    <div style={styles.outer}>
      <Header
        onClose={onClose}
        title={t("processAssistant")}
        icon={<FaRoad />}
      />

      <div style={styles.chatWindow} ref={chatRef}>
        {history.map((entry, index) => {
          const isLast = index === history.length - 1;
          return (
            <div key={index} ref={isLast ? lastMessageRef : undefined}>
              <ChatMessageBubble
                entry={entry}
                index={index}
                decisionTreeData={decisionTreeData}
              />
            </div>
          );
        })}
        {showSteps && (
          <div style={styles.botBubble}>
            <strong>Étapes à suivre :</strong>
            <ul>
              {steps.map((step, idx) => (
                <li key={idx}>
                  <strong>{step.step_title}</strong>
                  <br />
                  {step.answer.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                    part.match(/^https?:\/\/[^\s]+$/) ? (
                      <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.link}
                      >
                        {part}
                      </a>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </li>
              ))}
            </ul>
            <button style={styles.restartBtn} onClick={handleRestartChat}>
              🔁 {t("recommencer")}
            </button>
          </div>
        )}
      </div>
      {!showSteps && currentOptions.length > 0 && (
        <OptionsColumn
          options={currentOptions}
          onOptionSelect={handleUserSelectsOption}
          isVisible={optionsVisible}
        />
      )}
    </div>
  );
};

export default DecisionTreeChat;
