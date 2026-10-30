import { afterEach, expect, test } from "bun:test";
import { act, useEffect, useState } from "react";
import {
  dom,
  render,
  cleanup,
  waitFor,
  fireEvent,
  userEvent,
} from "@/test/dom";
import type {
  ExocorpseCmsFieldDefinition,
  ExocorpseJson,
} from "@/types/exocorpse-cms";
const { DraftInput, DraftTextarea } = await import("./DraftTextControl");
const { default: CmsFieldEditor } =
  await import("../admin/cms-management/CmsFieldEditor");
const { default: CmsStructuredFields } =
  await import("../admin/cms-management/CmsStructuredFields");

for (const type of ["input", "textarea"] as const) {
  test(`${type}: caret survives middle typing and a save-in-flight; external values apply on blur`, async () => {
    let finishSave: (value: string) => void = () => {};
    const save = new Promise<string>((resolve) => {
      finishSave = resolve;
    });
    function Draft() {
      const [value, setValue] = useState("Hello world");
      useEffect(() => {
        void save.then(setValue);
      }, []);
      const Component = type === "input" ? DraftInput : DraftTextarea;
      return (
        <>
          <Component
            aria-label="Draft"
            value={value}
            onValueChange={setValue}
          />
          <button>Outside</button>
          <output>{value}</output>
        </>
      );
    }
    const { getByLabelText, container } = render(<Draft />);
    const field = getByLabelText("Draft");
    if (!(
      field instanceof dom.window.HTMLInputElement ||
      field instanceof dom.window.HTMLTextAreaElement
    ))
      throw new Error("Missing native control");
    await act(async () => {
      field.focus();
      field.setSelectionRange(5, 5);
    });
    const user = userEvent.setup({ document: dom.window.document });
    await user.keyboard("X");
    expect(field.value).toBe("HelloX world");
    expect(field.selectionStart).toBe(6);
    expect(field.selectionEnd).toBe(6);
    await act(async () => {
      finishSave("Saved world");
      await save;
    });
    expect(field.value).toBe("HelloX world");
    expect(field.selectionStart).toBe(6);
    await user.keyboard("Y");
    await user.tab();
    expect(field.value).toBe("Saved world");
    expect(container.querySelector("output")?.textContent).toBe("Saved world");
    await act(async () => {
      field.focus();
    });
    expect(field.selectionStart).toBe(7);
    expect(field.selectionEnd).toBe(7);
    await user.keyboard("Z");
    expect(field.value).toBe("Saved wZorld");
    expect(container.querySelector("output")?.textContent).toBe("Saved wZorld");
  });
}

const definition = (
  field_type: ExocorpseCmsFieldDefinition["field_type"],
): ExocorpseCmsFieldDefinition => ({
  id: "custom",
  key: "custom",
  label: "Custom",
  field_type,
  collection_id: "collection",
  field_scope: "profile_data",
  default_value: null,
  description: null,
  is_enabled: true,
  is_required: false,
  options: [],
  sort_order: 0,
  source: "legacy",
});

for (const type of ["string-array", "json"] as const) {
  test(`${type}: parse only on blur and retain focused external updates`, async () => {
    let publish: (value: ExocorpseJson) => void = () => {};
    const committed: (ExocorpseJson | undefined)[] = [];
    function Draft() {
      const [value, setValue] = useState<ExocorpseJson>(
        type === "json" ? { name: "Alpha" } : ["Alpha", "Beta"],
      );
      publish = setValue;
      return (
        <>
          <CmsFieldEditor
            definition={definition(type)}
            value={value}
            onChange={(next) => {
              committed.push(next);
              if (next !== undefined) setValue(next);
            }}
          />
          <button>Outside</button>
        </>
      );
    }
    const { container } = render(<Draft />);
    const field = container.querySelector("textarea");
    if (!field) throw new Error("Missing structured control");
    await act(async () => {
      field.focus();
      field.setSelectionRange(2, 2);
    });
    const user = userEvent.setup({ document: dom.window.document });
    await user.keyboard(" ");
    expect(field.selectionStart).toBe(3);
    expect(field.selectionEnd).toBe(3);
    expect(committed).toHaveLength(0);
    const local = field.value;
    await act(async () => {
      publish(type === "json" ? { name: "Server" } : ["Server", "Value"]);
    });
    expect(field.value).toBe(local);
    expect(field.selectionStart).toBe(3);
    await user.tab();
    expect(field.value).toContain("Server");
    expect(committed.at(-1)).toEqual(
      type === "json" ? { name: "Server" } : ["Server", "Value"],
    );
    await act(async () => {
      field.focus();
      field.setSelectionRange(
        type === "json" ? field.value.indexOf("Server") : 0,
        type === "json" ? field.value.indexOf("Server") : 0,
      );
    });
    await user.keyboard("T");
    expect(field.value).toContain("TServer");
    await user.tab();
    expect(committed.at(-1)).toEqual(
      type === "json" ? { name: "TServer" } : ["TServer", "Value"],
    );
  });
}

