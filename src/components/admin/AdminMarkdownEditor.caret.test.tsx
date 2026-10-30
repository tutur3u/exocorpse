import { afterEach, expect, test } from "bun:test";
import { act, useEffect, useState } from "react";
import { dom, render, cleanup, waitFor, userEvent } from "@/test/dom";
const { default: AdminMarkdownEditor } = await import("./AdminMarkdownEditor");

test("typing in the middle preserves the rich editor selection through Markdown echoes", async () => {
  let finishSave: (value: string) => void = () => {};
  const save = new Promise<string>((resolve) => {
    finishSave = resolve;
  });
  function Draft() {
    const [value, setValue] = useState("Hello [world](https://example.org)");
    useEffect(() => {
      void save.then(setValue);
    }, []);
    return (
      <AdminMarkdownEditor
        value={value}
        onChange={setValue}
        placeholder="Write"
      />
    );
  }
  const { container } = render(<Draft />);
  const editable = await waitFor(() => {
    const element = container.querySelector<HTMLElement>(
      "[contenteditable=true]",
    );
    expect(element).not.toBeNull();
    return element!;
  });
  const user = userEvent.setup({ document: dom.window.document });
  await act(async () => {
    editable.focus();
    const text = editable.querySelector("p")?.firstChild;
    if (!text) throw new Error("Editor paragraph was not mounted");
    const range = document.createRange();
    range.setStart(text, 5);
    range.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    document.dispatchEvent(new dom.window.Event("selectionchange"));
  });
  await user.keyboard("X");
  await waitFor(() => expect(editable.textContent).toBe("HelloX world"));
  const selection = document.getSelection();
  expect(selection?.anchorOffset).toBe(6);
  expect(selection?.focusOffset).toBe(6);
  await act(async () => {
    finishSave("Saved [world](https://example.org)");
    await save;
  });
  expect(editable.textContent).toBe("HelloX world");
  expect(document.getSelection()?.anchorOffset).toBe(6);
  expect(document.getSelection()?.focusOffset).toBe(6);
  await user.keyboard("Y");
  await waitFor(() => expect(editable.textContent).toBe("HelloXY world"));
  await act(async () => {
    editable.blur();
  });
  await waitFor(() => expect(editable.textContent).toBe("Saved world"));
  await act(async () => {
    editable.focus();
  });
  expect(document.getSelection()?.anchorNode?.textContent).toBe("world");
  expect(document.getSelection()?.anchorOffset).toBe(1);
  expect(document.getSelection()?.focusOffset).toBe(1);
  await user.keyboard("Z");
  await waitFor(() => expect(editable.textContent).toBe("Saved wZorld"));
});

test("external resets can return to the last locally emitted Markdown", async () => {
  let emitted = "";
  const onChange = (next: string) => {
    emitted = next;
  };
  const { container, rerender } = render(
    <AdminMarkdownEditor
      value="Hello world"
      onChange={onChange}
      placeholder="Write"
    />,
  );
  const editable = await waitFor(() => {
    const element = container.querySelector<HTMLElement>(
      "[contenteditable=true]",
    );
    if (!element) throw new Error("Editor was not mounted");
    return element;
  });
  await act(async () => {
    editable.focus();
    const text = editable.querySelector("p")?.firstChild;
    if (!text) throw new Error("Missing paragraph");
    const range = document.createRange();
    range.setStart(text, 5);
    range.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    document.dispatchEvent(new dom.window.Event("selectionchange"));
  });
  await userEvent.setup({ document: dom.window.document }).keyboard("X");
  await waitFor(() => expect(emitted).toBe("HelloX world"));
  await act(async () => {
    editable.blur();
  });
  rerender(
    <AdminMarkdownEditor
      value="External replacement"
      onChange={onChange}
      placeholder="Write"
    />,
  );
  await waitFor(() =>
    expect(editable.textContent).toBe("External replacement"),
  );
  rerender(
    <AdminMarkdownEditor
      value={emitted}
      onChange={onChange}
      placeholder="Write"
    />,
  );
  await waitFor(() => expect(editable.textContent).toBe("HelloX world"));
});

afterEach(cleanup);
