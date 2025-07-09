import React from "react";

const PRIMARY_BLUE = "#2253D1";
const HOVER_BLUE = "#1A44B8";

const styles: { [key: string]: React.CSSProperties } = {
  optionsColumnWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: "24px 0",
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
    gap: 16,
    alignItems: "center",
    width: "100%",
  },

  optionColumnBtn: {
    width: "clamp(180px, 40%, 260px)",
    background: PRIMARY_BLUE,
    color: "#fff",
    border: "none",
    padding: "14px 20px",
    borderRadius: "20px",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    cursor: "pointer",
    outline: "none",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease-in-out",
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
          el.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.12)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.background = PRIMARY_BLUE;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
        }}
        onMouseDown={(e) => {
          const el = e.currentTarget;
          el.style.transform = "scale(0.96)";
        }}
        onMouseUp={(e) => {
          const el = e.currentTarget;
          el.style.transform = "scale(1)";
        }}
        onFocus={(e) => {
          const el = e.currentTarget;
          el.style.outline = "3px solid #A8C0FF";
          el.style.outlineOffset = "2px";
        }}
        onBlur={(e) => {
          const el = e.currentTarget;
          el.style.outline = "none";
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
