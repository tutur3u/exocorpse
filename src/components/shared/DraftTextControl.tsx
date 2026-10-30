"use client";

import { Input } from "@tuturuuu/ui/input";
import { Textarea } from "@tuturuuu/ui/textarea";
import {
  useCallback,
  useRef,
  useState,
  useEffect,
  useId,
  type ComponentProps,
  type Ref,
} from "react";
import { useDraftEdits } from "./DraftEdits";
import { useDeferredEditorValue } from "@/hooks/useDeferredEditorValue";

type DraftProps = {
  value?: string | number;
  onValueChange?: (value: string) => void;
  commitOnBlur?: boolean;
  unstyled?: boolean;
};

function useControlRef<T>(forwarded: Ref<T> | undefined) {
  const element = useRef<T | null>(null);
  const ref = useCallback(
    (node: T | null) => {
      element.current = node;
      if (typeof forwarded === "function") return forwarded(node);
      if (forwarded) forwarded.current = node;
    },
    [forwarded],
  );
  return { element, ref };
}

function useTextControl<T extends HTMLInputElement | HTMLTextAreaElement>(
  value: string | number | undefined,
  onValueChange: DraftProps["onValueChange"],
  forwarded: Ref<T> | undefined,
) {
  const edits = useDraftEdits();
  const mark = edits?.mark;
  const id = useId();
  useEffect(() => () => mark?.(id, false), [id, mark]);
  const source = value === undefined ? "" : String(value);
  const [draft, setDraft] = useState(source);
  const { element, ref } = useControlRef(forwarded);
  const selection = useRef<{
    start: number;
    end: number;
    direction: "forward" | "backward" | "none";
  } | null>(null);
  const sync = useDeferredEditorValue(
    source,
    (next) => {
      const control = element.current;
      if (
        control?.selectionStart !== null &&
        control?.selectionStart !== undefined
      ) {
        selection.current = {
          start: control.selectionStart,
          end: control.selectionEnd ?? control.selectionStart,
          direction: control.selectionDirection ?? "none",
        };
      }
      setDraft(next);
    },
    (next) => onValueChange?.(next),
  );
  return {
    draft,
    ref,
    sync,
    settled: () => mark?.(id, false),
    change: (next: string, deferred: boolean) => {
      edits?.touch();
      setDraft(next);
      if (!deferred) sync.emit(next);
      else mark?.(id, next !== source);
    },
    focus: () => {
      sync.focus();
      const control = element.current;
      const saved = selection.current;
      selection.current = null;
      if (control && saved && control.selectionStart !== null) {
        control.setSelectionRange(
          Math.min(saved.start, control.value.length),
          Math.min(saved.end, control.value.length),
          saved.direction,
        );
      }
    },
  };
}

type InputProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange"
> &
  DraftProps;
export function DraftInput({
  value,
  onValueChange,
  commitOnBlur,
  unstyled = false,
  ref,
  onBlur,
  onFocus,
  type = "text",
  ...props
}: InputProps) {
  const deferred =
    commitOnBlur ?? ["number", "date", "datetime-local", "time"].includes(type);
  const control = useTextControl(value, onValueChange, ref);
  const Component = unstyled ? "input" : Input;
  return (
    <Component
      {...props}
      ref={control.ref}
      type={type}
      value={control.draft}
      onChange={(event) => control.change(event.target.value, deferred)}
      onFocus={(event) => {
        control.focus();
        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!control.sync.blur() && deferred)
          control.sync.emit(event.target.value);
        control.settled();
        onBlur?.(event);
      }}
    />
  );
}

type TextareaProps = Omit<
  ComponentProps<"textarea">,
  "value" | "defaultValue" | "onChange"
> &
  DraftProps;
export function DraftTextarea({
  value,
  onValueChange,
  commitOnBlur = false,
  unstyled = false,
  ref,
  onBlur,
  onFocus,
  ...props
}: TextareaProps) {
  const control = useTextControl(value, onValueChange, ref);
  const Component = unstyled ? "textarea" : Textarea;
  return (
    <Component
      {...props}
      ref={control.ref}
      value={control.draft}
      onChange={(event) => control.change(event.target.value, commitOnBlur)}
      onFocus={(event) => {
        control.focus();
        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!control.sync.blur() && commitOnBlur)
          control.sync.emit(event.target.value);
        control.settled();
        onBlur?.(event);
      }}
    />
  );
}
