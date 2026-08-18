"use client";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface DashboardListToolbarProps {
  inputValue: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  createLabel?: string;
  onCreate?: () => void;
}

export function DashboardListToolbar({
  inputValue,
  onSearchChange,
  placeholder,
  ariaLabel,
  createLabel,
  onCreate,
}: DashboardListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full max-w-md">
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={inputValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="h-11 rounded-none border-border bg-card pl-10"
        />
      </div>
      {createLabel && onCreate && (
        <Button type="button" onClick={onCreate} className="h-11 rounded-none px-5 shrink-0">
          <Plus aria-hidden="true" className="mr-2 size-4" />
          {createLabel}
        </Button>
      )}
    </div>
  );
}
