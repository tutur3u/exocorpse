"use client";

import { useEffect, useRef } from "react";

type BlurResult = { applied: false } | { applied: true; accepted: boolean };

/** Local echoes never replace a live draft; external values wait for blur. */
export function useDeferredEditorValue(
  value: string,
  apply: (value: string) => void,
  commit: (value: string) => void | false,
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
      const previous = emitted.current;
      emitted.current = next;
      const accepted = callbacks.current.commit(next) !== false;
      if (!accepted) emitted.current = previous;
      return accepted;
    },
    blur: (): BlurResult => {
      focused.current = false;
      const next = pending.current;
      if (next === null) return { applied: false };
      pending.current = null;
      const previous = emitted.current;
      emitted.current = next;
      callbacks.current.apply(next);
      const accepted = callbacks.current.commit(next) !== false;
      if (!accepted) emitted.current = previous;
      return { applied: true, accepted };
    },
  };
}
