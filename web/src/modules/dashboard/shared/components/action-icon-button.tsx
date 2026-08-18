"use client";

import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ActionIconButtonProps
  extends Omit<ComponentProps<typeof Button>, "children" | "size"> {
  label: string;
  icon: ReactNode;
}

export function ActionIconButton({
  label,
  icon,
  className,
  ...props
}: ActionIconButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className={cn("rounded-none", className)}
            {...props}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="border border-border bg-popover text-popover-foreground shadow-md">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
