"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useRef,
  type ComponentType,
  type ReactNode,
} from "react";

const DraftEdits = createContext<{
  pending: boolean;
  invalid: boolean;
  reject: (id: string) => void;
  touch: () => void;
  revision: () => number;
  mark: (id: string, pending: boolean) => void;
} | null>(null);

export function useDraftEdits() {
  return useContext(DraftEdits);
}

function DraftEditsProvider({ children }: { children: ReactNode }) {
  const counter = useRef(0);
  const touch = useCallback(() => {
    counter.current += 1;
  }, []);
  const revision = useCallback(() => counter.current, []);
  const [fields, setFields] = useState<
    ReadonlyMap<string, "pending" | "invalid">
  >(() => new Map());
  const mark = useCallback((id: string, pending: boolean) => {
    setFields((previous) => {
      if (previous.has(id) === pending) return previous;
      const next = new Map(previous);
      if (pending) next.set(id, "pending");
      else next.delete(id);
      return next;
    });
  }, []);
  const reject = useCallback((id: string) => {
    setFields((previous) => {
      if (previous.get(id) === "invalid") return previous;
      return new Map(previous).set(id, "invalid");
    });
  }, []);
  const value = useMemo(
    () => ({
      pending: fields.size > 0,
      invalid: [...fields.values()].includes("invalid"),
      mark,
      reject,
      touch,
      revision,
    }),
    [fields, mark, reject, touch, revision],
  );
  return <DraftEdits.Provider value={value}>{children}</DraftEdits.Provider>;
}

export function withDraftEdits<P extends object>(Component: ComponentType<P>) {
  return function DraftScope(props: P) {
    return (
      <DraftEditsProvider>
        <Component {...props} />
      </DraftEditsProvider>
    );
  };
}
