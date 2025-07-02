import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPaperPlane, FaRobot } from "react-icons/fa";
import Header from "../../utils/Header";
import getToken from "../../utils/utils";

const backendUrl = "https://www.docroadmap.fr";

const Chatbot: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "bot" }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const tok = await getToken();
      if (!tok) setError("Token manquant");
      else setToken(tok);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${backendUrl}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const user = await res.json();
        setUserId(user.id);
      } catch (err: any) {
        console.error("Erreur /users/me:", err.message);
      }
    };
    fetchUserInfo();
  }, [token]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token || !userId) return;
      try {
        const res = await fetch(`${backendUrl}/ai/history/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const history = await res.json();
        const formatted = history.map((entry: any) => ({
          text: entry.message,
          sender: entry.sender === "BOT" ? "bot" : "user",
        }));
        setMessages(formatted);
      } catch (err: any) {
        console.error("Erreur /ai/history:", err.message);
      }
    };
    fetchHistory();
  }, [token, userId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!token) return setError("Aucun token trouvé");

    const newMessages = [
      ...messages,
      { text: input, sender: "user" as "user" },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/ai/query`, {
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

      const raw = await res.text();
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}: ${raw}`);
      const data = JSON.parse(raw);
      setMessages((prev) => [
        ...prev,
        { text: data.response || "Réponse vide", sender: "bot" },
      ]);
    } catch (err: any) {
      console.error("Erreur /ai/query:", err.message);
      setMessages((prev) => [
        ...prev,
        { text: t("apiError") || "Erreur API", sender: "bot" },
      ]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <style>
        {`
      .chatbot-container {
        width: 100%;
        height: 100%;
        max-width: none;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .chatbot-header {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 12px;
        border-bottom: 1px solid #ddd;
        background: #f5f5f5;
        height: 60px;
        flex-shrink: 0;
      }
      .chatbot-title-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .chatbot-title {
        color: #000;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
        margin: 0;
      }
      .chatbot-icon {
        font-size: 24px;
        color: #007bff;
      }
      .chatbot-messages {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 16px;
        background-color: rgb(250, 250, 250);
        color: black;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
      }
      .chat-message {
        margin-bottom: 8px;
        max-width: 65%;
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: pre-wrap;
        font-size: 16px;
        border-radius: 8px;
        display: block;
        padding: 10px;
      }
      .user {
        align-self: flex-end;
        background-color: #d9f0ff;
        color: black;
        text-align: left;
        max-width: 65%;
        margin-left: auto;
        margin-right: 25px;
      }
      .bot {
        align-self: flex-start;
        background-color: rgb(234, 223, 167);
        color: black;
        text-align: left;
        max-width: 65%;
        margin-right: auto;
      }
      .chatbot-input {
        display: flex;
        align-items: center;
        color: black;
        background-color: rgb(250, 250, 250);
        border-top: 1px solid #ddd;
        background: #fff;
      }
      .chatbot-input input {
        padding: 10px;
        border: 1px solid #ccc;
        font-size: 16px;
        background-color: rgb(250, 250, 250);
        border-radius: 6px;
        color: black;
        outline: none;
        transition: 0.2s;
        width: 90%;
      }
      .chatbot-input input:focus {
        border-color: #4a76d3;
      }
      .chatbot-input button {
        border: none;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        background: #007bff;
        color: white;
        margin-left: 8px;
        transition: background 0.3s ease;
      }
      .chatbot-input button:hover {
        background: #0056b3;
      }
      .chatbot-input button:disabled {
        background: #aaa;
        color: black;
        cursor: not-allowed;
      }
      .send-button {
        border: none;
        border-radius: 6px;
        font-size: 18px;
        cursor: pointer;
        background: #007bff;
        color: white;
        transition: background 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 16px;
      }
      .send-button:hover {
        background: #0056b3;
      }
      .send-button:disabled {
        background: #aaa;
        cursor: not-allowed;
      }`}
      </style>
      <Header title={t("Donna chatbot")} icon={<FaRobot />} />

      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {error && (
          <div style={{ color: "red", marginTop: 10, textAlign: "center" }}>
            {error}
          </div>
        )}
      </div>

      <div className="chatbot-input">
        <input
          type="text"
          placeholder={t("questionchatbot")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !token}
          className="send-button"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
