"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

type ColorPalettePickerProps = {
  label: string;
  value: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
  helpText?: string;
};

export default function ColorPalettePicker({
  label,
  value,
  onChange,
  maxColors = 5,
  helpText,
}: ColorPalettePickerProps) {
  const [newColor, setNewColor] = useState("#3b82f6");

  const handleAddColor = () => {
    if (value.length >= maxColors) return;
    if (!newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      alert("Please enter a valid hex color (e.g., #3b82f6)");
      return;
    }
    if (!value.includes(newColor)) {
      onChange([...value, newColor]);
    }
  };

  const handleRemoveColor = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...value];
    newColors[index] = color;
    onChange(newColors);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Display existing colors */}
      <div className="space-y-2">
        {value.map((color, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* Color picker */}
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(index, e.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
            />

            {/* Text input */}
            <input
              type="text"
              value={color}
              onChange={(e) => handleColorChange(index, e.target.value)}
              placeholder="#000000"
              className="flex-1 rounded border border-gray-300 px-3 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
              maxLength={7}
              pattern="^#[0-9A-Fa-f]{6}$"
            />

            {/* Preview */}
            <div
              className="h-10 w-10 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: color }}
              title={color}
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={() => handleRemoveColor(index)}
              className="rounded p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Remove color"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new color */}
      {value.length < maxColors && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
          />
          <input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="#3b82f6"
            className="flex-1 rounded border border-gray-300 px-3 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
            maxLength={7}
            pattern="^#[0-9A-Fa-f]{6}$"
          />
          <button
            type="button"
            onClick={handleAddColor}
            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Color
          </button>
        </div>
      )}

      {/* Help text */}
      {helpText && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}

      {/* Color count indicator */}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {value.length} / {maxColors} colors
      </p>
    </div>
  );
}
