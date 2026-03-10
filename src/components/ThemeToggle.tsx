"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-1.5 rounded-lg btn-glass opacity-50"
        aria-label="Toggle theme"
      >
        <div className="w-3 h-3" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-1.5 rounded-lg btn-glass tr-smooth hover:border-accent/40 group"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun
          size={14}
          className="text-accent group-hover:rotate-45 tr-smooth"
        />
      ) : (
        <Moon
          size={14}
          className="text-accent group-hover:-rotate-12 tr-smooth"
        />
      )}
    </button>
  );
}
