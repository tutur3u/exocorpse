"use client";

import AboutContentItemsEditor, {
  type ContentFieldConfig,
} from "@/components/admin/about/AboutContentItemsEditor";
import AboutFaqEditor from "@/components/admin/about/AboutFaqEditor";
import AboutSettingsForm from "@/components/admin/about/AboutSettingsForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  isJsonRecord,
  slugify,
} from "@/components/admin/cms-management/editor-utils";
import {
  deleteAdminCmsAsset,
  deleteAdminCmsEntry,
  saveAdminCmsEntry,
  reorderAdminCmsAssets,
  registerAdminCmsAsset,
} from "@/lib/actions/cms";
import { publishCmsContentChanged } from "@/lib/cms-content-events";
import { uploadCmsAssetDirect } from "@/lib/cms-asset-upload";
import {
  ABOUT_SOCIAL_COLOR_KEYS,
  ABOUT_SOCIAL_ICON_KEYS,
  ABOUT_USE_ICON_KEYS,
  DEFAULT_ABOUT_SETTINGS,
  groupAboutItemsBySection,
  type AboutContentItem,
  type AboutFaq,
  type AboutPageData,
  type AboutPageSettings,
} from "@/lib/about";
import toastWithSound from "@/lib/toast";
import { useMemo, useState } from "react";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
  ExocorpseJson,
} from "@/types/exocorpse-cms";

const aboutUseFields: ContentFieldConfig[] = [
  { key: "title", label: "Card Title", type: "text" },
  { key: "body", label: "Card Body", type: "textarea", rows: 3 },
  {
    key: "icon_key",
    label: "Icon",
    type: "select",
    options: ABOUT_USE_ICON_KEYS.map((value) => ({
      label: value,
      value,
    })),
  },
  { key: "display_order", label: "Position", type: "number" },
];

const experienceFields: ContentFieldConfig[] = [
  { key: "icon_key", label: "Emoji/Icon", type: "text" },
  { key: "body", label: "Text", type: "textarea", rows: 3 },
  { key: "display_order", label: "Position", type: "number" },
];

const favoriteFields: ContentFieldConfig[] = [
  { key: "title", label: "Category", type: "text" },
  { key: "icon_key", label: "Emoji/Icon", type: "text" },
  { key: "body", label: "Items", type: "textarea", rows: 4 },
  { key: "display_order", label: "Position", type: "number" },
];

const socialFields: ContentFieldConfig[] = [
  { key: "title", label: "Platform Name", type: "text" },
  { key: "subtitle", label: "Username / Subtitle", type: "text" },
  { key: "url", label: "Platform URL", type: "text" },
  {
    key: "icon_key",
    label: "Icon Key",
    type: "select",
    options: ABOUT_SOCIAL_ICON_KEYS.map((value) => ({
      label: value,
      value,
    })),
  },
  {
    key: "color_key",
    label: "Color Key",
    type: "select",
    options: ABOUT_SOCIAL_COLOR_KEYS.map((value) => ({
      label: value,
      value,
    })),
  },
  { key: "is_full_width", label: "Full Width Card", type: "checkbox" },
  { key: "display_order", label: "Position", type: "number" },
];

const dniFields: ContentFieldConfig[] = [
  {
    key: "body",
    label: "",
    placeholder: "Write this boundary…",
    type: "textarea",
    rows: 3,
  },
  { key: "display_order", label: "Position", type: "number" },
];

const EPOCH = new Date(0).toISOString();

