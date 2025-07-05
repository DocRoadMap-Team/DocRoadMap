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
    fontWeight: "bold",
    fontSize: 18,
    display: "flex",
    gap: 20,
    alignItems: "center",
    background: "royalblue",
    backgroundImage: "linear-gradient(to right, royalblue, rgb(96, 6, 164))",
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
