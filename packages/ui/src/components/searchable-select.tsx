"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SearchableSelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange: (value?: string) => void;

  placeholder?: string;
  emptyMessage?: string;
  className?: string;

  showNone?: boolean;
  noneLabel?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option…",
  emptyMessage = "No results found.",
  className,
  showNone = true,
  noneLabel = "None",
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = React.useMemo(() => {
    if (!value) return noneLabel;
    return options.find((o) => o.value === value)?.label ?? placeholder;
  }, [value, options, noneLabel, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            {showNone && (
              <>
                <CommandGroup>
                  <CommandItem
                    value="__none__"
                    onSelect={() => {
                      onValueChange(undefined);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {noneLabel}
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
