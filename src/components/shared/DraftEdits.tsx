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
  const [fields, setFields] = useState<ReadonlySet<string>>(() => new Set());
  const mark = useCallback((id: string, pending: boolean) => {
    setFields((previous) => {
      if (previous.has(id) === pending) return previous;
      const next = new Set(previous);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  const value = useMemo(
    () => ({ pending: fields.size > 0, mark, touch, revision }),
    [fields, mark, touch, revision],
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
