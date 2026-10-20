import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "azlink-theme";
const THEME_EVENT = "azlink:theme";

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    /* Səhifədəki başqa düymələr (məs. ana səhifə və naviqasiya) eyni qalsın */
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
  }, [theme]);

  useEffect(() => {
    const handleChange = (event: Event) => {
      const next = (event as CustomEvent<Theme>).detail;
      setTheme((current) => (current === next ? current : next));
    };

    window.addEventListener(THEME_EVENT, handleChange);
    return () => window.removeEventListener(THEME_EVENT, handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
  };
}