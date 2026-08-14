export const WIKI_DESKTOP_EXPERIENCE_EVENT = "exocorpse:wiki-experience";

export type WikiDesktopExperience = {
  backgroundImage: string | null;
  soundtrackUrl: string | null;
  storyTitle: string | null;
};

export const DEFAULT_WIKI_DESKTOP_EXPERIENCE: WikiDesktopExperience = {
  backgroundImage: null,
  soundtrackUrl: null,
  storyTitle: null,
};

export function publishWikiDesktopExperience(detail: WikiDesktopExperience) {
  window.dispatchEvent(
    new CustomEvent<WikiDesktopExperience>(WIKI_DESKTOP_EXPERIENCE_EVENT, {
      detail,
    }),
  );
}
