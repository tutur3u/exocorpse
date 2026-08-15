"use client";

import AdminMarkdownEditor from "@/components/admin/AdminMarkdownEditor";
import { humanizeField } from "@/components/admin/cms-management/editor-utils";
import type {
  ExocorpseCmsFieldDefinition,
  ExocorpseJson,
} from "@/types/exocorpse-cms";
import { Button } from "@tuturuuu/ui/button";
import { Checkbox } from "@tuturuuu/ui/checkbox";
import { Input } from "@tuturuuu/ui/input";
import { Textarea } from "@tuturuuu/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
  definition: ExocorpseCmsFieldDefinition;
  onChange: (value: ExocorpseJson | undefined) => void;
  onImageUpload?: (file: File) => Promise<string>;
  value: ExocorpseJson | undefined;
};

const inputClassName =
  "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

const spaciousFieldKeys = new Set([
  "abilities",
  "distinguishingFeatures",
  "fanworkPolicy",
  "personalitySummary",
]);

const multilineFieldKeys = new Set([...spaciousFieldKeys, "notes", "quote"]);

const isHexColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

function ColorPaletteInput({
  onChange,
  value,
}: {
  onChange: Props["onChange"];
  value: ExocorpseJson | undefined;
}) {
  const colors = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
  const updateColor = (index: number, next: string) =>
    onChange(
      colors.map((color, position) => (position === index ? next : color)),
    );

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-900/40">
      {colors.length ? (
        <div
          className="flex flex-wrap gap-2"
          aria-label="Color palette preview"
        >
          {colors.map((color, index) => (
            <span
              className="h-8 w-8 rounded-lg border border-black/15 shadow-sm"
              key={`${color}-${index}`}
              style={{
                backgroundColor: isHexColor(color) ? color : "transparent",
              }}
              title={color}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500">
          Add the first color in this palette.
        </p>
      )}
      <div className="space-y-2">
        {colors.map((color, index) => (
          <div className="flex items-center gap-2" key={index}>
            <Input
              aria-label={`Choose palette color ${index + 1}`}
              className="h-10 w-12 shrink-0 cursor-pointer p-1"
              onChange={(event) => updateColor(index, event.target.value)}
              type="color"
              value={isHexColor(color) ? color : "#000000"}
            />
            <Input
              aria-label={`Palette color ${index + 1}`}
              className={inputClassName}
              onChange={(event) => updateColor(index, event.target.value)}
              placeholder="#000000"
              value={color}
            />
            <Button
              aria-label={`Remove palette color ${index + 1}`}
              onClick={() =>
                onChange(colors.filter((_, position) => position !== index))
              }
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        onClick={() => onChange([...colors, "#000000"])}
        size="sm"
        type="button"
        variant="outline"
      >
        <Plus className="h-4 w-4" />
        Add color
      </Button>
    </div>
  );
}

function labelFor(definition: ExocorpseCmsFieldDefinition) {
  return definition.label && definition.label !== definition.key
    ? definition.label
    : humanizeField(definition.key);
}

function JsonInput({
  onChange,
  value,
}: {
  onChange: Props["onChange"];
  value: ExocorpseJson | undefined;
}) {
  const [text, setText] = useState(() => JSON.stringify(value ?? {}, null, 2));
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Textarea
        className={`${inputClassName} min-h-32 font-mono text-xs`}
        onBlur={() => {
          try {
            onChange(JSON.parse(text) as ExocorpseJson);
            setError(null);
          } catch {
            setError("Please review the value in this field.");
          }
        }}
        onChange={(event) => setText(event.target.value)}
        spellCheck={false}
        value={text}
      />
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </>
  );
}

export default function CmsFieldEditor({
  definition,
  onChange,
  onImageUpload,
  value,
}: Props) {
  if (!definition.is_enabled) return null;
  const label = labelFor(definition);
  const description = definition.description;

  if (definition.field_type === "boolean") {
    return (
      <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-900/50">
        <Checkbox
          checked={value === true}
          className="mt-0.5"
          onCheckedChange={(checked) => onChange(checked === true)}
        />
        <span>
          <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {label}
            {definition.is_required ? " *" : ""}
          </span>
          {description ? (
            <span className="mt-1 block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {description}
            </span>
          ) : null}
        </span>
      </label>
    );
  }

  const stringValue =
    typeof value === "string" || typeof value === "number" ? String(value) : "";
  const isColorField =
    definition.field_type === "string" &&
    /colou?r/i.test(`${definition.key} ${definition.label ?? ""}`);
  const isColorPalette =
    definition.field_type === "string-array" &&
    /colou?r.*palette|palette.*colou?r/i.test(
      `${definition.key} ${definition.label ?? ""}`,
    );
  const isMultiline =
    definition.field_type === "markdown" ||
    multilineFieldKeys.has(definition.key);

  const Wrapper =
    isMultiline || isColorField || isColorPalette ? "div" : "label";

  return (
    <Wrapper className="block w-full min-w-0 space-y-1.5 text-sm">
      <span className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
        {label}
        {definition.is_required ? (
          <span className="text-rose-500">*</span>
        ) : null}
        {isColorField && isHexColor(stringValue) ? (
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 rounded-full border border-black/15"
            style={{ backgroundColor: stringValue }}
          />
        ) : null}
      </span>

      {isColorPalette ? (
        <ColorPaletteInput onChange={onChange} value={value} />
      ) : definition.options.length ? (
        <select
          className={inputClassName}
          onChange={(event) => onChange(event.target.value || undefined)}
          value={stringValue}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {definition.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : isMultiline ? (
        <AdminMarkdownEditor
          minHeight={spaciousFieldKeys.has(definition.key) ? "18rem" : "11rem"}
          onChange={onChange}
          onImageUpload={onImageUpload}
          placeholder={`Write ${label.toLowerCase()}…`}
          value={stringValue}
        />
      ) : isColorField ? (
        <div className="flex items-center gap-2">
          <Input
            aria-label={`Choose ${label.toLowerCase()}`}
            className="h-10 w-12 shrink-0 cursor-pointer p-1"
            onChange={(event) => onChange(event.target.value)}
            type="color"
            value={isHexColor(stringValue) ? stringValue : "#000000"}
          />
          <Input
            className={inputClassName}
            onChange={(event) => onChange(event.target.value || undefined)}
            placeholder="#000000"
            value={stringValue}
          />
        </div>
      ) : definition.field_type === "json" ? (
        <JsonInput onChange={onChange} value={value} />
      ) : definition.field_type === "string-array" ? (
        <Textarea
          className={`${inputClassName} min-h-24`}
          onChange={(event) =>
            onChange(
              event.target.value
                .split(/[\n,]/)
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
          placeholder="One value per line"
          value={Array.isArray(value) ? value.join("\n") : ""}
        />
      ) : (
        <Input
          className={inputClassName}
          onChange={(event) => {
            const next = event.target.value;
            if (definition.field_type === "number") {
              onChange(next === "" ? undefined : Number(next));
              return;
            }
            if (definition.field_type === "datetime") {
              onChange(next ? new Date(next).toISOString() : undefined);
              return;
            }
            onChange(next || undefined);
          }}
          type={
            definition.field_type === "number"
              ? "number"
              : definition.field_type === "date"
                ? "date"
                : definition.field_type === "datetime"
                  ? "datetime-local"
                  : "text"
          }
          value={
            definition.field_type === "datetime" && stringValue
              ? stringValue.slice(0, 16)
              : stringValue
          }
        />
      )}

      {description ? (
        <span className="block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {description}
        </span>
      ) : null}
    </Wrapper>
  );
}
