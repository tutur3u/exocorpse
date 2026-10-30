import { afterEach, expect, mock, spyOn, test } from "bun:test";
import { act } from "react";
import { dom, render, cleanup, waitFor, userEvent } from "@/test/dom";
import type { ExocorpseCmsEntry } from "@/types/exocorpse-cms";

type Bundle = { entry: ExocorpseCmsEntry; blocks: []; relations: [] };
let saveCalls = 0;
let assetRegistrations = 0;
let finishSave: (bundle: Bundle) => void = () => {};
const pendingSave = new Promise<Bundle>((resolve) => {
  finishSave = resolve;
});
const unused = () => {
  throw new Error("Unexpected CMS operation");
};
mock.module("@/lib/actions/cms", () => ({
  saveAdminCmsEntry: () => {
    saveCalls += 1;
    return pendingSave;
  },
  deleteAdminCmsAsset: unused,
  deleteAdminCmsEntry: unused,
  saveAdminCmsAddonLinks: unused,
  reorderAdminCmsEntries: unused,
  reorderAdminCmsAssets: unused,
  registerAdminCmsAsset: async ({ entryId }: { entryId: string }) => {
    assetRegistrations += 1;
    return {
      id: "asset",
      entry_id: entryId,
      asset_type: "image",
      asset_url: null,
      alt_text: null,
      metadata: {},
      sort_order: 0,
      source_url: null,
      storage_path: "fixture/upload.png",
      updated_at: "version",
    };
  },
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

const { default: CmsFieldEditor } = await import("./CmsFieldEditor");
const { useDraftEdits } = await import("@/components/shared/DraftEdits");
test("invalid visible JSON remains dirty with an error and cannot be committed or saved after blur", async () => {
  const beforeSaves = saveCalls;
  const committed: unknown[] = [];
  let closed = 0;
  const entry: ExocorpseCmsEntry = {
    id: "existing",
    collection_id: "collection",
    title: "Entry",
    slug: "entry",
    subtitle: null,
    summary: null,
    metadata: { name: "Valid" },
    profile_data: {},
    scheduled_for: null,
    status: "draft",
    sort_order: 0,
    updated_at: "version",
    created_at: "created",
    published_at: null,
    stable_source_id: null,
  };
  const studio = {
    collections: [
      {
        id: "collection",
        slug: "stories",
        title: "Stories",
        collection_type: "content",
      },
    ],
    entries: [entry],
    blocks: [],
    assets: [],
  };
  const definition = {
    id: "document",
    key: "document",
    label: "Document",
    collection_id: "collection",
    field_scope: "metadata" as const,
    field_type: "json" as const,
    default_value: null,
    description: null,
    is_enabled: true,
    is_required: false,
    options: [],
    sort_order: 0,
    source: "test",
  };
  const Form = withDraftEdits(function Form() {
    const editor = useCmsManagementWorkspace({
      initialStudio: studio,
      section: ADMIN_CMS_SECTIONS.stories,
    });
    const edits = useDraftEdits();
    return (
      <>
        <CmsFieldEditor
          definition={definition}
          value={editor.draft.metadata}
          onChange={(value) => {
            committed.push(value);
            editor.setDraft((current) => ({
              ...current,
              metadata: value ?? {},
            }));
          }}
        />
        <button
          onClick={() =>
            editor.save(() => {
              closed += 1;
            })
          }
        >
          Save
        </button>
        <output data-pending={String(edits?.pending)}>
          {editor.isDirty ? "dirty" : "clean"}
        </output>
        <aside data-message={editor.message?.kind}>
          {editor.message?.text}
        </aside>
        <pre>{JSON.stringify(editor.draft.metadata)}</pre>
      </>
    );
  });
  const { container, getByRole, getByText } = render(<Form />);
  const field = container.querySelector("textarea");
  if (!field) throw new Error("Missing JSON input");
  const user = userEvent.setup({ document: dom.window.document });
  await user.clear(field);
  await user.type(field, "invalid JSON");
  await user.tab();
  expect(field.value).toBe("invalid JSON");
  expect(getByText("Please review the value in this field.")).toBeTruthy();
  expect(container.querySelector("output")?.getAttribute("data-pending")).toBe(
    "true",
  );
  expect(container.querySelector("output")?.textContent).toBe("dirty");
  expect(committed).toEqual([]);
  await user.click(getByRole("button", { name: "Save" }));
  expect(saveCalls).toBe(beforeSaves);
  expect(closed).toBe(0);
  expect(committed).toEqual([]);
  expect(container.querySelector("pre")?.textContent).toBe('{"name":"Valid"}');
  expect(container.querySelector("output")?.getAttribute("data-pending")).toBe(
    "true",
  );
  expect(container.querySelector("output")?.textContent).toBe("dirty");
  expect(field.value).toBe("invalid JSON");
  expect(
    container.querySelector("aside")?.getAttribute("data-message"),
  ).not.toBe("success");
  expect(container.textContent).toContain(
    "Please review the value in this field.",
  );
  await user.clear(field);
  await user.paste('{"name":"Fixed"}');
  expect(field.value).toBe('{"name":"Fixed"}');
  await user.tab();
  expect(committed).toEqual([{ name: "Fixed" }]);
  expect(container.querySelector("output")?.getAttribute("data-pending")).toBe(
    "false",
  );
  expect(container.querySelector("pre")?.textContent).toBe('{"name":"Fixed"}');
  expect(container.querySelector("textarea")?.value).toContain("Fixed");
  await user.clear(field);
  await user.type(field, "invalid again");
  await user.click(getByRole("button", { name: "Save" }));
  expect(saveCalls).toBe(beforeSaves);
  expect(closed).toBe(0);
  expect(committed).toEqual([{ name: "Fixed" }]);
  expect(container.querySelector("output")?.getAttribute("data-pending")).toBe(
    "true",
  );
  expect(container.querySelector("output")?.textContent).toBe("dirty");
  expect(field.value).toBe("invalid again");
  expect(
    container.querySelector("aside")?.getAttribute("data-message"),
  ).not.toBe("success");
  expect(container.textContent).toContain(
    "Please review the value in this field.",
  );
});

const assetUpload = await import("@/lib/cms-asset-upload");
const { isJsonRecord } = await import("./editor-utils");

function uploadEntry(): ExocorpseCmsEntry {
  return {
    id: "existing-upload",
    collection_id: "collection",
    title: "Existing",
    slug: "existing",
    metadata: {},
    profile_data: {},
    subtitle: null,
    summary: null,
    status: "draft",
    sort_order: 0,
    scheduled_for: null,
    published_at: null,
    stable_source_id: null,
    created_at: "created",
    updated_at: "version",
  };
}

for (const scenario of ["new-story", "new-media", "existing"] as const) {
  test(`upload ${scenario}: invalid drafts block entry creation while existing-entry uploads still work`, async () => {
    const beforeSaves = saveCalls;
    const beforeRegistrations = assetRegistrations;
    const upload = spyOn(assetUpload, "uploadCmsAssetDirect").mockResolvedValue(
      "fixture/upload.png",
    );
    try {
      const slug = scenario === "new-media" ? "portfolio-art" : "stories";
      const studio = {
        collections: [
          {
            id: "collection",
            slug,
            title: "Collection",
            collection_type: "content",
          },
        ],
        entries: scenario === "existing" ? [uploadEntry()] : [],
        blocks: [],
        assets: [],
      };
      const definition = {
        id: "document",
        key: "document",
        label: "Document",
        collection_id: "collection",
        field_scope: "metadata" as const,
        field_type: "json" as const,
        default_value: null,
        description: null,
        is_enabled: true,
        is_required: false,
        options: [],
        sort_order: 0,
        source: "test",
      };
      let rejected: unknown;
      const Form = withDraftEdits(function Form() {
        const editor = useCmsManagementWorkspace({
          initialStudio: studio,
          section:
            slug === "stories"
              ? ADMIN_CMS_SECTIONS.stories
              : ADMIN_CMS_SECTIONS.portfolio,
        });
        return (
          <>
            <DraftInput
              aria-label="Title"
              value={editor.draft.title}
              onValueChange={editor.changeTitle}
            />
            <CmsFieldEditor
              definition={definition}
              value={editor.draft.metadata}
              onChange={(value) =>
                editor.setDraft((current) => ({
                  ...current,
                  metadata: value ?? {},
                }))
              }
            />
            <button
              onClick={() => {
                void editor
                  .uploadAsset(
                    new File(["fixture"], "art.png", { type: "image/png" }),
                  )
                  .catch((error) => {
                    rejected = error;
                  });
              }}
            >
              Upload
            </button>
            <aside data-kind={editor.message?.kind}>
              {editor.message?.text}
            </aside>
            <output data-entry={editor.entryId}>
              {editor.isDirty ? "dirty" : "clean"}
            </output>
          </>
        );
      });
      const { container, getByRole, getByLabelText } = render(<Form />);
      const user = userEvent.setup({ document: dom.window.document });
      if (scenario !== "existing")
        await user.type(getByLabelText("Title"), "New entry");
      const field = container.querySelector("textarea");
      if (!field) throw new Error("Missing JSON field");
      await user.clear(field);
      await user.type(field, "invalid JSON");
      await user.tab();
      await user.click(getByRole("button", { name: "Upload" }));
      expect(saveCalls).toBe(beforeSaves);
      if (scenario === "existing") {
        await waitFor(() =>
          expect(assetRegistrations).toBe(beforeRegistrations + 1),
        );
        expect(upload).toHaveBeenCalledTimes(1);
        expect(rejected).toBeUndefined();
        await waitFor(() =>
          expect(container.querySelector("aside")?.textContent).toBe(
            "Media uploaded.",
          ),
        );
        expect(
          container.querySelector("output")?.getAttribute("data-entry"),
        ).toBe("existing-upload");
      } else {
        await waitFor(() => expect(rejected).toBeInstanceOf(Error));
        expect(upload).not.toHaveBeenCalled();
        expect(assetRegistrations).toBe(beforeRegistrations);
        expect(
          container.querySelector("aside")?.getAttribute("data-kind"),
        ).toBe("error");
        expect(container.querySelector("aside")?.textContent).toBe(
          "Please review the value in this field.",
        );
        expect(
          container.querySelector("output")?.getAttribute("data-entry"),
        ).toBe("");
      }
      expect(field.value).toBe("invalid JSON");
      expect(container.querySelector("output")?.textContent).toBe("dirty");
    } finally {
      upload.mockRestore();
    }
  });
}

test("blurring an untouched optional JSON document does not create a value or dirty the entry", async () => {
  let commits = 0;
  const studio = {
    collections: [
      {
        id: "collection",
        slug: "stories",
        title: "Stories",
        collection_type: "content",
      },
    ],
    entries: [uploadEntry()],
    blocks: [],
    assets: [],
  };
  const definition = {
    id: "optional",
    key: "optional",
    label: "Optional",
    collection_id: "collection",
    field_scope: "metadata" as const,
    field_type: "json" as const,
    default_value: null,
    description: null,
    is_enabled: true,
    is_required: false,
    options: [],
    sort_order: 0,
    source: "test",
  };
  const Form = withDraftEdits(function Form() {
    const editor = useCmsManagementWorkspace({
      initialStudio: studio,
      section: ADMIN_CMS_SECTIONS.stories,
    });
    const metadata = isJsonRecord(editor.draft.metadata)
      ? editor.draft.metadata
      : {};
    return (
      <>
        <CmsFieldEditor
          definition={definition}
          value={metadata.optional}
          onChange={(value) => {
            commits += 1;
            editor.setDraft((current) => ({
              ...current,
              metadata: {
                ...(isJsonRecord(current.metadata) ? current.metadata : {}),
                optional: value,
              },
            }));
          }}
        />
        <button>Outside</button>
        <output>{editor.isDirty ? "dirty" : "clean"}</output>
        <pre>
          {metadata.optional === undefined
            ? "unset"
            : JSON.stringify(metadata.optional)}
        </pre>
      </>
    );
  });
  const { container } = render(<Form />);
  const field = container.querySelector("textarea");
  if (!field) throw new Error("Missing optional JSON");
  const user = userEvent.setup({ document: dom.window.document });
  expect(field.value).toBe("{}");
  await act(async () => {
    field.focus();
  });
  await user.tab();
  expect(commits).toBe(0);
  expect(container.querySelector("output")?.textContent).toBe("clean");
  expect(container.querySelector("pre")?.textContent).toBe("unset");
  await user.clear(field);
  await user.paste('{"ok":true}');
  await user.tab();
  expect(commits).toBe(1);
  expect(container.querySelector("output")?.textContent).toBe("dirty");
  expect(container.querySelector("pre")?.textContent).toBe('{"ok":true}');
  await act(async () => {
    field.focus();
  });
  await user.tab();
  expect(commits).toBe(1);
});

test("Save and implicit upload stay blocked until reverted JSON blurs and clears its error", async () => {
  const beforeSaves = saveCalls;
  let rejected: unknown;
  let commits = 0;
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
  const definition = {
    id: "json",
    key: "json",
    label: "JSON",
    collection_id: "collection",
    field_scope: "metadata" as const,
    field_type: "json" as const,
    default_value: null,
    description: null,
    is_enabled: true,
    is_required: false,
    options: [],
    sort_order: 0,
    source: "test",
  };
  const Form = withDraftEdits(function Form() {
    const editor = useCmsManagementWorkspace({
      initialStudio: studio,
      section: ADMIN_CMS_SECTIONS.stories,
    });
    const edits = useDraftEdits();
    return (
      <>
        <DraftInput
          aria-label="Title"
          value={editor.draft.title}
          onValueChange={editor.changeTitle}
        />
        <CmsFieldEditor
          definition={definition}
          value={editor.draft.metadata}
          onChange={(value) => {
            commits++;
            editor.setDraft((current) => ({
              ...current,
              metadata: value ?? {},
            }));
          }}
        />
        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.save()}
        >
          Save
        </button>
        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            void editor
              .uploadAsset(
                new File(["fixture"], "art.png", { type: "image/png" }),
              )
              .catch((error) => {
                rejected = error;
              });
          }}
        >
          Upload
        </button>
        <output data-invalid={String(edits?.invalid)}>
          {edits?.pending ? "dirty" : "clean"}
        </output>
      </>
    );
  });
  const { container, getByRole, getByLabelText, queryByText } = render(
    <Form />,
  );
  const user = userEvent.setup({ document: dom.window.document });
  await user.type(getByLabelText("Title"), "New entry");
  const field = container.querySelector("textarea");
  if (!field) throw new Error("Missing JSON");
  const saved = field.value;
  await user.clear(field);
  await user.type(field, "invalid");
  await user.tab();
  await user.click(getByRole("button", { name: "Save" }));
  await user.click(getByRole("button", { name: "Upload" }));
  await waitFor(() => expect(rejected).toBeInstanceOf(Error));
  expect(saveCalls).toBe(beforeSaves);
  rejected = undefined;
  await user.clear(field);
  await user.paste(saved);
  await user.click(getByRole("button", { name: "Save" }));
  await user.click(getByRole("button", { name: "Upload" }));
  await waitFor(() => expect(rejected).toBeInstanceOf(Error));
  expect(document.activeElement).toBe(field);
  expect(container.querySelector("output")?.getAttribute("data-invalid")).toBe(
    "true",
  );
  expect(queryByText("Please review the value in this field.")).not.toBeNull();
  expect(saveCalls).toBe(beforeSaves);
  expect(commits).toBe(0);
  await user.tab();
  expect(container.querySelector("output")?.getAttribute("data-invalid")).toBe(
    "false",
  );
  expect(container.querySelector("output")?.textContent).toBe("clean");
  expect(queryByText("Please review the value in this field.")).toBeNull();
  expect(commits).toBe(0);
  await user.click(getByRole("button", { name: "Save" }));
  await waitFor(() => expect(saveCalls).toBe(beforeSaves + 1));
});
