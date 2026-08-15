"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      onClick={toggleTheme}
      aria-label="Alternar tema claro e escuro"
      aria-pressed={resolvedTheme === "dark"}
      title="Alternar tema"
      className="relative size-10 rounded-none border-orange-200 bg-white text-orange-700 shadow-none hover:bg-orange-50 dark:border-orange-800 dark:bg-zinc-950 dark:text-orange-300 dark:hover:bg-orange-950"
    >
      <Sun aria-hidden="true" className="hidden size-4 dark:block" />
      <Moon aria-hidden="true" className="size-4 dark:hidden" />
    </Button>
  );
}
