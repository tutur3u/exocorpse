"use client";

import AboutContentItemsEditor, {
  type ContentFieldConfig,
} from "@/components/admin/about/AboutContentItemsEditor";
import AboutFaqEditor from "@/components/admin/about/AboutFaqEditor";
import AboutSettingsForm from "@/components/admin/about/AboutSettingsForm";
import {
  createAboutContentItem,
  deleteAboutContentItem,
  getAboutAdminData,
  updateAboutContentItem,
  updateAboutFaq,
  updateAboutPageSettings,
} from "@/lib/actions/about";
import {
  ABOUT_SOCIAL_COLOR_KEYS,
  ABOUT_SOCIAL_ICON_KEYS,
  ABOUT_USE_ICON_KEYS,
  groupAboutItemsBySection,
  type AboutPageData,
} from "@/lib/about";
import toastWithSound from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { TablesInsert, TablesUpdate } from "../../../../supabase/types";

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
  { key: "display_order", label: "Display Order", type: "number" },
];

const experienceFields: ContentFieldConfig[] = [
  { key: "icon_key", label: "Emoji/Icon", type: "text" },
  { key: "body", label: "Text", type: "textarea", rows: 3 },
  { key: "display_order", label: "Display Order", type: "number" },
];

const favoriteFields: ContentFieldConfig[] = [
  { key: "title", label: "Category", type: "text" },
  { key: "icon_key", label: "Emoji/Icon", type: "text" },
  { key: "body", label: "Items", type: "textarea", rows: 4 },
  { key: "display_order", label: "Display Order", type: "number" },
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
  { key: "display_order", label: "Display Order", type: "number" },
];

const dniFields: ContentFieldConfig[] = [
  { key: "body", label: "Rule Text", type: "textarea", rows: 3 },
  { key: "display_order", label: "Display Order", type: "number" },
];

const tabConfig = [
  {
    id: "profile",
    label: "Profile",
    eyebrow: "Hero, copy, section titles",
  },
  {
    id: "about",
    label: "About",
    eyebrow: "Use cards, experiences, favorites",
  },
  {
    id: "faq",
    label: "FAQ",
    eyebrow: "Fixed FAQ renderers",
  },
  {
    id: "dni",
    label: "DNI",
    eyebrow: "Soft and hard boundaries",
  },
  {
    id: "socials",
    label: "Socials",
    eyebrow: "Platform cards and colors",
  },
] as const;

type AdminAboutTab = (typeof tabConfig)[number]["id"];

