import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";

export default function ModeToggle({ variant = "navbar" }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Navbar variant: sits on the primary-colored navbar
  // Dashboard variant: sits on the bg-background header
  const trackLight = variant === "navbar"
    ? "bg-white/20 border-white/30"
    : "bg-muted border-border";

  const trackDark = variant === "navbar"
    ? "bg-white/10 border-white/20"
    : "bg-muted border-border";

  const thumbColor = variant === "navbar"
    ? "bg-white"
    : "bg-primary";

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative inline-flex items-center h-7 w-14 rounded-full border
        transition-colors duration-300 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        ${isDark ? trackDark : trackLight}
      `}
    >
      {/* Sun icon — left side */}
      <Sun
        className={`
          absolute left-1.5 h-3.5 w-3.5 transition-opacity duration-300
          ${variant === "navbar" ? "text-white" : "text-amber-500"}
          ${isDark ? "opacity-40" : "opacity-100"}
        `}
      />

      {/* Moon icon — right side */}
      <Moon
        className={`
          absolute right-1.5 h-3.5 w-3.5 transition-opacity duration-300
          ${variant === "navbar" ? "text-white" : "text-indigo-400"}
          ${isDark ? "opacity-100" : "opacity-40"}
        `}
      />

      {/* Sliding thumb */}
      <span
        className={`
          absolute top-0.5 h-6 w-6 rounded-full shadow-md
          transition-transform duration-300 ease-in-out
          ${thumbColor}
          ${isDark ? "translate-x-7" : "translate-x-0.5"}
        `}
      />
    </button>
  );
}
