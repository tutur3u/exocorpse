import { useState } from "react";

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (color: string) => void;
  placeholder?: string;
  helpText?: string;
};

export default function ColorPicker({
  label,
  value,
  onChange,
  placeholder = "#000000",
  helpText,
}: ColorPickerProps) {
  const [showPresets, setShowPresets] = useState(false);

  // Common color presets
  const presets = [
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f59e0b" },
    { name: "Yellow", value: "#eab308" },
    { name: "Green", value: "#22c55e" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Purple", value: "#a855f7" },
    { name: "Pink", value: "#ec4899" },
    { name: "Gray", value: "#6b7280" },
    { name: "Dark", value: "#1f2937" },
    { name: "Black", value: "#000000" },
    { name: "White", value: "#ffffff" },
  ];

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        {/* Native color input */}
        <div className="relative flex items-center">
          <input
            type="color"
            value={value || placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
          />
        </div>

        {/* Text input for manual entry */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded border border-gray-300 px-3 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
          maxLength={7}
          pattern="^#[0-9A-Fa-f]{6}$"
        />

        {/* Presets button */}
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {showPresets ? "Hide" : "Presets"}
        </button>
      </div>

      {/* Color preview */}
      {value && (
        <div className="mt-2 flex items-center gap-2">
          <div
            className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Preview
          </span>
        </div>
      )}

      {/* Preset colors */}
      {showPresets && (
        <div className="animate-fadeIn mt-3 grid grid-cols-6 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => {
                onChange(preset.value);
                setShowPresets(false);
              }}
              className="group flex flex-col items-center gap-1"
              title={preset.name}
            >
              <div
                className="h-8 w-8 rounded border-2 border-gray-300 transition-transform hover:scale-110 dark:border-gray-600"
                style={{ backgroundColor: preset.value }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Help text */}
      {helpText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
}
