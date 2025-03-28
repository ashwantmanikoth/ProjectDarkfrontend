"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Wait until mounted to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-all duration-500 ease-in-out"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-in-out transform ${
            theme === "light" 
              ? "rotate-0 opacity-100 scale-100" 
              : "-rotate-90 opacity-0 scale-0"
          }`}
        />
        <Moon 
          className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-in-out transform ${
            theme === "dark" 
              ? "rotate-0 opacity-100 scale-100" 
              : "rotate-90 opacity-0 scale-0"
          }`}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}