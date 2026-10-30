"use client";

import { useEffect, useRef } from "react";

/** Local echoes never replace a live draft; external values wait for blur. */
export function useDeferredEditorValue(
  value: string,
  apply: (value: string) => void,
  commit: (value: string) => void,
) {
  const focused = useRef(false);
  const emitted = useRef<string | null>(null);
  const pending = useRef<string | null>(null);
  const received = useRef(value);
  const callbacks = useRef({ apply, commit });
  useEffect(() => {
    callbacks.current = { apply, commit };
  }, [apply, commit]);
  useEffect(() => {
    if (value === received.current) return;
    received.current = value;
    if (value === emitted.current) return;
    if (focused.current) {
      pending.current = value;
    } else {
      pending.current = null;
      emitted.current = null;
      callbacks.current.apply(value);
    }
  }, [value]);

  return {
    focus: () => {
      focused.current = true;
    },
    emit: (next: string) => {
      emitted.current = next;
      callbacks.current.commit(next);
    },
    blur: () => {
      focused.current = false;
      const next = pending.current;
      if (next === null) return false;
      pending.current = null;
      emitted.current = next;
      callbacks.current.apply(next);
      callbacks.current.commit(next);
      return true;
    },
  };
}
