import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import getToken from "../../utils/utils";
import rawData from "./decisionTree.json";

const backendUrl = "https://www.docroadmap.fr";

type DecisionTreeData = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // <-- This allows string indexing
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

const ChatHeader: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <div style={styles.header}>
    🤖 Assistant démarches
    {onClose && (
      <button style={styles.closeBtn} onClick={onClose} aria-label="Fermer">
        ×
      </button>
    )}
  </div>
);

const ChatMessageBubble: React.FC<{
  entry: ChatHistoryEntry;
  index: number;
}> = ({ entry, index }) => {
  if (entry.type === "question") {
    const node = decisionTreeData[entry.key] as QuestionNode | undefined;
    if (node && "question" in node) {
      return (
        <div style={styles.botBubble} key={index}>
          {/* <strong>Bot:</strong>
          <br /> */}
          {node.question}
        </div>
      );
    }
  } else if (entry.type === "answer") {
    return (
      <div style={styles.userBubble} key={index}>
        {entry.label}
      </div>
    );
  }
  return null;
};

const OptionsRow: React.FC<{
  options: { label: string; next: string }[];
  onOptionSelect: (nextKey: string, label: string) => void;
}> = ({ options, onOptionSelect }) => (
  <div style={styles.optionsBar}>
    <div style={styles.optionsScroll}>
      {options.map(({ label, next }, idx) => (
        <button
          key={idx}
          style={styles.optionRow}
          onClick={() => onOptionSelect(next, label)}
          aria-label={`Choisir: ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

function getProcessAnswersKey(processKey: string): string | null {
  if (processKey === "dem_answers") return "dem_answers";
  if (processKey === "aide_logement_answers") return "aide_logement_answers";
  if (processKey === "independance_answers") return "independance_answers";
  if (processKey === "emploi_answers") return "emploi_answers";
  return null;
}

// Helper: get all steps to display for a process, based on user answers
function getStepsForProcess(
  processAnswers: Record<string, StepNode>,
  userAnswers: Record<string, string>,
): { step_title: string; answer: string }[] {
  const steps: { step_title: string; answer: string }[] = [];
  for (const step of Object.values(processAnswers)) {
    // If step depends on a question
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
      // No step_question: always display if answer exists
      const option = step.options[0];
      if (option && option.answer) {
        steps.push({ step_title: step.step_title, answer: option.answer });
      }
    }
  }
  return steps;
}

const DecisionTreeChat: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [history, setHistory] = useState<ChatHistoryEntry[]>([
    { type: "question", key: "start" },
  ]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showSteps, setShowSteps] = useState(false);
  const [steps, setSteps] = useState<{ step_title: string; answer: string }[]>(
    [],
  );
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [hasCreatedProcess, setHasCreatedProcess] = useState(false);

  // const [error, setError] = useState<string | null>(null);
  //const [lastProcessId, setLastProcessId] = useState<string | null>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }

    const fetchData = async () => {
      const token = await getToken();
      if (!token) {
        // setError("Token unavailable");
        return;
      }
      try {
        const userRes = await axios.get(`${backendUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ id: userRes.data.id });
      } catch (err) {
        console.error(err);
        // setError("Failed to fetch user");
      }
    };
    fetchData();
  }, [history, showSteps]);

  const handleCreateProcessAndSteps = React.useCallback(async () => {
    const handleCreateSteps = async (lastProcessId: string) => {
      const token = await getToken();
      if (!user?.id || !token) return;

      try {
        // Send all requests in parallel
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
              },
            ),
          ),
        );
        console.log("All steps created successfully");
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
        },
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
    // save answer to the current question in history
    const lastQuestionEntry = [...history]
      .reverse()
      .find((e) => e.type === "question");
    const newAnswers = { ...userAnswers };
    if (lastQuestionEntry && "key" in lastQuestionEntry) {
      newAnswers[lastQuestionEntry.key] = label;
    }

    // Check if nextKey is a process answers key (like "dem_answers")
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
      return;
    }

    // if nextKey is also a question, continue the flow
    setHistory([
      ...history,
      { type: "answer", label },
      { type: "question", key: nextKey },
    ]);
    setUserAnswers(newAnswers);
  };

  const handleRestartChat = () => {
    setHistory([{ type: "question", key: "start" }]);
    setUserAnswers({});
    setShowSteps(false);
    setSteps([]);
    setHasCreatedProcess(false);
  };

  // get current options
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

  // const displayHistoryInConsole = () => {
  //   console.log("Chat History:", history);
  //   console.log("User Answers:", userAnswers);
  //   console.log("Steps:", steps);
  //   // console.log("Steps:", steps.map((step) => ({
  //   //   title: step.step_title,
  //   //   answer: step.answer,
  //   // })));
  // };

  return (
    <div style={styles.outer}>
      <ChatHeader onClose={onClose} />
      <div style={styles.chatWindow} ref={chatRef}>
        {history.map((entry, index) => (
          <ChatMessageBubble entry={entry} index={index} key={index} />
        ))}
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
                    ),
                  )}
                </li>
              ))}
            </ul>
            {/* <button
              style={styles.restartBtn}
              onClick={() => {
                // displayHistoryInConsole();
              }}
            >
              display history
            </button> */}
            <button style={styles.restartBtn} onClick={handleRestartChat}>
              🔁 Recommencer
            </button>
          </div>
        )}
      </div>
      {!showSteps && currentOptions.length > 0 && (
        <OptionsRow
          options={currentOptions}
          onOptionSelect={handleUserSelectsOption}
        />
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  outer: {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 16px rgba(44,62,80,0.10)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "sans-serif",
    zIndex: 1001,
    color: "#222",
  },
  header: {
    padding: "10px 16px",
    borderBottom: "1px solid #e0e0e0",
    fontWeight: "bold",
    fontSize: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f5f5f5",
    borderRadius: "12px 12px 0 0",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    color: "#888",
  },
  chatWindow: {
    padding: 16,
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  botBubble: {
    background: "#f0f0f0",
    padding: "12px 14px",
    borderRadius: 16,
    alignSelf: "flex-start",
    maxWidth: "80%",
    marginBottom: 4,
    fontSize: 15,
    color: "#222",
  },
  userBubble: {
    background: "#cce4fb",
    padding: "12px 14px",
    borderRadius: 16,
    alignSelf: "flex-end",
    maxWidth: "80%",
    fontSize: 15,
    color: "#222",
    marginBottom: 4,
  },
  optionsBar: {
    borderTop: "1px solid #e0e0e0",
    background: "#fff",
    padding: "10px 0 10px 0",
  },
  optionsScroll: {
    display: "flex",
    flexDirection: "row",
    overflowX: "auto",
    gap: 10,
    paddingLeft: 12,
    paddingRight: 12,
  },
  optionRow: {
    background: "#f5f5f5",
    color: "#222",
    border: "none",
    borderRadius: 20,
    padding: "10px 18px",
    fontSize: 15,
    cursor: "pointer",
    marginBottom: 0,
    whiteSpace: "nowrap",
    transition: "background 0.18s",
  },
  restartBtn: {
    marginTop: 10,
    background: "none",
    border: "none",
    color: "#1976d2",
    fontSize: 15,
    cursor: "pointer",
    textDecoration: "underline",
  },
  link: {
    color: "#1976d2",
    textDecoration: "underline",
    wordBreak: "break-all",
  },
};

export default DecisionTreeChat;
