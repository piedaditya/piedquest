import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeId = "dark" | "light" | "blue" | "pinko" | "neon";

export const THEMES: { id: ThemeId; label: string; emoji: string; swatch: string }[] = [
  { id: "dark", label: "Dark", emoji: "🌑", swatch: "linear-gradient(135deg,#1b1430,#c8ff3d)" },
  { id: "light", label: "Light", emoji: "☀️", swatch: "linear-gradient(135deg,#ffffff,#7c3aed)" },
  { id: "blue", label: "Cloud", emoji: "☁️", swatch: "linear-gradient(135deg,#0b1f3a,#6ec1ff)" },
  { id: "pinko", label: "Petals", emoji: "🌸", swatch: "linear-gradient(135deg,#2a1024,#ff86c8)" },
  { id: "neon", label: "Neon", emoji: "⚡", swatch: "linear-gradient(135deg,#05030f,#00f0ff)" },
];

export const THEME_STORAGE_KEY = "piedquest_theme_v1";
const CLASSES = THEMES.map((t) => `theme-${t.id}`);

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove(...CLASSES);
  root.classList.add(`theme-${id}`);
  root.style.colorScheme = id === "light" ? "light" : "dark";
  root.dataset["theme"] = id;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("dark");

  // Hydration-safe: the inline boot script already painted the stored theme.
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (stored && CLASSES.includes(`theme-${stored}`)) {
      setThemeState(stored);
      applyTheme(stored);
    } else {
      applyTheme("dark");
    }
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
    applyTheme(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      /* storage disabled — theme still applies for this session */
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