export default function AboutClient({
  initialData,
}: {
  initialData: AboutPageData;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminAboutTab>("profile");

  const { data = initialData, isLoading } = useQuery({
    queryKey: ["admin-about"],
    queryFn: getAboutAdminData,
    initialData,
  });

  const itemsBySection = useMemo(
    () => groupAboutItemsBySection(data.items),
    [data.items],
  );

  const invalidateAboutQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-about"] }),
      queryClient.invalidateQueries({ queryKey: ["about-page"] }),
    ]);
  };

  const settingsMutation = useMutation({
    mutationFn: updateAboutPageSettings,
    onSuccess: async () => {
      await invalidateAboutQueries();
      toastWithSound.success("About profile settings updated");
    },
    onError: (error: Error) => {
      toastWithSound.error(
        error.message || "Failed to update profile settings",
      );
    },
  });

  const faqMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Record<string, unknown>;
    }) => updateAboutFaq(id, updates as Partial<TablesUpdate<"about_faqs">>),
    onSuccess: async () => {
      await invalidateAboutQueries();
      toastWithSound.success("FAQ updated");
    },
    onError: (error: Error) => {
      toastWithSound.error(error.message || "Failed to update FAQ");
    },
  });

  const createItemMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      createAboutContentItem(payload as TablesInsert<"about_content_items">),
    onSuccess: async () => {
      await invalidateAboutQueries();
      toastWithSound.success("About item created");
    },
    onError: (error: Error) => {
      toastWithSound.error(error.message || "Failed to create item");
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Record<string, unknown>;
    }) =>
      updateAboutContentItem(
        id,
        updates as Partial<TablesUpdate<"about_content_items">>,
      ),
    onSuccess: async () => {
      await invalidateAboutQueries();
      toastWithSound.success("About item updated");
    },
    onError: (error: Error) => {
      toastWithSound.error(error.message || "Failed to update item");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteAboutContentItem,
    onSuccess: async () => {
      await invalidateAboutQueries();
      toastWithSound.success("About item deleted");
    },
    onError: (error: Error) => {
      toastWithSound.error(error.message || "Failed to delete item");
    },
  });

  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return (
          <AboutSettingsForm
            settings={data.settings}
            onSave={async (updates) => {
              await settingsMutation.mutateAsync(updates);
            }}
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
                await createItemMutation.mutateAsync(payload);
              }}
              onUpdate={async (id, payload) => {
                await updateItemMutation.mutateAsync({ id, updates: payload });
              }}
              onDelete={async (id) => {
                await deleteItemMutation.mutateAsync(id);
              }}
            />
            <div className="grid gap-6 xl:grid-cols-2">
              <AboutContentItemsEditor
                title="Experiences"
                section="experience"
                items={itemsBySection.experience}
                fields={experienceFields}
                onCreate={async (payload) => {
                  await createItemMutation.mutateAsync(payload);
                }}
                onUpdate={async (id, payload) => {
                  await updateItemMutation.mutateAsync({
                    id,
                    updates: payload,
                  });
                }}
                onDelete={async (id) => {
                  await deleteItemMutation.mutateAsync(id);
                }}
              />
              <AboutContentItemsEditor
                title="More Information"
                section="more_info"
                items={itemsBySection.more_info}
                fields={experienceFields}
                onCreate={async (payload) => {
                  await createItemMutation.mutateAsync(payload);
                }}
                onUpdate={async (id, payload) => {
                  await updateItemMutation.mutateAsync({
                    id,
                    updates: payload,
                  });
                }}
                onDelete={async (id) => {
                  await deleteItemMutation.mutateAsync(id);
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
                await createItemMutation.mutateAsync(payload);
              }}
              onUpdate={async (id, payload) => {
                await updateItemMutation.mutateAsync({ id, updates: payload });
              }}
              onDelete={async (id) => {
                await deleteItemMutation.mutateAsync(id);
              }}
            />
          </div>
        );
      case "faq":
        return (
          <AboutFaqEditor
            data={data}
            onUpdateFaq={async (id, updates) => {
              await faqMutation.mutateAsync({ id, updates });
            }}
            onCreateItem={async (payload) => {
              await createItemMutation.mutateAsync(payload);
            }}
            onUpdateItem={async (id, updates) => {
              await updateItemMutation.mutateAsync({ id, updates });
            }}
            onDeleteItem={async (id) => {
              await deleteItemMutation.mutateAsync(id);
            }}
          />
        );
      case "dni":
        return (
          <div className="grid gap-6 xl:grid-cols-2">
            <AboutContentItemsEditor
              title="Soft DNI Rules"
              description="Preference-based boundaries shown in the yellow panel."
              section="dni_soft"
              items={itemsBySection.dni_soft}
              fields={dniFields}
              onCreate={async (payload) => {
                await createItemMutation.mutateAsync(payload);
              }}
              onUpdate={async (id, payload) => {
                await updateItemMutation.mutateAsync({ id, updates: payload });
              }}
              onDelete={async (id) => {
                await deleteItemMutation.mutateAsync(id);
              }}
            />
            <AboutContentItemsEditor
              title="Hard DNI Rules"
              description="Hardblock boundaries shown in the red panel."
              section="dni_hard"
              items={itemsBySection.dni_hard}
              fields={dniFields}
              onCreate={async (payload) => {
                await createItemMutation.mutateAsync(payload);
              }}
              onUpdate={async (id, payload) => {
                await updateItemMutation.mutateAsync({ id, updates: payload });
              }}
              onDelete={async (id) => {
                await deleteItemMutation.mutateAsync(id);
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
              await createItemMutation.mutateAsync(payload);
            }}
            onUpdate={async (id, payload) => {
              await updateItemMutation.mutateAsync({ id, updates: payload });
            }}
            onDelete={async (id) => {
              await deleteItemMutation.mutateAsync(id);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-gray-200 bg-linear-to-br from-white via-white to-cyan-50 p-8 shadow-sm dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-cyan-950/20">
        <p className="text-xs font-semibold tracking-[0.25em] text-cyan-700 uppercase dark:text-cyan-400">
          About Management
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              About Me Admin
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
              This page manages the public About Me window end-to-end: hero
              copy, section labels, bespoke FAQ renderers, DNI rules, and social
              cards. Changes revalidate both the homepage and this admin route.
            </p>
          </div>
          <div className="rounded-full border border-cyan-200 bg-white/90 px-4 py-2 text-xs font-medium tracking-[0.2em] text-cyan-700 uppercase shadow-sm dark:border-cyan-900/60 dark:bg-gray-950/90 dark:text-cyan-400">
            {data.items.length} managed rows
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[1.75rem] border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="space-y-2">
            {tabConfig.map((tab) => {
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-cyan-300 bg-cyan-50 shadow-sm dark:border-cyan-800 dark:bg-cyan-950/30"
                      : "border-transparent bg-gray-50 hover:border-gray-200 hover:bg-white dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-950"
                  }`}
                >
                  <p className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
                    {tab.eyebrow}
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                    {tab.label}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0">
          {isLoading ? (
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
              Loading about content...
            </div>
          ) : (
            renderTab()
          )}
        </div>
      </div>
    </div>
  );
}
