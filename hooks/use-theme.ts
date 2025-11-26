"use client";

import { useThemeContext } from "@/components/providers/theme-provider";

export function useTheme() {
  return useThemeContext();
}
