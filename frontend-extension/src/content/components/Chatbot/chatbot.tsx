import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPaperPlane, FaRobot } from "react-icons/fa";
import Header from "../../utils/Header";

const Chatbot: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "bot" }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_KEY = "API_KEY";

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages: { text: string; sender: "user" | "bot" }[] = [
      ...messages,
      { text: input, sender: "user" },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    setMessages([...newMessages, { text: "", sender: "bot" }]);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: input }],
            stream: true,
          }),
        },
      );

      if (!response.body) throw new Error(t("noServerResponse"));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split("\n")
          .filter((line) => line.startsWith("data:"));

        for (const line of lines) {
          const data = line.replace("data: ", "").trim();
          if (data === "[DONE]") break;

          try {
            const parsedData = JSON.parse(data);
            const text = parsedData.choices?.[0]?.delta?.content || "";
            botMessage += text;

            const currentBotMessage = botMessage;

            setMessages((prev) =>
              prev.map((msg, index) =>
                index === prev.length - 1
                  ? { ...msg, text: currentBotMessage }
                  : msg,
              ),
            );
          } catch (error) {
            console.error("Erreur de parsing JSON :", error);
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la requête OpenAI", error);
      setMessages([...newMessages, { text: t("apiError"), sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <style>{`
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
          background-color:rgb(250, 250, 250);
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
          color: black;
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
          background-color:rgb(234, 223, 167);
          color: black;
          text-align: left;
          max-width: 65%;
          margin-right: auto;
        }
        .chatbot-input {
          display: flex;
          align-items: center;
          color: black;
          background-color:rgb(250, 250, 250);
          border-top: 1px solid #ddd;
          background: #fff;

        }
        .chatbot-input input {
          padding: 10px;
          border: 1px solid #ccc;
          font-size: 16px;
          background-color:rgb(250, 250, 250);
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
        }
      `}</style>
      {/* <div className="chatbot-header">
        <div className="chatbot-title-container">
          <FaRobot className="chatbot-icon" />
          <h1 className="chatbot-title">{t("Donna")}</h1>
        </div>
      </div> */}
      <Header title={t("Donna chatbot")} icon={<FaRobot />} />

      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
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
          disabled={loading}
          className="send-button"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
