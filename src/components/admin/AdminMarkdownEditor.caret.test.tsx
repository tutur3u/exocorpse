import { afterEach, expect, test } from "bun:test";
import { JSDOM } from "jsdom";
import { act, useEffect, useState } from "react";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
});
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement,
  Element: dom.window.Element,
  Node: dom.window.Node,
  MutationObserver: dom.window.MutationObserver,
  getComputedStyle: dom.window.getComputedStyle,
  requestAnimationFrame: (callback: FrameRequestCallback) =>
    setTimeout(callback, 0),
  cancelAnimationFrame: clearTimeout,
  ResizeObserver: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  IS_REACT_ACT_ENVIRONMENT: true,
});
Object.assign(dom.window.Range.prototype, {
  getClientRects: () => [],
  getBoundingClientRect: () => new dom.window.DOMRect(),
});
const { render, cleanup, waitFor } = await import("@testing-library/react");
const { default: userEvent } = await import("@testing-library/user-event");
const { default: AdminMarkdownEditor } = await import("./AdminMarkdownEditor");

afterEach(cleanup);

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