for (const type of ["number", "datetime"] as const) {
  test(`${type}: conversion waits for blur and external changes do not replace focused text`, async () => {
    let publish: (value: ExocorpseJson) => void = () => {};
    const committed: (ExocorpseJson | undefined)[] = [];
    function Draft() {
      const [value, setValue] = useState<ExocorpseJson>(
        type === "number" ? 123 : "2026-10-30T12:30:00.000Z",
      );
      publish = setValue;
      return (
        <>
          <CmsFieldEditor
            definition={definition(type)}
            value={value}
            onChange={(next) => {
              committed.push(next);
              if (next !== undefined) setValue(next);
            }}
          />
          <button>Outside</button>
        </>
      );
    }
    const { container } = render(<Draft />);
    const field = container.querySelector("input");
    if (!field) throw new Error("Missing typed input");
    await act(async () => {
      field.focus();
    });
    fireEvent.change(field, {
      target: { value: type === "number" ? "1234" : "2026-10-30T13:45" },
    });
    expect(committed).toHaveLength(0);
    await act(async () => {
      publish(type === "number" ? 999 : "2026-10-31T09:00:00.000Z");
    });
    expect(field.value).toBe(type === "number" ? "1234" : "2026-10-30T13:45");
    await userEvent.setup({ document: dom.window.document }).tab();
    expect(field.value).toBe(type === "number" ? "999" : "2026-10-31T09:00");
    expect(committed.at(-1)).toBe(
      type === "number" ? 999 : "2026-10-31T09:00:00.000Z",
    );
  });
}

test("structured controls keep their DOM identity when a first save assigns the entry id", async () => {
  const draft = {
    id: "",
    collection_id: "collection",
    title: "Entry",
    slug: "entry",
    status: "draft",
    subtitle: null,
    summary: null,
    profile_data: { custom: "Hello world" },
    metadata: {},
    scheduled_for: null,
    sort_order: 0,
    updated_at: "2026-10-30",
  } satisfies import("../admin/cms-management/editor-types").CmsEntryDraft;
  const props = {
    definitions: [definition("string")],
    draft,
    onChange: () => {},
  };
  const { container, rerender } = render(<CmsStructuredFields {...props} />);
  const field = container.querySelector("input");
  if (!field) throw new Error("Missing structured input");
  await act(async () => {
    field.focus();
    field.setSelectionRange(5, 5);
  });
  rerender(
    <CmsStructuredFields
      {...props}
      draft={{
        ...draft,
        id: "assigned-by-save",
        profile_data: { custom: "External value" },
      }}
    />,
  );
  expect(container.querySelector("input")).toBe(field);
  expect(document.activeElement).toBe(field);
  expect(field.value).toBe("Hello world");
  await userEvent.setup({ document: dom.window.document }).tab();
  await waitFor(() => expect(field.value).toBe("External value"));
});

afterEach(cleanup);