function stringValue(
  record: Record<string, ExocorpseJson | undefined>,
  key: string,
) {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function numberValue(
  record: Record<string, ExocorpseJson | undefined>,
  key: string,
) {
  const value = record[key];
  return typeof value === "number" ? value : undefined;
}

function booleanValue(
  record: Record<string, ExocorpseJson | undefined>,
  key: string,
) {
  const value = record[key];
  return typeof value === "boolean" ? value : undefined;
}

function entryMarkdown(studio: ExocorpseCmsStudio, entryId: string) {
  const block = studio.blocks
    .filter((item) => item.entry_id === entryId)
    .sort((left, right) => left.sort_order - right.sort_order)
    .find((item) => item.block_type === "markdown");
  if (!block || !isJsonRecord(block.content)) return "";
  return typeof block.content.markdown === "string"
    ? block.content.markdown
    : "";
}

export function aboutPageData(studio: ExocorpseCmsStudio): AboutPageData {
  const collectionBySlug = new Map(
    studio.collections.map((collection) => [collection.slug, collection]),
  );
  const entriesFor = (slug: string) => {
    const collection = collectionBySlug.get(slug);
    return studio.entries.filter(
      (entry) => entry.collection_id === collection?.id,
    );
  };
  const settingsEntry =
    entriesFor("about").find((entry) => entry.slug === "settings") ??
    entriesFor("about")[0];
  const settingsProfile = isJsonRecord(settingsEntry?.profile_data)
    ? settingsEntry.profile_data
    : {};
  const heroAsset = studio.assets
    .filter((asset) => asset.entry_id === settingsEntry?.id)
    .sort((left, right) => left.sort_order - right.sort_order)[0];
  const settings: AboutPageSettings = settingsEntry
    ? {
        ...DEFAULT_ABOUT_SETTINGS,
        about_use_heading:
          stringValue(settingsProfile, "aboutUseHeading") ??
          DEFAULT_ABOUT_SETTINGS.about_use_heading,
        created_at: settingsEntry.created_at,
        dni_intro:
          stringValue(settingsProfile, "dniIntro") ??
          DEFAULT_ABOUT_SETTINGS.dni_intro,
        dni_title:
          stringValue(settingsProfile, "dniTitle") ??
          DEFAULT_ABOUT_SETTINGS.dni_title,
        experiences_heading:
          stringValue(settingsProfile, "experiencesHeading") ??
          DEFAULT_ABOUT_SETTINGS.experiences_heading,
        faq_intro:
          stringValue(settingsProfile, "faqIntro") ??
          DEFAULT_ABOUT_SETTINGS.faq_intro,
        faq_title:
          stringValue(settingsProfile, "faqTitle") ??
          DEFAULT_ABOUT_SETTINGS.faq_title,
        favorites_heading:
          stringValue(settingsProfile, "favoritesHeading") ??
          DEFAULT_ABOUT_SETTINGS.favorites_heading,
        hero_bio:
          entryMarkdown(studio, settingsEntry.id) ??
          settingsEntry.summary ??
          "",
        hero_image_alt:
          stringValue(settingsProfile, "heroImageAlt") ??
          heroAsset?.alt_text ??
          DEFAULT_ABOUT_SETTINGS.hero_image_alt,
        hero_image_url: heroAsset?.preview_url ?? heroAsset?.asset_url ?? null,
        hero_name:
          stringValue(settingsProfile, "heroName") ??
          DEFAULT_ABOUT_SETTINGS.hero_name,
        hero_subtitle:
          stringValue(settingsProfile, "heroSubtitle") ??
          DEFAULT_ABOUT_SETTINGS.hero_subtitle,
        id: 1,
        more_info_heading:
          stringValue(settingsProfile, "moreInfoHeading") ??
          DEFAULT_ABOUT_SETTINGS.more_info_heading,
        socials_intro:
          stringValue(settingsProfile, "socialsIntro") ??
          DEFAULT_ABOUT_SETTINGS.socials_intro,
        socials_primary_username:
          stringValue(settingsProfile, "socialsPrimaryUsername") ??
          DEFAULT_ABOUT_SETTINGS.socials_primary_username,
        socials_secondary_username:
          stringValue(settingsProfile, "socialsSecondaryUsername") ??
          DEFAULT_ABOUT_SETTINGS.socials_secondary_username,
        socials_title:
          stringValue(settingsProfile, "socialsTitle") ??
          DEFAULT_ABOUT_SETTINGS.socials_title,
        updated_at: settingsEntry.updated_at,
      }
    : DEFAULT_ABOUT_SETTINGS;
  const items = entriesFor("about-content")
    .map((entry): AboutContentItem => {
      const profile = isJsonRecord(entry.profile_data)
        ? entry.profile_data
        : {};
      return {
        body: entryMarkdown(studio, entry.id) || entry.summary || "",
        color_key: stringValue(profile, "colorKey") ?? null,
        created_at: entry.created_at,
        display_order: numberValue(profile, "displayOrder") ?? 0,
        icon_key: stringValue(profile, "iconKey") ?? null,
        id: entry.id,
        is_full_width: booleanValue(profile, "isFullWidth") ?? false,
        section: stringValue(profile, "section") ?? "more_info",
        seed_key: entry.slug,
        subtitle: entry.subtitle,
        title: entry.title,
        updated_at: entry.updated_at,
        url: stringValue(profile, "url") ?? null,
        variant: stringValue(profile, "variant") ?? null,
      } as AboutContentItem;
    })
    .sort((left, right) => left.display_order - right.display_order);
  const faqs = entriesFor("about-faqs")
    .map((entry): AboutFaq => {
      const profile = isJsonRecord(entry.profile_data)
        ? entry.profile_data
        : {};
      return {
        ...profile,
        created_at: stringValue(profile, "created_at") ?? entry.created_at,
        display_order: numberValue(profile, "display_order") ?? 0,
        faq_type:
          stringValue(profile, "faq_type") ??
          stringValue(profile, "faqType") ??
          entry.slug,
        id: entry.id,
        question:
          stringValue(profile, "question") ?? entry.summary ?? entry.title,
        updated_at: stringValue(profile, "updated_at") ?? entry.updated_at,
      } as AboutFaq;
    })
    .sort((left, right) => left.display_order - right.display_order);

  return { faqs, items, settings };
}

function entryBlocks(studio: ExocorpseCmsStudio, entryId: string) {
  return studio.blocks
    .filter((block) => block.entry_id === entryId)
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((block) => ({
      blockType: block.block_type,
      content: block.content,
      id: block.id,
      sortOrder: block.sort_order,
      stableSourceId: block.stable_source_id,
      title: block.title,
    }));
}

const tabConfig = [
  {
    id: "profile",
    label: "Profile",
  },
  {
    id: "about",
    label: "About",
  },
  {
    id: "faq",
    label: "FAQ",
  },
  {
    id: "dni",
    label: "DNI",
  },
  {
    id: "socials",
    label: "Socials",
  },
] as const;

type AdminAboutTab = (typeof tabConfig)[number]["id"];

export default function CmsLegacyAboutWorkspace({
  initialStudio,
}: {
  initialStudio: ExocorpseCmsStudio;
}) {
  const [activeTab, setActiveTab] = useState<AdminAboutTab>("profile");
  const [studio, setStudio] = useState(initialStudio);
  const [mediaPending, setMediaPending] = useState(false);
  const [mediaProgress, setMediaProgress] = useState<{
    fileName: string;
    percentage: number;
  } | null>(null);
  const data = useMemo(() => aboutPageData(studio), [studio]);

  const itemsBySection = useMemo(
    () => groupAboutItemsBySection(data.items),
    [data.items],
  );

  const collection = (slug: string) =>
    studio.collections.find((item) => item.slug === slug);
  const settingsEntry =
    studio.entries.find(
      (entry) =>
        entry.collection_id === collection("about")?.id &&
        entry.slug === "settings",
    ) ??
    studio.entries.find(
      (entry) => entry.collection_id === collection("about")?.id,
    );
  const heroAssets = studio.assets.filter(
    (asset) => asset.entry_id === settingsEntry?.id,
  );

  const replaceBundle = (
    bundle: Awaited<ReturnType<typeof saveAdminCmsEntry>>,
  ) => {
    setStudio((current) => ({
      ...current,
      blocks: [
        ...current.blocks.filter((block) => block.entry_id !== bundle.entry.id),
        ...bundle.blocks,
      ],
      entries: [
        ...current.entries.filter((entry) => entry.id !== bundle.entry.id),
        bundle.entry,
      ],
      relations: [
        ...(current.relations ?? []).filter(
          (relation) => relation.from_entry_id !== bundle.entry.id,
        ),
        ...bundle.relations,
      ],
    }));
  };

  const saveBundle = async (
    payload: Parameters<typeof saveAdminCmsEntry>[0],
    success: string,
  ) => {
    try {
      const bundle = await saveAdminCmsEntry(payload);
      publishCmsContentChanged();
      replaceBundle(bundle);
      toastWithSound.success(success);
    } catch (error) {
      toastWithSound.error(
        error instanceof Error ? error.message : "Failed to save changes",
      );
      throw error;
    }
  };

  const saveSettings = async (updates: Partial<AboutPageSettings>) => {
    if (!settingsEntry) throw new Error("About settings are not available.");
    const profile = isJsonRecord(settingsEntry.profile_data)
      ? settingsEntry.profile_data
      : {};
    const profileData = {
      ...profile,
      aboutUseHeading:
        updates.about_use_heading ?? data.settings.about_use_heading,
      dniIntro: updates.dni_intro ?? data.settings.dni_intro,
      dniTitle: updates.dni_title ?? data.settings.dni_title,
      experiencesHeading:
        updates.experiences_heading ?? data.settings.experiences_heading,
      faqIntro: updates.faq_intro ?? data.settings.faq_intro,
      faqTitle: updates.faq_title ?? data.settings.faq_title,
      favoritesHeading:
        updates.favorites_heading ?? data.settings.favorites_heading,
      heroImageAlt: updates.hero_image_alt ?? data.settings.hero_image_alt,
      heroName: updates.hero_name ?? data.settings.hero_name,
      heroSubtitle: updates.hero_subtitle ?? data.settings.hero_subtitle,
      moreInfoHeading:
        updates.more_info_heading ?? data.settings.more_info_heading,
      socialsIntro: updates.socials_intro ?? data.settings.socials_intro,
      socialsPrimaryUsername:
        updates.socials_primary_username ??
        data.settings.socials_primary_username,
      socialsSecondaryUsername:
        updates.socials_secondary_username ??
        data.settings.socials_secondary_username,
      socialsTitle: updates.socials_title ?? data.settings.socials_title,
    };
    const currentBlocks = entryBlocks(studio, settingsEntry.id);
    const markdownIndex = currentBlocks.findIndex(
      (block) => block.blockType === "markdown",
    );
    const nextBlock = {
      blockType: "markdown",
      content: {
        markdown: updates.hero_bio ?? data.settings.hero_bio,
      } as ExocorpseJson,
      sortOrder: markdownIndex >= 0 ? markdownIndex : currentBlocks.length,
      ...(markdownIndex >= 0
        ? {
            id: currentBlocks[markdownIndex]?.id,
            stableSourceId: currentBlocks[markdownIndex]?.stableSourceId,
            title: currentBlocks[markdownIndex]?.title,
          }
        : {}),
    };
    const blocks =
      markdownIndex >= 0
        ? currentBlocks.map((block, index) =>
            index === markdownIndex ? nextBlock : block,
          )
        : [...currentBlocks, nextBlock];
    await saveBundle(
      {
        blocks,
        entry: {
          collectionId: settingsEntry.collection_id,
          metadata: settingsEntry.metadata,
          profileData,
          scheduledFor: null,
          slug: settingsEntry.slug,
          sortOrder: settingsEntry.sort_order,
          status: settingsEntry.status,
          subtitle: settingsEntry.subtitle,
          summary: updates.hero_bio ?? data.settings.hero_bio,
          title: settingsEntry.title,
        },
        entryId: settingsEntry.id,
        expectedUpdatedAt: settingsEntry.updated_at,
        relations: [],
      },
      "About profile settings updated",
    );
  };

  const saveContentItem = async (
    entry: ExocorpseCmsEntry | undefined,
    updates: Record<string, unknown>,
  ) => {
    const contentCollection = collection("about-content");
    if (!contentCollection) throw new Error("About content is not available.");
    const currentProfile = isJsonRecord(entry?.profile_data)
      ? entry.profile_data
      : {};
    const section = String(
      updates.section ?? currentProfile.section ?? "more_info",
    );
    const body = String(updates.body ?? entry?.summary ?? "");
    const title =
      String(updates.title ?? entry?.title ?? "").trim() ||
      String(updates.subtitle ?? "").trim() ||
      body.trim().slice(0, 96) ||
      "Untitled item";
    const profileData = {
      ...currentProfile,
      colorKey: updates.color_key ? String(updates.color_key) : null,
      displayOrder: Number(updates.display_order ?? 0),
      iconKey: updates.icon_key ? String(updates.icon_key) : null,
      isFullWidth: Boolean(updates.is_full_width),
      section,
      subtitle: updates.subtitle ? String(updates.subtitle) : null,
      url: updates.url ? String(updates.url) : null,
      variant: updates.variant ? String(updates.variant) : null,
    };
    const currentBlocks = entry ? entryBlocks(studio, entry.id) : [];
    const markdownBlock = currentBlocks.find(
      (block) => block.blockType === "markdown",
    );
    await saveBundle(
      {
        blocks: [
          {
            blockType: "markdown",
            content: { markdown: body },
            id: markdownBlock?.id,
            sortOrder: 0,
            stableSourceId: markdownBlock?.stableSourceId,
            title: markdownBlock?.title,
          },
        ],
        entry: {
          collectionId: contentCollection.id,
          metadata: entry?.metadata ?? {},
          profileData,
          scheduledFor: null,
          slug:
            entry?.slug ??
            `${slugify(title) || slugify(section)}-${crypto.randomUUID().slice(0, 8)}`,
          sortOrder: Number(updates.display_order ?? entry?.sort_order ?? 0),
          status: entry?.status ?? "published",
          subtitle: updates.subtitle ? String(updates.subtitle) : null,
          summary: body || null,
          title,
        },
        entryId: entry?.id,
        expectedUpdatedAt: entry?.updated_at,
        relations: [],
      },
      entry ? "About item updated" : "About item created",
    );
  };

  const updateFaq = async (id: string, updates: Record<string, unknown>) => {
    const entry = studio.entries.find((item) => item.id === id);
    if (!entry) throw new Error("FAQ entry was not found.");
    const profile = isJsonRecord(entry.profile_data) ? entry.profile_data : {};
    const question = String(updates.question ?? entry.title).trim();
    await saveBundle(
      {
        blocks: entryBlocks(studio, entry.id),
        entry: {
          collectionId: entry.collection_id,
          metadata: entry.metadata,
          profileData: { ...profile, ...updates, question },
          scheduledFor: null,
          slug: entry.slug,
          sortOrder: Number(updates.display_order ?? entry.sort_order),
          status: entry.status,
          subtitle: entry.subtitle,
          summary: question,
          title: question,
        },
        entryId: entry.id,
        expectedUpdatedAt: entry.updated_at,
        relations: [],
      },
      "FAQ updated",
    );
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteAdminCmsEntry(id);
      publishCmsContentChanged();
      setStudio((current) => ({
        ...current,
        assets: current.assets.filter((asset) => asset.entry_id !== id),
        blocks: current.blocks.filter((block) => block.entry_id !== id),
        entries: current.entries.filter((entry) => entry.id !== id),
        relations: (current.relations ?? []).filter(
          (relation) =>
            relation.from_entry_id !== id && relation.to_entry_id !== id,
        ),
      }));
      toastWithSound.success("About item deleted");
    } catch (error) {
      toastWithSound.error(
        error instanceof Error ? error.message : "Failed to delete item",
      );
      throw error;
    }
  };

  const uploadSettingsAsset = async (file: File) => {
    if (!settingsEntry) return;
    const settingsCollection = collection("about");
    if (!settingsCollection) return;
    if (!file.size) return;
    const replacedAssetIds = heroAssets.map((asset) => asset.id);
    setMediaPending(true);
    setMediaProgress({ fileName: file.name, percentage: 2 });
    try {
      const storagePath = await uploadCmsAssetDirect({
        collectionType: settingsCollection.collection_type,
        entrySlug: settingsEntry.slug,
        file,
        onProgress: (percentage) =>
          setMediaProgress({ fileName: file.name, percentage }),
      });
      setMediaProgress({ fileName: file.name, percentage: 97 });
      const asset = await registerAdminCmsAsset({
        entryId: settingsEntry.id,
        fileName: file.name,
        fileType: file.type,
        storagePath,
      });
      await Promise.all(replacedAssetIds.map(deleteAdminCmsAsset));
      publishCmsContentChanged();
      setStudio((current) => ({
        ...current,
        assets: [
          ...current.assets.filter(
            (item) =>
              item.id !== asset.id && !replacedAssetIds.includes(item.id),
          ),
          asset,
        ],
      }));
      toastWithSound.success(
        replacedAssetIds.length ? "About image replaced" : "About image added",
      );
    } catch (error: unknown) {
      toastWithSound.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setMediaPending(false);
      setMediaProgress(null);
    }
  };

  const deleteSettingsAsset = (assetId: string) => {
    setMediaPending(true);
    void deleteAdminCmsAsset(assetId)
      .then(() => {
        publishCmsContentChanged();
        setStudio((current) => ({
          ...current,
          assets: current.assets.filter((asset) => asset.id !== assetId),
        }));
        toastWithSound.success("Hero image removed");
      })
      .catch((error: unknown) => {
        toastWithSound.error(
          error instanceof Error ? error.message : "Failed to remove image",
        );
      })
      .finally(() => setMediaPending(false));
  };

  const reorderSettingsAssets = (assets: ExocorpseCmsAsset[]) => {
    const ordered = assets.map((asset, sortOrder) => ({
      ...asset,
      sort_order: sortOrder,
    }));
    setStudio((current) => ({
      ...current,
      assets: current.assets.map(
        (asset) => ordered.find((item) => item.id === asset.id) ?? asset,
      ),
    }));
    setMediaPending(true);
    void reorderAdminCmsAssets(
      ordered.map((asset) => ({
        assetId: asset.id,
        sortOrder: asset.sort_order,
      })),
    )
      .then((updated) => {
        publishCmsContentChanged();
        setStudio((current) => ({
          ...current,
          assets: current.assets.map(
            (asset) => updated.find((item) => item.id === asset.id) ?? asset,
          ),
        }));
      })
      .catch((error: unknown) =>
        toastWithSound.error(
          error instanceof Error ? error.message : "Failed to reorder images",
        ),
      )
      .finally(() => setMediaPending(false));
  };

  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return (
          <AboutSettingsForm
            assets={heroAssets}
            mediaPending={mediaPending}
            onDeleteAsset={deleteSettingsAsset}
            onReorderAssets={reorderSettingsAssets}
            settings={data.settings}
            onSave={saveSettings}
            onUploadAsset={uploadSettingsAsset}
          />
        );
      case "about":
        return (
          <div className="space-y-6">
            <AboutContentItemsEditor
              title="What I Use Cards"
              description="Controls the three feature cards inside the public About tab."
              section="about_use_card"
              items={itemsBySection.about_use_card}
              fields={aboutUseFields}
              onCreate={async (payload) => {
                await saveContentItem(undefined, payload);
              }}
              onUpdate={async (id, payload) => {
                await saveContentItem(
                  studio.entries.find((entry) => entry.id === id),
                  payload,
                );
              }}
              onDelete={async (id) => {
                await deleteItem(id);
              }}
            />
            <div className="grid items-start gap-6 xl:grid-cols-2">
              <AboutContentItemsEditor
                title="Experiences"
                section="experience"
                items={itemsBySection.experience}
                fields={experienceFields}
                onCreate={async (payload) => {
                  await saveContentItem(undefined, payload);
                }}
                onUpdate={async (id, payload) => {
                  await saveContentItem(
                    studio.entries.find((entry) => entry.id === id),
                    payload,
                  );
                }}
                onDelete={async (id) => {
                  await deleteItem(id);
                }}
              />
              <AboutContentItemsEditor
                title="More Information"
                section="more_info"
                items={itemsBySection.more_info}
                fields={experienceFields}
                onCreate={async (payload) => {
                  await saveContentItem(undefined, payload);
                }}
                onUpdate={async (id, payload) => {
                  await saveContentItem(
                    studio.entries.find((entry) => entry.id === id),
                    payload,
                  );
                }}
                onDelete={async (id) => {
                  await deleteItem(id);
                }}
              />
            </div>
            <AboutContentItemsEditor
              title="Favorites"
              description="Each row becomes a large favorite card on the public About tab."
              section="favorite"
              items={itemsBySection.favorite}
              fields={favoriteFields}
              onCreate={async (payload) => {
                await saveContentItem(undefined, payload);
              }}
              onUpdate={async (id, payload) => {
                await saveContentItem(
                  studio.entries.find((entry) => entry.id === id),
                  payload,
                );
              }}
              onDelete={async (id) => {
                await deleteItem(id);
              }}
            />
          </div>
        );
      case "faq":
        return (
          <AboutFaqEditor
            data={data}
            onUpdateFaq={async (id, updates) => {
              await updateFaq(id, updates);
            }}
            onCreateItem={async (payload) => {
              await saveContentItem(undefined, payload);
            }}
            onUpdateItem={async (id, updates) => {
              await saveContentItem(
                studio.entries.find((entry) => entry.id === id),
                updates,
              );
            }}
            onDeleteItem={async (id) => {
              await deleteItem(id);
            }}
          />
        );
      case "dni":
        return (
          <div className="grid items-start gap-6 xl:grid-cols-2">
            <AboutContentItemsEditor
              title="Soft DNI Rules"
              description="Preference-based boundaries shown in the yellow panel."
              section="dni_soft"
              items={itemsBySection.dni_soft}
              fields={dniFields}
              onCreate={async (payload) => {
                await saveContentItem(undefined, payload);
              }}
              onUpdate={async (id, payload) => {
                await saveContentItem(
                  studio.entries.find((entry) => entry.id === id),
                  payload,
                );
              }}
              onDelete={async (id) => {
                await deleteItem(id);
              }}
            />
            <AboutContentItemsEditor
              title="Hard DNI Rules"
              description="Hardblock boundaries shown in the red panel."
              section="dni_hard"
              items={itemsBySection.dni_hard}
              fields={dniFields}
              onCreate={async (payload) => {
                await saveContentItem(undefined, payload);
              }}
              onUpdate={async (id, payload) => {
                await saveContentItem(
                  studio.entries.find((entry) => entry.id === id),
                  payload,
                );
              }}
              onDelete={async (id) => {
                await deleteItem(id);
              }}
            />
          </div>
        );
      case "socials":
        return (
          <AboutContentItemsEditor
            title="Social Platform Cards"
            description="Controls the ordering, icon theme, and width of the public social cards."
            section="social_link"
            items={itemsBySection.social_link}
            fields={socialFields}
            onCreate={async (payload) => {
              await saveContentItem(undefined, payload);
            }}
            onUpdate={async (id, payload) => {
              await saveContentItem(
                studio.entries.find((entry) => entry.id === id),
                payload,
              );
            }}
            onDelete={async (id) => {
              await deleteItem(id);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="About" />

      {mediaProgress ? (
        <div
          aria-live="polite"
          className="sticky top-3 z-30 rounded-xl border border-cyan-200 bg-cyan-50/95 px-4 py-3 shadow-lg backdrop-blur dark:border-cyan-900/70 dark:bg-cyan-950/80"
        >
          <div className="flex items-center justify-between gap-3 text-sm font-semibold text-cyan-950 dark:text-cyan-100">
            <span className="truncate">Uploading {mediaProgress.fileName}</span>
            <span>{mediaProgress.percentage}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cyan-950/10 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-500 transition-[width] duration-200"
              style={{ width: `${mediaProgress.percentage}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        <nav
          aria-label="About sections"
          className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950"
        >
          {tabConfig.map((tab) => {
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">{renderTab()}</div>
      </div>
    </div>
  );
}
