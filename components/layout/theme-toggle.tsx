"use client";

import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/70 text-sm font-semibold text-[var(--color-foreground)] transition hover:bg-white"
    >
      <span aria-hidden suppressHydrationWarning>
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
