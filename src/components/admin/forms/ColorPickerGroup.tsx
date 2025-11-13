import ColorPicker from "@/components/shared/ColorPicker";
import type { ReactNode } from "react";

export interface ColorPickerConfig {
  fieldName: string;
  label: string;
  valueProp: string | undefined;
  defaultValue: string;
  helpText: string;
  onChange: (value: string) => void;
}

interface ColorPickerGroupProps {
  configs: ColorPickerConfig[];
}

/**
 * A reusable helper component that renders multiple color pickers from a configuration array.
 * Each config item should specify: label, valueProp, defaultValue, helpText, and onChange handler.
 *
 * @param configs - Array of color picker configurations
 * @returns Fragment containing rendered ColorPicker components
 */
export default function ColorPickerGroup({
  configs,
}: ColorPickerGroupProps): ReactNode {
  return (
    <>
      {configs.map((config) => (
        <ColorPicker
          key={config.fieldName}
          label={config.label}
          value={config.valueProp || config.defaultValue}
          onChange={config.onChange}
          helpText={config.helpText}
        />
      ))}
    </>
  );
}
