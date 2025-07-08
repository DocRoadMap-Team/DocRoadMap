import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPaperPlane } from "react-icons/fa";
import { closeModifyChat } from "../../InjectedComponent";
import getToken from "../../utils/utils";

const backendUrl = "https://www.docroadmap.fr";

interface Props {
  processId: number;
  onClose: () => void;
  onRefresh?: () => void;
}

interface MessagePair {
  message: string;
  response: string;
}

const ModifyRoadmapChat: React.FC<Props> = ({
  processId,
  onClose,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<MessagePair[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTokenAndHistory = async () => {
      const tok = await getToken();
      if (!tok) {
        setError("Token manquant");
        return;
      }
      setToken(tok);

      try {
        const res = await axios.get(
          `${backendUrl}/ai-history/roadmap/${processId}`,
          {
            headers: { Authorization: `Bearer ${tok}` },
          },
        );
        const parsed = res.data.map((item: any) => {
          let responseText = "Votre étape a bien été ajoutée à votre roadmap.";

          try {
            const parsedResponse = JSON.parse(item.response);
            responseText =
              parsedResponse.question ||
              "Votre étape a bien été ajoutée à votre roadmap.";
          } catch {
            if (typeof item.response === "string") {
              responseText = item.response;
            }
          }

          return {
            message: item.message,
            response: responseText,
          };
        });

        setHistory(parsed);
      } catch (err) {
        setError("Erreur chargement historique");
      }
    };

    fetchTokenAndHistory();
  }, [processId]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history, loading]);

  const handleSubmit = async () => {
    if (!token || !prompt.trim()) return;

    setError(null);
    const userMessage = prompt.trim();
    setPrompt("");

    setHistory((prev) => [...prev, { message: userMessage, response: "" }]);
    setLoading(true);

    try {
      const res = await axios.post(
        `${backendUrl}/ai/roadmap-query`,
        { prompt: userMessage, process_id: processId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      let botResponse = "";

      if (res.data?.question) {
        botResponse = res.data.question;
      } else if (res.data?.roadmap) {
        botResponse = "Votre étape a bien été ajoutée à votre roadmap.";

        if (onRefresh) onRefresh();
        setTimeout(() => {
          closeModifyChat();
        }, 1000);
      } else {
        botResponse = "Aucune réponse";
      }

      setHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].response = botResponse;
        return updated;
      });
    } catch (err) {
      console.error("Erreur API :", err);
      setError("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#f9f9fb",
      }}
    >
      <div
        style={{
          background: "#007bff",
          padding: "0.5rem",
          color: "white",
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <span>{t("updateRoadmap", { id: processId })}</span>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            color: "white",
            cursor: "pointer",
            lineHeight: "1",
            padding: 0,
          }}
          aria-label="Fermer"
        >
          &times;
        </button>
      </div>

      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          padding: "0.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {history.map((pair, idx) => (
          <React.Fragment key={idx}>
            <div
              style={{
                alignSelf: "flex-end",
                background: "#90c9f5",
                color: "#000",
                padding: "10px 10px",
                borderRadius: "16px",
                maxWidth: "75%",
              }}
            >
              {pair.message}
            </div>

            {pair.response && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#d4c562",
                  color: "#000",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  maxWidth: "75%",
                }}
              >
                {pair.response}
              </div>
            )}
          </React.Fragment>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              background: "#f4eeba",
              padding: "10px 12px",
              borderRadius: "16px",
              display: "flex",
              gap: "4px",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                backgroundColor: "#333",
                borderRadius: "50%",
                animation: "blink 1.4s infinite ease-in-out both",
              }}
            ></span>
            <span
              style={{
                width: 8,
                height: 8,
                backgroundColor: "#333",
                borderRadius: "50%",
                animation: "blink 1.4s infinite ease-in-out both",
                animationDelay: "0.2s",
              }}
            ></span>
            <span
              style={{
                width: 8,
                height: 8,
                backgroundColor: "#333",
                borderRadius: "50%",
                animation: "blink 1.4s infinite ease-in-out both",
                animationDelay: "0.4s",
              }}
            ></span>
          </div>
        )}
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>
      <div
        style={{
          display: "flex",
          padding: "8px",
          borderTop: "1px solid #ccc",
          background: "#fff",
          alignItems: "center",
          marginBottom: "-6px",
        }}
      >
        <input
          type="text"
          placeholder="Commencer à éditer..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{
            flex: 1,
            fontSize: 16,
            padding: "10px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#f0f2f5",
            marginRight: 10,
            color: "#000",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !prompt.trim()}
          style={{
            background: "#007bff",
            color: "white",
            padding: "10px 10px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ModifyRoadmapChat;
