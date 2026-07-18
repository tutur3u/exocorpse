"use client";

import { humanizeField } from "@/components/admin/cms-management/editor-utils";
import type {
  ExocorpseCmsFieldDefinition,
  ExocorpseJson,
} from "@/types/exocorpse-cms";
import { useState } from "react";

type Props = {
  definition: ExocorpseCmsFieldDefinition;
  onChange: (value: ExocorpseJson | undefined) => void;
  value: ExocorpseJson | undefined;
};

const inputClassName =
  "w-full rounded-xl border border-zinc-300/80 bg-white/90 px-3 py-2.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100";

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
      <textarea
        className={`${inputClassName} min-h-32 font-mono text-xs`}
        onBlur={() => {
          try {
            onChange(JSON.parse(text) as ExocorpseJson);
            setError(null);
          } catch {
            setError("Enter a valid JSON value before saving.");
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

export default function CmsFieldEditor({ definition, onChange, value }: Props) {
  if (!definition.is_enabled) return null;
  const label = labelFor(definition);
  const description = definition.description;

  if (definition.field_type === "boolean") {
    return (
      <label className="flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/70 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <input
          checked={value === true}
          className="mt-0.5 h-4 w-4 accent-cyan-600"
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
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
  const isColor =
    /color/i.test(definition.key) && /^#[0-9a-f]{6}$/i.test(stringValue);

  return (
    <label className="block space-y-1.5 text-sm">
      <span className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
        {label}
        {definition.is_required ? (
          <span className="text-rose-500">*</span>
        ) : null}
        {isColor ? (
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 rounded-full border border-black/15"
            style={{ backgroundColor: stringValue }}
          />
        ) : null}
      </span>

      {definition.options.length ? (
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
      ) : definition.field_type === "markdown" ? (
        <textarea
          className={`${inputClassName} min-h-36 leading-6`}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`Write ${label.toLowerCase()} in Markdown…`}
          value={stringValue}
        />
      ) : definition.field_type === "json" ? (
        <JsonInput onChange={onChange} value={value} />
      ) : definition.field_type === "string-array" ? (
        <textarea
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
        <input
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
    </label>
  );
}
