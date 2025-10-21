"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface MultiSelectProps {
  items: Array<{ id: string; name: string }>;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  variant?: "default" | "form";
}

export function MultiSelect({
  items,
  selectedIds,
  onChange,
  label = "Select items",
  placeholder = "Search or select...",
  helperText,
  required = false,
  variant = "default",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const triggerId = useId();
  const listboxId = useId();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedIds.includes(item.id),
  );

  const isFormVariant = variant === "form";
  const tagClassName = isFormVariant
    ? "inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 transition-all hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
    : "inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary/20";

  const buttonClassName = isFormVariant
    ? "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm transition-all hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:text-white"
    : "w-full rounded-lg border border-input bg-background px-4 py-3 text-left text-sm transition-all hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:hover:border-primary/40";

  const dropdownClassName = isFormVariant
    ? "absolute top-full z-50 mt-2 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
    : "absolute top-full z-50 mt-2 w-full rounded-lg border border-input bg-popover shadow-lg";

  const inputClassName = isFormVariant
    ? "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
    : "w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  const optionClassName = isFormVariant
    ? "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
    : "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-accent";

  const checkboxClassName = isFormVariant
    ? "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-700"
    : "h-4 w-4 rounded border-input accent-primary";

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemoveTag = (id: string) => {
    onChange(selectedIds.filter((selectedId) => selectedId !== id));
  };

  return (
    <div ref={containerRef} className="w-full">
      {label && (
        <label
          id={labelId}
          htmlFor={triggerId}
          className="mb-3 block text-sm font-semibold text-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="space-y-2">
        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <div key={item.id} className={tagClassName}>
                <span>{item.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(item.id)}
                  className="hover:bg-primary/30 focus:ring-primary ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-background"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <button
            type="button"
            id={triggerId}
            aria-labelledby={`${labelId} ${triggerId}`}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            onClick={() => setIsOpen(!isOpen)}
            className={buttonClassName}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsOpen(false);
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className={
                  isFormVariant
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-muted-foreground"
                }
              >
                {selectedItems.length === 0
                  ? placeholder
                  : `${selectedItems.length} selected`}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          {isOpen && (
            <div
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              className={dropdownClassName}
            >
              <div
                className={
                  isFormVariant
                    ? "border-b border-gray-300 p-3 dark:border-gray-600"
                    : "border-input border-b p-3"
                }
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
                {filteredItems.length > 0 ? (
                  <div className="space-y-1 p-2">
                    {filteredItems.map((item) => (
                      <label
                        key={item.id}
                        className={optionClassName}
                        role="option"
                        aria-selected={selectedIds.includes(item.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleToggle(item.id)}
                          className={checkboxClassName}
                        />
                        <span
                          className={
                            isFormVariant
                              ? "text-sm font-medium text-gray-900 dark:text-gray-100"
                              : "text-sm font-medium text-foreground"
                          }
                        >
                          {item.name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div
                    className={
                      isFormVariant
                        ? "px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                        : "text-muted-foreground px-3 py-8 text-center text-sm"
                    }
                  >
                    No items found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {helperText && (
        <p className="text-muted-foreground mt-2 text-xs">{helperText}</p>
      )}
    </div>
  );
}
