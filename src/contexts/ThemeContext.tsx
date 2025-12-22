import React, {
  useEffect,
  useState,
} from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { ThemeContext, type ThemeMode } from "./theme-context";

const { darkAlgorithm, defaultAlgorithm } = antdTheme;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>("light");

  // โหลดค่าจาก localStorage + system preference
  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeMode | null;

    let initial: ThemeMode = "light";
    if (saved) {
      initial = saved;
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      initial = prefersDark ? "dark" : "light";
    }

    setMode(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    setMode((prev) => {
      const next: ThemeMode = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  };

  const algorithm = mode === "dark" ? darkAlgorithm : defaultAlgorithm;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm,
          token: {
            colorPrimary: "#08a4b8",
            borderRadius: 8,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
