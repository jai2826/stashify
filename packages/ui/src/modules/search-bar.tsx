"use client";

import * as React from "react";
import { Search, X, Command } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  className,
  placeholder = "Search files, folders, tags...",
}: SearchBarProps) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Handle keyboard shortcut (Ctrl/Cmd + K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () =>
      document.removeEventListener("keydown", down);
  }, []);

  // Debounce the search to save API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const clearSearch = () => {
    setQuery("");
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "relative group w-full max-w-sm",
        className
      )}>
      {/* Search Icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />

      <Input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-16 h-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-xl"
      />

      {/* Right-side Utilities */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="h-7 w-7 hover:bg-background rounded-full">
            <X className="h-3 w-3" />
          </Button>
        )}
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </div>
  );
}
