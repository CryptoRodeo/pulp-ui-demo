import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Patternfly uses this class for setting dark mode.
// It follows this format: pf-[version]-theme-dark
// docs: https://www.patternfly.org/developer-resources/dark-theme-handbook/
const DARK_MODE_KEY = "pf-v6-theme-dark";
// LocalStorage key for storing theme preference
export const STORAGE_KEY = "theme-preference";

export const THEME_MODES = {
  SYSTEM: "system",
  LIGHT: "light",
  DARK: "dark",
} as const;

export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES];

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

interface DarkModeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined,
);

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && Object.values(THEME_MODES).includes(stored as ThemeMode)) {
      return stored as ThemeMode;
    }
    return THEME_MODES.SYSTEM;
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
    getSystemTheme,
  );

  const isDark =
    mode === THEME_MODES.DARK ||
    (mode === THEME_MODES.SYSTEM && systemTheme === "dark");

  useEffect(() => {
    const htmlElement = document.documentElement;
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    if (isDark) {
      htmlElement.classList.add(DARK_MODE_KEY);
      themeMeta?.setAttribute("content", "#000000");
    } else {
      htmlElement.classList.remove(DARK_MODE_KEY);
      themeMeta?.setAttribute("content", "#ffffff");
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setSystemTheme(getSystemTheme());
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const value = { mode, setMode, isDark };

  return (
    <DarkModeContext.Provider value={value}>
      {" "}
      {children}{" "}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return { mode: context.mode, setMode: context.setMode, modes: THEME_MODES };
};

export const useIsDarkMode = (): boolean => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useIsDarkMode must be used within DarkModeProvider");
  }
  return context.isDark;
};
