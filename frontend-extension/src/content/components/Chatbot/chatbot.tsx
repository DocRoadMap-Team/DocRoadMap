import { useEffect, useState } from "react";
import { FaPaperPlane, FaRobot } from "react-icons/fa";
import getToken from "../../utils/utils";

const backendUrl = "https://www.docroadmap.fr";

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "bot" }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const tok = await getToken();
      if (!tok) setError("Token manquant");
      else setToken(tok);
    };
    fetchToken();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!token) {
      setError("Aucun token trouvé");
      return;
    }

    const newMessages: { text: string; sender: "user" | "bot" }[] = [
      ...messages,
      { text: input, sender: "user" },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/ai/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: input,
          model: "gpt-4o-mini",
        }),
      });

      const rawResponse = await response.text();
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${rawResponse}`);
      }
      const data = JSON.parse(rawResponse);
      setMessages((prev) => [
        ...prev,
        { text: data.response || "Réponse vide", sender: "bot" },
      ]);
    } catch (err: any) {
      const errorMessage = err?.message || "Erreur inconnue";
      console.error("Error /ai/query:", errorMessage);
      setMessages((prev) => [
        ...prev,
        { text: "Erreur lors de la requête à l'API.", sender: "bot" },
      ]);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FaRobot style={{ marginRight: 8 }} />
        <span>Assistant IA</span>
      </div>

      <div style={styles.messages}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "user" ? "#d9f0ff" : "#f0f0f0",
            }}
          >
            {msg.text}
          </div>
        ))}
        {error && (
          <div style={{ color: "red", padding: "8px", textAlign: "center" }}>
            {error}
          </div>
        )}
      </div>

      <div style={styles.inputRow}>
        <input
          type="text"
          placeholder="Pose ta question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={styles.input}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !token}
          style={styles.button}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    borderRadius: 8,
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    backgroundColor: "#f5f5f5",
    padding: "12px 16px",
    fontWeight: "bold",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #ddd",
  },
  messages: {
    flex: 1,
    padding: 16,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "#fff",
  },
  message: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: 12,
    fontSize: 15,
  },
  inputRow: {
    display: "flex",
    borderTop: "1px solid #ddd",
    padding: 12,
    background: "#fafafa",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 15,
    outline: "none",
  },
  button: {
    marginLeft: 8,
    backgroundColor: "#007bff",
    border: "none",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default Chatbot;
