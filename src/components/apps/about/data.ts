// Static data for About Me page - moved outside components for performance

export interface ExperienceItem {
  readonly icon: string;
  readonly text: string;
}

export interface FavoriteItem {
  readonly label: string;
  readonly icon: string;
  readonly items: string;
}

export interface SocialMediaLink {
  readonly id: string;
  readonly name: string;
  readonly username: string;
  readonly url: string;
  readonly icon:
    | "tumblr"
    | "twitch"
    | "vgen"
    | "bluesky"
    | "discord"
    | "twitter";
  readonly color: "blue" | "purple" | "pink" | "sky" | "indigo" | "vgen";
  readonly fullWidth?: boolean;
}

export interface ImportantLink {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly url: string;
  readonly icon: "dev" | "canva" | "youtube";
  readonly gradient: string;
  readonly iconColor: string;
  readonly fullWidth?: boolean;
}

export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly type:
    | "programs"
    | "brushes"
    | "permissions"
    | "social"
    | "assets"
    | "artists"
    | "commissions"
    | "username"
    | "alias";
}

export interface BrushItem {
  readonly name: string;
  readonly url: string | null;
}

export interface ClipStudioBrushes {
  readonly inside: ReadonlyArray<BrushItem>;
  readonly outside: ReadonlyArray<BrushItem>;
}

export const experiences: ReadonlyArray<ExperienceItem> = [
  { icon: "🎨", text: "Self-taught artist for 10 years" },
  { icon: "✍️", text: "Self-taught writer for 4 years" },
  { icon: "🎮", text: "Undergraduate of RMIT Game Design program" },
  { icon: "💼", text: "Worked on 400+ commissions on VGen" },
  { icon: "📚", text: "Worked as a Merch Artist & Page Artist for 2 fanzines" },
] as const;

export const moreInfo: ReadonlyArray<ExperienceItem> = [
  { icon: "🇻🇳", text: "I'm fully Vietnamese, but more fluent in English" },
  { icon: "🏳️‍🌈", text: "I'm a queer man (shocker)" },
  { icon: "🎮", text: "I love story-esque games, bonus points if indie!" },
  { icon: "💕", text: "I selfship with fictional characters (not surprising)" },
] as const;

export const favorites: ReadonlyArray<FavoriteItem> = [
  {
    label: "Games",
    icon: "🎮",
    items:
      "Umamusume, Expedition 33, AI: The Somnium Files, Until Dawn, Persona, Minecraft, Overwatch, Phasmophobia",
  },
  {
    label: "Musicians",
    icon: "🎵",
    items: "Crywolf, MNQN, Starset, Porter Robinson, Mili, NateWantsToBattle",
  },
  {
    label: "Media",
    icon: "📺",
    items:
      "Le Petit Prince, Blade Runner 2049, Arcane, Umamusume: Cinderella Gray, Violet Evergarden, Belle, Look Back",
  },
  {
    label: "Characters",
    icon: "⭐",
    items:
      "Gustave, Maelle; Jayce; Aiba, Mizuki Date; Oguri Cap, Narita Taishin, Narita Brian, Haru Urara; Reaper, Soldier 76, Pharah, Sigma, Moira; Shinjiro Aragaki, Akihiko Sanada, Joker",
  },
] as const;

export const socialMediaLinks: ReadonlyArray<SocialMediaLink> = [
  {
    id: "tumblr",
    name: "Tumblr",
    username: "exocorpsehq",
    url: "https://exocorpsehq.tumblr.com/",
    icon: "tumblr",
    color: "blue",
  },
  {
    id: "twitch",
    name: "Twitch",
    username: "exocorpsehq",
    url: "https://www.twitch.tv/exocorpsehq",
    icon: "twitch",
    color: "purple",
  },
  {
    id: "vgen",
    name: "VGen",
    username: "exocorpse",
    url: "https://vgen.co/exocorpse",
    icon: "vgen",
    color: "vgen",
  },
  {
    id: "bluesky",
    name: "Bluesky",
    username: "@exocorpse.bsky.social",
    url: "https://bsky.app/profile/exocorpse.bsky.social",
    icon: "bluesky",
    color: "sky",
  },
  {
    id: "discord",
    name: "Discord Server",
    username: "discord.gg/exocorpse",
    url: "https://discord.gg/exocorpse",
    icon: "discord",
    color: "indigo",
  },
  {
    id: "twitter",
    name: "Twitter",
    username: "exocorpsehq",
    url: "https://x.com/exocorpsehq",
    icon: "twitter",
    color: "blue",
  },
] as const;

export const faqs: ReadonlyArray<FaqItem> = [
  {
    id: "programs",
    question: "What programs / devices do you use?",
    type: "programs",
  },
  { id: "brushes", question: "What are your brushes?", type: "brushes" },
  {
    id: "permissions",
    question: "What are your permissions when it comes to your art?",
    type: "permissions",
  },
  {
    id: "social",
    question: "Where can we find you on social media?",
    type: "social",
  },
  { id: "assets", question: "Who made your assets?", type: "assets" },
  {
    id: "artists",
    question: "Which artists inspired your artstyle?",
    type: "artists",
  },
  {
    id: "commissions",
    question: "Are your commissions open?",
    type: "commissions",
  },
  {
    id: "username",
    question: "What does your username mean?",
    type: "username",
  },
  {
    id: "alias",
    question: "What alias should we refer to you as?",
    type: "alias",
  },
] as const;

export const artistInspiration = [
  "Ryuki Ryi",
  "Ruintlonewolf",
  "Avogado6",
  "Velinxi",
  "Shigenori Soejima",
  "Zephyo",
] as const;

export const clipStudioBrushes: ClipStudioBrushes = {
  inside: [
    {
      name: "ggpen",
      url: "https://assets.clip-studio.com/en-us/detail?id=1762452",
    },
    {
      name: "Found Pencil",
      url: "https://assets.clip-studio.com/en-us/detail?id=1876673",
    },
    {
      name: "HibiRough",
      url: "https://assets.clip-studio.com/en-us/detail?id=1764501",
    },
    { name: "Real G-Pen", url: null },
  ],
  outside: [
    {
      name: "Yizheng Ke",
      url: "https://www.mediafire.com/file/rk0nh415xvn1e6d/yizhengKE.abr/file",
    },
    {
      name: "MINJYE's Pentagram",
      url: "https://pxplus.io/en/product/2850/detail",
    },
    { name: "Nekojira", url: "https://www.youtube.com/@nekojira425/featured" },
    { name: "QMENG", url: "https://www.postype.com/@q-meng/series/1066317" },
  ],
};

export const dniSoft = [
  "Anybody under 16",
  "You hate any of my favorites",
  "You get mad at my jokes against Americans",
  "You like Kasumi Yoshizawa (Persona) or Iris Sagan (AITSF)",
] as const;

export const dniHard = [
  "Zionist, nazi, racist, republican, homophobic, xenophobic, proship, pedophilic",
  "Lolicons or shotacons",
  "Dream team / Wilbur Soot supporter",
  "Anti-selfship",
  "You hate Maelle from Expedition 33",
] as const;
