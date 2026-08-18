"use client";

import { forwardRef, useState, type ButtonHTMLAttributes } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface EntityComboboxOption {
  value: string;
  label: string;
  description?: string;
  details?: Array<{ label?: string; value: string }>;
}

export interface EntityComboboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type" | "value"> {
  value: string;
  onValueChange: (value: string) => void;
  options: EntityComboboxOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  disabled?: boolean;
}

export const EntityCombobox = forwardRef<HTMLButtonElement, EntityComboboxProps>(
  function EntityCombobox(
    {
      value,
      onValueChange,
      options,
      placeholder,
      searchPlaceholder,
      emptyMessage,
      disabled = false,
      className,
      ...triggerProps
    },
    ref,
  ) {
    const [open, setOpen] = useState(false);
    const selected = options.find((option) => option.value === value);

    return (
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              {...triggerProps}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "h-11 min-w-0 flex-1 justify-between rounded-none border-input bg-background px-3 font-normal",
                className,
              )}
            >
              <span className={cn("truncate", !selected && "text-muted-foreground")}>
                {selected?.label ?? placeholder}
              </span>
              <ChevronsUpDown aria-hidden="true" className="size-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] rounded-none p-0"
          >
            <Command>
              <CommandInput placeholder={searchPlaceholder} />
              <CommandList>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.description ?? ""}`}
                      onSelect={() => {
                        onValueChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{option.label}</span>
                        {option.details?.map((detail, index) => (
                          <span
                            key={`${detail.label ?? "detail"}-${index}`}
                            className="mt-0.5 flex min-w-0 gap-2 truncate text-xs text-muted-foreground"
                          >
                            {detail.label && (
                              <span className="shrink-0 font-semibold uppercase tracking-wide text-foreground">
                                {detail.label}
                              </span>
                            )}
                            <span className="truncate">{detail.value}</span>
                          </span>
                        ))}
                        {!option.details?.length && option.description && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </span>
                      <Check
                        aria-hidden="true"
                        className={cn(
                          "ml-auto size-4",
                          value === option.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

EntityCombobox.displayName = "EntityCombobox";
