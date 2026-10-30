import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { dom, render, cleanup, userEvent } from "@/test/dom";
import type { AboutContentItem } from "@/lib/about";
const { default: AboutContentItemsEditor } =
  await import("./AboutContentItemsEditor");
afterEach(cleanup);

test("an About item keeps its middle caret during save and applies refreshed text on blur", async () => {
  let finishSave: () => void = () => {};
  const save = new Promise<void>((resolve) => {
    finishSave = resolve;
  });
  const item: AboutContentItem = {
    id: "item",
    title: "Hello world",
    subtitle: null,
    body: "",
    section: "experience",
    variant: null,
    url: null,
    icon_key: null,
    color_key: null,
    display_order: 0,
    is_full_width: false,
    seed_key: null,
    created_at: "created",
    updated_at: "updated",
  };
  const props = {
    title: "Experiences",
    section: "experience" as const,
    items: [item],
    fields: [{ key: "title" as const, label: "Title", type: "text" as const }],
    onCreate: async () => {},
    onUpdate: () => save,
    onDelete: async () => {},
  };
  const { container, rerender } = render(
    <AboutContentItemsEditor {...props} />,
  );
  const card = container.querySelector("details details");
  const summary = card?.querySelector("summary");
  if (!card || !summary) throw new Error("Missing About card");
  const user = userEvent.setup({ document: dom.window.document });
  await user.click(summary);
  const field = card.querySelector("input");
  if (!field) throw new Error("Missing title");
  await act(async () => {
    field.focus();
    field.setSelectionRange(5, 5);
  });
  await user.keyboard("X");
  const saveButton = Array.from(card.querySelectorAll("button")).find(
    (button) => button.textContent?.trim() === "Save",
  );
  if (!saveButton) throw new Error("Missing Save");
  expect(saveButton.disabled).toBe(false);
  await user.click(saveButton);
  await act(async () => {
    field.focus();
    field.setSelectionRange(6, 6);
  });
  await user.keyboard("Y");
  rerender(
    <AboutContentItemsEditor
      {...props}
      items={[{ ...item, title: "Server value", updated_at: "new-version" }]}
    />,
  );
  await act(async () => {
    finishSave();
    await save;
  });
  expect(card.querySelector("input")).toBe(field);
  expect(field.value).toBe("HelloXY world");
  expect(field.selectionStart).toBe(7);
  expect(field.selectionEnd).toBe(7);
  await user.tab();
  expect(field.value).toBe("Server value");
  await act(async () => {
    field.focus();
  });
  await user.keyboard("Z");
  expect(field.value).toBe("Server Zvalue");
});
