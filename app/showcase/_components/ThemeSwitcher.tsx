"use client";

import { useEffect, useState } from "react";
import {
  getStoredTheme,
  setTheme,
  THEMES,
  type Theme,
} from "@/app/shared/theme/theme";
import { Button } from "@/app/shared/ui/Button";
import styles from "../showcase.module.css";

/** Light / Dark / System toggle backed by the shared theme helpers. */
export function ThemeSwitcher() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      setTheme(stored, { persist: false });
      setThemeState(stored);
    }
  }, []);

  return (
    <fieldset className={styles.themeSwitcher}>
      <legend className="sr-only">Theme</legend>
      {THEMES.map((option) => (
        <Button
          key={option}
          size="sm"
          variant={theme === option ? "primary" : "ghost"}
          aria-pressed={theme === option}
          onClick={() => {
            setTheme(option);
            setThemeState(option);
          }}
        >
          {option[0].toUpperCase() + option.slice(1)}
        </Button>
      ))}
    </fieldset>
  );
}
