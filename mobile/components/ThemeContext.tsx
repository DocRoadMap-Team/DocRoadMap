import React, { createContext, useState, useContext, ReactNode } from "react";

export const themes = {
  light: {
    background: "#ffffff",
    text: "#000000",
    primary: "#204CCF",
    buttonText: "#ffffff",
  },
  dark: {
    background: "#121212",
    text: "#ffffff",
    primary: "#204CCF",
    buttonText: "#ffffff",
  },
};

const ThemeContext = createContext({
  theme: themes.light,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(themes.light);

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === themes.light ? themes.dark : themes.light,
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
