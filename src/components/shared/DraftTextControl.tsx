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
  /** Return false to reject a synchronous commit and retain unsaved work. */
  onValueChange?: (value: string) => void | false;
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
  onValueApplied?: () => void,
) {
  const edits = useDraftEdits();
  const mark = edits?.mark;
  const id = useId();
  const rejected = useRef(false);
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
      rejected.current = false;
      mark?.(id, false);
      onValueApplied?.();
    },
    (next) => onValueChange?.(next),
  );
  const hasChanged = (next: string) => next !== source;
  return {
    hasChanged,
    draft,
    ref,
    sync,
    settled: () => {
      if (rejected.current) onValueApplied?.();
      rejected.current = false;
      mark?.(id, false);
    },
    rejected: () => {
      rejected.current = true;
      edits?.reject(id);
    },
    change: (next: string, deferred: boolean) => {
      edits?.touch();
      setDraft(next);
      if (!deferred) {
        if (sync.emit(next)) {
          rejected.current = false;
          mark?.(id, false);
        } else {
          rejected.current = true;
          edits?.reject(id);
        }
      } else mark?.(id, rejected.current || hasChanged(next));
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
        const result = control.sync.blur();
        const accepted = result.applied
          ? result.accepted
          : !deferred ||
            !control.hasChanged(event.target.value) ||
            control.sync.emit(event.target.value);
        if (accepted) control.settled();
        else control.rejected();
        onBlur?.(event);
      }}
    />
  );
}

type TextareaProps = Omit<
  ComponentProps<"textarea">,
  "value" | "defaultValue" | "onChange"
> &
  DraftProps & { onValueApplied?: () => void };
export function DraftTextarea({
  value,
  onValueChange,
  onValueApplied,
  commitOnBlur = false,
  unstyled = false,
  ref,
  onBlur,
  onFocus,
  ...props
}: TextareaProps) {
  const control = useTextControl(value, onValueChange, ref, onValueApplied);
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
        const result = control.sync.blur();
        const accepted = result.applied
          ? result.accepted
          : !commitOnBlur ||
            !control.hasChanged(event.target.value) ||
            control.sync.emit(event.target.value);
        if (accepted) control.settled();
        else control.rejected();
        onBlur?.(event);
      }}
    />
  );
}
