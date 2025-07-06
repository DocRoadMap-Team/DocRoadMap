import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPaperPlane, FaRobot } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
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
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
      } catch (err: any) {
        console.error("Erreur /users/me:", err.message);
      }
    };
    fetchUserInfo();
  }, [token]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${backendUrl}/ai-history/donna`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const history = await res.json();
        const formatted = history.flatMap((entry: any) => [
          { text: entry.message, sender: "user" },
          { text: entry.response, sender: "bot" },
        ]);
        setMessages(formatted);
      } catch (err: any) {
        console.error("Erreur /ai-history/donna:", err.message);
      }
    };

    if (token) fetchHistory();
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      <style>{`
        .chatbot-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #f9f9fb;
          font-family: 'Segoe UI', sans-serif;
        }

        .chatbot-header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: linear-gradient(90deg, #4e54c8, #8f94fb);
          color: white;
          font-size: 18px;
          font-weight: bold;
          border-bottom: 1px solid #ddd;
        }
          .chat-message.bot p,
          .chat-message.bot ul,
          .chat-message.bot ol,
          .chat-message.bot li {
            margin: 0;
            padding: 0;
          }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px 80px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .chatbot-messages::-webkit-scrollbar {
          display: none;
        }

        .chat-message {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 15px;
          line-height: 1.4;
          word-break: break-word;
          white-space: pre-wrap;
        }

        .chat-message.user {
          align-self: flex-end;
          background: #dcf2ff;
          color: #000;
          border-bottom-right-radius: 4px;
        }

        .chat-message.bot {
          align-self: flex-start;
          background: #f4eeba;
          color: #000;
          border-bottom-left-radius: 4px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 10px 12px;
          border-radius: 16px;
          background: #f4eeba;
          width: fit-content;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background-color: #333;
          border-radius: 50%;
          opacity: 0.4;
          animation: blink 1.4s infinite ease-in-out both;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes blink {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.9);
          }
          40% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .chatbot-input {
          position: fixed;
          bottom: 12px;
          left: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 12px;
          display: flex;
          align-items: center;
          border: 1px solid rgba(220, 220, 220, 0.6);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          z-index: 10;
        }

        .chatbot-input input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          padding: 10px;
          border-radius: 8px;
          background-color: #f0f2f5;
          margin-right: 10px;
          color: black;
        }

        .chatbot-input input::placeholder {
          color: black;
          opacity: 1;
        }

        .send-button {
          background: #4e54c8;
          color: white;
          padding: 10px 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-button:hover {
          background: #3c40a2;
        }

        .send-button:disabled {
          background: #aaa;
          cursor: not-allowed;
        }
      `}</style>

      <Header title={t("Donna chatbot")} icon={<FaRobot />} />

      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.sender === "bot" ? (
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            ) : (
              msg.text
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-message bot typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        {error && (
          <div style={{ color: "red", marginTop: 10, textAlign: "center" }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
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
