"use client";

import * as React from "react";
import {
  Check,
  ChevronsUpDown,
  XCircle,
} from "lucide-react";
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

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  showNone?: boolean; // New prop
  noneLabel?: string; // New prop
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  emptyMessage = "No results found.",
  className,
  showNone = true,
  noneLabel = "None ",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Find the selected label, or handle the 'none' state
  const selectedLabel = React.useMemo(() => {
    if (!value || value === "none") return noneLabel;
    return (
      options.find((opt) => opt.value === value)?.label ||
      placeholder
    );
  }, [value, options, noneLabel, placeholder]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            className
          )}>
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            <CommandGroup>
            {showNone && (
              <>
                  <CommandItem
                    value={noneLabel}
                    onSelect={() => {
                      onChange(undefined); // Send undefined back to the form
                      setOpen(false);
                    }}>
                    {/* <XCircle className="mr-2 h-4 w-4 opacity-50" /> */}
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !value || value === "none"
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span>{noneLabel}</span>
                  </CommandItem>
                {/* </CommandGroup> */}
              </>
            )}

            {/* <CommandGroup> */}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}>
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
