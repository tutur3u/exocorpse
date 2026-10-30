import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { dom, render, cleanup, waitFor, userEvent } from "@/test/dom";
import type { ExocorpseCmsEntry } from "@/types/exocorpse-cms";

type Bundle = { entry: ExocorpseCmsEntry; blocks: []; relations: [] };
let finishSave: (bundle: Bundle) => void = () => {};
const pendingSave = new Promise<Bundle>((resolve) => {
  finishSave = resolve;
});
const unused = () => {
  throw new Error("Unexpected CMS operation");
};
mock.module("@/lib/actions/cms", () => ({
  saveAdminCmsEntry: () => pendingSave,
  deleteAdminCmsAsset: unused,
  deleteAdminCmsEntry: unused,
  saveAdminCmsAddonLinks: unused,
  reorderAdminCmsEntries: unused,
  reorderAdminCmsAssets: unused,
  registerAdminCmsAsset: unused,
  setAdminCmsEntryVisibility: unused,
}));
const { useCmsManagementWorkspace } =
  await import("./useCmsManagementWorkspace");
const { DraftInput } = await import("@/components/shared/DraftTextControl");
const { withDraftEdits } = await import("@/components/shared/DraftEdits");
const { ADMIN_CMS_SECTIONS } = await import("@/lib/admin-cms-sections");

afterEach(cleanup);
test("first-save completion retains focus and newer typing instead of closing the CMS editor", async () => {
  let closed = 0;
  const studio = {
    collections: [
      {
        id: "collection",
        slug: "stories",
        title: "Stories",
        collection_type: "content",
      },
    ],
    entries: [],
    blocks: [],
    assets: [],
  };
  const Form = withDraftEdits(function Form() {
    const editor = useCmsManagementWorkspace({
      initialStudio: studio,
      section: ADMIN_CMS_SECTIONS.stories,
    });
    return (
      <>
        <DraftInput
          key={editor.editorSessionKey}
          aria-label="Title"
          value={editor.draft.title}
          onValueChange={editor.changeTitle}
        />
        <button onClick={() => editor.createEntry()}>Create</button>
        <button
          onClick={() =>
            editor.save(() => {
              closed += 1;
            })
          }
        >
          Save
        </button>
        <aside data-message={editor.message?.kind}>
          {editor.message?.text}
        </aside>
        <output data-entry={editor.entryId}>
          {editor.isDirty ? "dirty" : "clean"}
        </output>
      </>
    );
  });
  const { getByLabelText, getByRole, container } = render(<Form />);
  const user = userEvent.setup({ document: dom.window.document });
  await user.click(getByRole("button", { name: "Create" }));
  const field = getByLabelText("Title");
  if (!(field instanceof dom.window.HTMLInputElement))
    throw new Error("Missing title input");
  await user.type(field, "Hello world");
  await user.click(getByRole("button", { name: "Save" }));
  await act(async () => {
    field.focus();
    field.setSelectionRange(5, 5);
  });
  await user.keyboard("X");
  await act(async () => {
    finishSave({
      entry: {
        id: "assigned",
        collection_id: "collection",
        title: "Hello world",
        slug: "hello-world",
        subtitle: null,
        summary: null,
        metadata: {},
        profile_data: {},
        scheduled_for: null,
        status: "draft",
        sort_order: 0,
        updated_at: "new-version",
        created_at: "created",
        published_at: null,
        stable_source_id: null,
      },
      blocks: [],
      relations: [],
    });
    await pendingSave;
  });
  await waitFor(() =>
    expect(container.querySelector("output")?.getAttribute("data-entry")).toBe(
      "assigned",
    ),
  );
  expect(container.querySelector("aside")?.getAttribute("data-message")).toBe(
    "success",
  );
  expect(closed).toBe(0);
  expect(getByLabelText("Title")).toBe(field);
  expect(document.activeElement).toBe(field);
  expect(field.value).toBe("HelloX world");
  expect(field.selectionStart).toBe(6);
  expect(field.selectionEnd).toBe(6);
  expect(container.querySelector("output")?.textContent).toBe("dirty");
  await user.keyboard("Y");
  expect(field.value).toBe("HelloXY world");
});
