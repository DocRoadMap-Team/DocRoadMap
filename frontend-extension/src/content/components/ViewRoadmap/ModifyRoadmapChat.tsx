import axios from "axios";
import React, { useEffect, useState } from "react";
import getToken from "../../utils/utils";

const backendUrl = "https://www.docroadmap.fr";

interface Props {
  processId: number;
  onClose: () => void;
  onRefresh?: () => void;
}

const ModifyRoadmapChat: React.FC<Props> = ({
  processId,
  onClose,
  onRefresh,
}) => {
  const [prompt, setPrompt] = useState("");
  const [question, setQuestion] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      const tok = await getToken();
      if (!tok) setError("Token manquant");
      else setToken(tok);
    };
    fetchToken();
  }, []);

  const handleSubmit = async () => {
    if (!token) {
      setError("Token non disponible");
      return;
    }

    setLoading(true);
    setError(null);
    setQuestion(null);

    try {
      const res = await axios.post(
        `${backendUrl}/ai/roadmap-query`,
        {
          prompt,
          process_id: processId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data;

      if (data.isAsking) {
        setQuestion(data.question || "🤖 J'ai besoin de plus d'informations.");
      } else {
        if (onRefresh) onRefresh();
        onClose();
      }
    } catch (err) {
      setError("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        right: "10px",
        bottom: "10px",
        width: "350px",
        background: "white",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        borderRadius: "8px",
        padding: "1rem",
        zIndex: 9999,
      }}
    >
      <button onClick={onClose} style={{ float: "right", fontSize: "1.2rem" }}>
        ×
      </button>
      <h4>Modify Roadmap (#{processId})</h4>

      <textarea
        rows={4}
        style={{ width: "100%", marginBottom: "0.5rem" }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. I want to add a step for user onboarding"
      />

      <button
        onClick={handleSubmit}
        disabled={!prompt.trim() || loading}
        style={{
          width: "100%",
          padding: "0.5rem",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Envoi..." : "Envoyer"}
      </button>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      {question && (
        <p style={{ marginTop: "1rem", fontStyle: "italic" }}>{question}</p>
      )}
    </div>
  );
};

export default ModifyRoadmapChat;
