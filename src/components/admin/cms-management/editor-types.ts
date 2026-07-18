import type {
  ExocorpseCmsBlock,
  ExocorpseCmsEntry,
  ExocorpseJson,
} from "@/types/exocorpse-cms";

export type CmsEntryDraft = Pick<
  ExocorpseCmsEntry,
  | "collection_id"
  | "id"
  | "metadata"
  | "profile_data"
  | "scheduled_for"
  | "slug"
  | "sort_order"
  | "status"
  | "subtitle"
  | "summary"
  | "title"
  | "updated_at"
>;

export type CmsBlockDraft = {
  blockType: string;
  contentText: string;
  id?: string;
  key: string;
  sortOrder: number;
  stableSourceId?: string | null;
  title: string;
};

export type CmsRelationSelections = Record<string, string[]>;

export type CmsSavePayload = {
  blocks: Array<{
    blockType: string;
    content: ExocorpseJson;
    id?: string;
    sortOrder: number;
    stableSourceId?: string | null;
    title: string | null;
  }>;
  entry: {
    collectionId: string;
    metadata: ExocorpseJson;
    profileData: ExocorpseJson;
    scheduledFor: string | null;
    slug: string;
    sortOrder: number;
    status: CmsEntryDraft["status"];
    subtitle: string | null;
    summary: string | null;
    title: string;
  };
  relations: Array<{
    definitionId: string;
    sortOrder: number;
    toEntryId: string;
  }>;
};

export type CmsEditorMessage = {
  kind: "error" | "success";
  text: string;
} | null;

export type CmsBlockSource = Pick<
  ExocorpseCmsBlock,
  "block_type" | "content" | "id" | "sort_order" | "stable_source_id" | "title"
>;
