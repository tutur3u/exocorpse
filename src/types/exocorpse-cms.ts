export type ExocorpseJson =
  | string
  | number
  | boolean
  | null
  | { [key: string]: ExocorpseJson | undefined }
  | ExocorpseJson[];

export type ExocorpseCmsCollection = {
  id: string;
  slug: string;
  title: string;
  collection_type: string;
};

export type ExocorpseCmsEntry = {
  collection_id: string;
  created_at: string;
  id: string;
  metadata: ExocorpseJson;
  profile_data: ExocorpseJson;
  published_at: string | null;
  scheduled_for: string | null;
  slug: string;
  sort_order: number;
  stable_source_id: string | null;
  status: "draft" | "scheduled" | "published" | "archived";
  subtitle: string | null;
  summary: string | null;
  title: string;
  updated_at: string;
};

export type ExocorpseCmsBlock = {
  block_type: string;
  content: ExocorpseJson;
  entry_id: string;
  id: string;
  sort_order: number;
  stable_source_id: string | null;
  title: string | null;
};

export type ExocorpseCmsRelation = {
  from_entry_id: string;
  id: string;
  metadata: ExocorpseJson;
  relation_definition_id: string | null;
  relation_type: string;
  sort_order: number;
  to_entry_id: string;
};

export type ExocorpseCmsAsset = {
  alt_text: string | null;
  asset_type: string;
  asset_url: string | null;
  entry_id: string | null;
  id: string;
  metadata: ExocorpseJson;
  sort_order: number;
  source_url: string | null;
  storage_path: string | null;
  updated_at: string;
};

export type ExocorpseCmsRelationDefinition = {
  cardinality: "one" | "many";
  id: string;
  is_required: boolean;
  key: string;
  label: string;
  source_collection_id: string;
};

export type ExocorpseCmsRelationDefinitionTarget = {
  relation_definition_id: string;
  target_collection_id: string;
};

export type ExocorpseCmsStudio = {
  assets: ExocorpseCmsAsset[];
  blocks: ExocorpseCmsBlock[];
  collections: ExocorpseCmsCollection[];
  entries: ExocorpseCmsEntry[];
  relations?: ExocorpseCmsRelation[];
  relationDefinitions?: ExocorpseCmsRelationDefinition[];
  relationDefinitionTargets?: ExocorpseCmsRelationDefinitionTarget[];
};

export type BlacklistedUser = {
  id: string;
  reasoning: string | null;
  timestamp: string;
  username: string;
};
