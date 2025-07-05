// CalendarStyles.tsx

export const theme = {
  fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
  backgroundColor: "#fff",
  color: "#111",
  accentColor: "#1976d2",
  accentColorDark: "#1565c0",
  borderColor: "#e0e0e0",
  borderRadius: "14px",
  fontWeight: 400,
  shadow: "0 4px 24px rgba(25, 118, 210, 0.10)",
};

export const cardStyle = {
  background: theme.backgroundColor,
  border: `1px solid ${theme.borderColor}`,
  borderRadius: theme.borderRadius,
  boxShadow: theme.shadow,
  padding: "2rem 1.5rem",
  margin: "2rem auto",
  fontFamily: theme.fontFamily,
  color: theme.color,
  maxWidth: 420,
};

export const buttonStyle = {
  background: theme.accentColor,
  color: "#fff",
  border: "none",
  borderRadius: theme.borderRadius,
  padding: "0.5rem 1.2rem",
  fontFamily: theme.fontFamily,
  fontWeight: 500,
  fontSize: "1rem",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(25, 118, 210, 0.08)",
  transition: "background 0.2s",
};

export const titleStyle = {
  fontFamily: theme.fontFamily,
  color: theme.accentColor,
  fontWeight: 700,
  fontSize: "1.35rem",
  marginBottom: "1.2rem",
  letterSpacing: "0.5px",
  textAlign: "center",
};

export const errorStyle = {
  color: "#b71c1c",
  background: "#fff3f3",
  border: "1px solid #ffcdd2",
  borderRadius: "6px",
  padding: "0.5rem",
  marginBottom: "1rem",
  textAlign: "center",
  fontFamily: theme.fontFamily,
  fontSize: "1rem",
  fontWeight: theme.fontWeight,
};

export const calendarContainerStyle = {
  borderRadius: theme.borderRadius,
  overflow: "hidden",
  boxShadow: "0 2px 10px rgba(25, 118, 210, 0.07)",
  background: "#fff",
  margin: "0 auto",
};

export const eventDotStyle = {
  display: "inline-block",
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: theme.accentColor,
  marginLeft: 2,
  verticalAlign: "middle",
};

export const eventTitleStyle = {
  color: theme.accentColor,
  fontWeight: 600,
  fontFamily: theme.fontFamily,
};

export const textStyle = {
  color: theme.color,
  fontFamily: theme.fontFamily,
  fontSize: "1rem",
  fontWeight: theme.fontWeight,
};