const { useDraftEdits, withDraftEdits } = await import("./DraftEdits");
test("deferred edits enable Save and commit before its click handler", async () => {
  const saved: number[] = [];
  const Form = withDraftEdits(function Form() {
    const [value, setValue] = useState(1);
    const pending = useDraftEdits()?.pending;
    return (
      <>
        <DraftInput
          aria-label="Amount"
          type="number"
          value={value}
          onValueChange={(next) => setValue(Number(next))}
        />
        <button
          disabled={!pending && value === 1}
          onClick={() => saved.push(value)}
        >
          Save
        </button>
      </>
    );
  });
  const { getByLabelText, getByRole } = render(<Form />);
  const field = getByLabelText("Amount");
  const user = userEvent.setup({ document: dom.window.document });
  await user.clear(field);
  await user.type(field, "42");
  expect(getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(
    false,
  );
  await user.click(getByRole("button", { name: "Save" }));
  expect(saved).toEqual([42]);
});

test("string-array drafts retain blank lines and unfinished delimiters until blur", async () => {
  for (const text of [
    "first\n",
    "first\n\n",
    "first, ",
    "first\nsecond\n",
    "\n",
  ]) {
    const committed: (ExocorpseJson | undefined)[] = [];
    const { container, unmount } = render(
      <>
        <CmsFieldEditor
          definition={definition("string-array")}
          value={["old"]}
          onChange={(value) => committed.push(value)}
        />
        <button>Outside</button>
      </>,
    );
    const field = container.querySelector("textarea");
    if (!field) throw new Error("Missing textarea");
    const user = userEvent.setup({ document: dom.window.document });
    await user.clear(field);
    await user.keyboard(text.replaceAll("\n", "{Enter}"));
    expect(field.value).toBe(text);
    expect(field.selectionStart).toBe(text.length);
    expect(field.selectionEnd).toBe(text.length);
    expect(committed).toHaveLength(0);
    await user.tab();
    expect(committed).toHaveLength(1);
    unmount();
  }
});

test("JSON errors survive equal-content props and focused external updates until valid text applies", async () => {
  let refresh: (value: ExocorpseJson) => void = () => {};
  const committed: (ExocorpseJson | undefined)[] = [];
  const Form = withDraftEdits(function Form() {
    const [value, setValue] = useState<ExocorpseJson>({ name: "Original" });
    refresh = setValue;
    const edits = useDraftEdits();
    return (
      <>
        <CmsFieldEditor
          definition={definition("json")}
          value={value}
          onChange={(next) => {
            committed.push(next);
            if (next !== undefined) setValue(next);
          }}
        />
        <button>Outside</button>
        <output>{edits?.pending ? "dirty" : "clean"}</output>
      </>
    );
  });
  const { container, getByText, queryByText } = render(<Form />);
  const field = container.querySelector("textarea");
  if (!field) throw new Error("Missing JSON input");
  const user = userEvent.setup({ document: dom.window.document });
  await user.clear(field);
  await user.type(field, "invalid JSON");
  await user.tab();
  expect(getByText("Please review the value in this field.")).toBeTruthy();
  await act(async () => {
    refresh({ name: "Original" });
  });
  expect(field.value).toBe("invalid JSON");
  expect(getByText("Please review the value in this field.")).toBeTruthy();
  expect(container.querySelector("output")?.textContent).toBe("dirty");
  expect(committed).toEqual([]);
  await act(async () => {
    field.focus();
    refresh({ name: "External" });
  });
  expect(field.value).toBe("invalid JSON");
  expect(getByText("Please review the value in this field.")).toBeTruthy();
  expect(container.querySelector("output")?.textContent).toBe("dirty");
  expect(committed).toEqual([]);
  await user.tab();
  expect(field.value).toContain("External");
  expect(queryByText("Please review the value in this field.")).toBeNull();
  expect(container.querySelector("output")?.textContent).toBe("clean");
  expect(committed).toEqual([{ name: "External" }]);
});

for (const kind of ["input", "textarea"] as const) {
  test(`${kind}: untouched deferred blurs do not commit and edited blurs commit once`, async () => {
    const committed: string[] = [];
    function Form() {
      const [value, setValue] = useState(kind === "input" ? "7" : "{}");
      const onValueChange = (next: string) => {
        committed.push(next);
        setValue(next);
      };
      return (
        <>
          {kind === "input" ? (
            <DraftInput
              aria-label="Deferred"
              type="number"
              value={value}
              onValueChange={onValueChange}
            />
          ) : (
            <DraftTextarea
              aria-label="Deferred"
              commitOnBlur
              value={value}
              onValueChange={onValueChange}
            />
          )}
          <button>Outside</button>
        </>
      );
    }
    const { getByLabelText } = render(<Form />);
    const field = getByLabelText("Deferred");
    const user = userEvent.setup({ document: dom.window.document });
    await user.click(field);
    await user.tab();
    expect(committed).toEqual([]);
    await user.clear(field);
    if (kind === "input") await user.type(field, "42");
    else await user.paste('{"ok":true}');
    await user.tab();
    expect(committed).toEqual([kind === "input" ? "42" : '{"ok":true}']);
    await user.click(field);
    await user.tab();
    expect(committed).toHaveLength(1);
  });
}
