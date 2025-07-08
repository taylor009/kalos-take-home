"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  disabled?: boolean;
  showCount?: boolean;
  totalCount?: number;
  filteredCount?: number;
}

export function SearchBar({
  onSearch,
  placeholder = "Search by customer name...",
  debounceMs = 300,
  className,
  disabled = false,
  showCount = false,
  totalCount = 0,
  filteredCount = 0,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query.trim()); // Trim whitespace for cleaner searches
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }

      // Escape to clear search when input is focused
      if (event.key === "Escape" && isFocused) {
        setQuery("");
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFocused]);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const isSearching = query.trim().length > 0;

  return (
    <div className={className}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className={cn(
              "h-5 w-5 transition-colors duration-200",
              isFocused ? "text-blue-500" : "text-gray-400"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Search Input */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={cn(
            "pl-10 pr-20 transition-all duration-200",
            isFocused && "ring-2 ring-blue-500 ring-opacity-50",
            isSearching && "bg-blue-50"
          )}
        />

        {/* Right side controls */}
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {/* Search count */}
          {showCount && isSearching && (
            <span className="text-xs text-gray-500 font-medium">
              {filteredCount}/{totalCount}
            </span>
          )}

          {/* Clear button */}
          {query && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              title="Clear search (Esc)"
            >
              <svg
                className="h-4 w-4 text-gray-400 hover:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Keyboard shortcut hint */}
          {!isFocused && !query && (
            <div className="text-xs text-gray-400 font-medium">⌘K</div>
          )}
        </div>
      </div>

      {/* Search suggestions/help text */}
      {isFocused && !query && (
        <div className="mt-2 text-xs text-gray-500">
          Start typing to search by customer name. Press Escape to clear.
        </div>
      )}

      {/* Search results info */}
      {isSearching && showCount && (
        <div className="mt-2 text-xs text-gray-600">
          {filteredCount === 0 ? (
            <span className="text-amber-600">
              No transactions found for &quot;{query}&quot;
            </span>
          ) : filteredCount === totalCount ? (
            <span className="text-green-600">
              Showing all {totalCount} transactions
            </span>
          ) : (
            <span>
              Found {filteredCount} of {totalCount} transactions matching &quot;
              {query}&quot;
            </span>
          )}
        </div>
      )}
    </div>
  );
}
