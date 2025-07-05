import React from "react";

interface HeaderProps {
  title: string;

  icon?: React.ReactNode;
  onClose?: () => void;
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    padding: "10px 16px",
    borderBottom: "1px solid #e0e0e0",
    borderRadius: "8px 8px 0 0",
    fontWeight: "bold",
    fontSize: 18,
    display: "flex",
    gap: 20,
    alignItems: "center",
    background: "royalblue",
    backgroundImage: "linear-gradient(to right, royalblue, #6006A4)",
    color: "white",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
};

const Header: React.FC<HeaderProps> = ({ title, icon, onClose }) => (
  <div style={styles.header}>
    {icon}
    {title}
    {onClose && (
      <button
        style={{
          marginLeft: "auto",
          background: "transparent",
          border: "none",
          color: "white",
          cursor: "pointer",
        }}
      >
        ✕
      </button>
    )}
  </div>
);

export default Header;
