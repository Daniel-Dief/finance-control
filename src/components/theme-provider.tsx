import { createContext, useCallback, useContext, useMemo } from "react";
import { useTheme } from "@heroui/react";

interface ThemeContextValue {
  theme: string;
  resolvedTheme: string | undefined;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Single source of truth for the app theme using HeroUI's native `useTheme`
 * hook. Calling `useTheme` in a single place (here) avoids two competing theme
 * controllers and keeps every consumer in sync. HeroUI applies the resolved
 * theme as the `.dark`/`.light` class and `data-theme` attribute on `<html>`.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme, setTheme } = useTheme("dark");

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }

  return context;
}
