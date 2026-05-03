import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const STORAGE_KEY = "asper-theme";

const readStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const persistTheme = (theme: Theme) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable (private mode, quota) — in-memory state still drives the UI
  }
};

type ThemeToggleProps = {
  className?: string;
  floating?: boolean;
};

export const ThemeToggle = ({ className, floating = false }: ThemeToggleProps) => {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  // Only apply the theme to the DOM here; persistence happens on user toggle
  // so that the system preference isn't cemented as a manual override on mount.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = () =>
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      persistTheme(next);
      return next;
    });

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  const floatingClasses =
    "fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full bg-polished-white/90 dark:bg-burgundy/90 border border-polished-gold/30 shadow-md backdrop-blur flex items-center justify-center hover:scale-105 transition-transform";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className={cn(
        floating
          ? floatingClasses
          : "p-2 transition-colors text-burgundy hover:text-polished-gold dark:text-polished-gold dark:hover:text-polished-white",
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-polished-gold" />
      ) : (
        <Moon className="h-5 w-5 text-burgundy" />
      )}
    </button>
  );
};

export default ThemeToggle;
