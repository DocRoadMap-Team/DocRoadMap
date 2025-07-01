/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

type ChatHistoryEntry =
  | { type: "question"; key: string }
  | { type: "answer"; label: string };

interface ChatMessageBubbleProps {
  entry: ChatHistoryEntry;
  index: number;
  decisionTreeData: any;
}

const styles: { [key: string]: React.CSSProperties } = {
  messageContainer: {
    display: "flex",
    alignItems: "flex-end",
    marginBottom: 16,
    gap: 8,
  },
  botMessageContainer: {
    justifyContent: "flex-start",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  botBubble: {
    background: "#E8F4F8",
    padding: "12px 16px",
    borderRadius: "18px 18px 18px 4px",
    maxWidth: "70%",
    fontSize: 14,
    color: "#2C3E50",
    fontWeight: 400,
    lineHeight: 1.4,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(64, 224, 208, 0.2)",
  },
  userBubble: {
    background: "royalblue",
    padding: "12px 16px",
    borderRadius: "18px 18px 4px 18px",
    maxWidth: "70%",
    fontSize: 14,
    color: "#fff",
    fontWeight: 500,
    lineHeight: 1.4,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
  },
};

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  entry,
  index,
  decisionTreeData,
}) => {
  if (entry.type === "question") {
    const node = decisionTreeData[entry.key];
    if (node && "question" in node) {
      return (
        <div 
          style={{
            ...styles.messageContainer,
            ...styles.botMessageContainer,
          }} 
          key={index}
        >
          <div style={styles.botBubble}>
            {node.question}
          </div>
        </div>
      );
    }
  } 
  else if (entry.type === "answer") {
    return (
      <div 
        style={{
          ...styles.messageContainer,
          ...styles.userMessageContainer,
        }} 
        key={index}
      >
        <div style={styles.userBubble}>
          {entry.label}
        </div>
      </div>
    );
  }
  return null;
};

export default ChatMessageBubble;
