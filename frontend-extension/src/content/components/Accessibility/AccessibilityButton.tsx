import React from "react";

const PRIMARY_BLUE = "#2253D1";
const HOVER_BLUE = "#1A44B8";

const styles: { [key: string]: React.CSSProperties } = {
  optionsColumnWrapper: {
    display: "flex",
    width: "100%",
    padding: "20px 0 16px 0",
    minHeight: "20%",
    maxHeight: "50%",
    borderTop: "1px solid #e0e0e0",
    background: "#fff",
    overflowY: "auto",
    scrollbarWidth: "thin",
  },

  optionsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    alignItems: "center",
    width: "100%",
  },

  optionColumnBtn: {
    width: 240,
    background: PRIMARY_BLUE,
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "18px 4px 18px 4px",
    maxWidth: "70%",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    outline: "none",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.08)",
    transition:
      "background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
  } as React.CSSProperties,
};

type AccessibilityButtonProps = {
  labelF: string;
  labelS: string;
  onClick: () => void;
  enabled: boolean;
};

const AccessibilityButton: React.FC<AccessibilityButtonProps> = ({
  onClick,
  labelF,
  labelS,
  enabled,
}) => (
  <div
    style={{
      ...styles.optionsColumnWrapper,
      transition: "opacity 0.35s cubic-bezier(.4,0,.2,1)",
    }}
    aria-live="polite"
  >
    <div style={styles.optionsColumn}>
      <button
        style={styles.optionColumnBtn}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.background = HOVER_BLUE;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 6px 10px rgba(0, 0, 0, 0.12)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.background = PRIMARY_BLUE;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.08)";
        }}
        onMouseDown={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(1px)";
          el.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.08)";
        }}
        onMouseUp={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 6px 10px rgba(0, 0, 0, 0.12)";
        }}
        onClick={onClick}
        aria-label={`Accessibility action: ${enabled ? labelF : labelS}`}
        aria-pressed={enabled}
      >
        {enabled ? labelF : labelS}
      </button>
    </div>
  </div>
);

export default AccessibilityButton;
