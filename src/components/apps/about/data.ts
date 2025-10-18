// Static data for About Me page - moved outside components for performance

export interface ExperienceItem {
  icon: string;
  text: string;
}

export interface FavoriteItem {
  label: string;
  icon: string;
  items: string;
}

export interface SocialMediaLink {
  id: string;
  name: string;
  username: string;
  url: string;
  icon: "tumblr" | "twitch" | "vgen" | "bluesky" | "discord";
  color: "blue" | "purple" | "pink" | "sky" | "indigo";
  fullWidth?: boolean;
}

export interface ImportantLink {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon: "dev" | "canva" | "youtube";
  gradient: string;
  iconColor: string;
  fullWidth?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  type:
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

export const experiences: ExperienceItem[] = [
  { icon: "🎨", text: "Self-taught artist for 10 years" },
  { icon: "✍️", text: "Self-taught writer for 4 years" },
  { icon: "🎮", text: "Undergraduate of RMIT Game Design program" },
  { icon: "💼", text: "Worked on 400+ commissions on VGen" },
  { icon: "📚", text: "Worked as a Merch Artist & Page Artist for 2 fanzines" },
];

export const moreInfo: ExperienceItem[] = [
  { icon: "🇻🇳", text: "I'm fully Vietnamese, but more fluent in English" },
  { icon: "🏳️‍🌈", text: "I'm a queer man (shocker)" },
  { icon: "🎮", text: "I love story-esque games, bonus points if indie!" },
  { icon: "💕", text: "I selfship with fictional characters (not surprising)" },
];

export const favorites: FavoriteItem[] = [
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
];

export const importantLinks: ImportantLink[] = [
  {
    id: "dev-website",
    title: "Development Website",
    subtitle: "dev.exocorpse.net",
    url: "https://dev.exocorpse.net/",
    icon: "dev",
    gradient: "from-cyan-50 to-blue-50",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "canva",
    title: "Canva Design",
    subtitle: "Design resources",
    url: "https://www.canva.com/design/DAG1GXjoP_k/RJsNed_ZA8oWHCFMBLHsAA/edit?utm_content=DAG1GXjoP_k&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    icon: "canva",
    gradient: "from-purple-50 to-pink-50",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "youtube",
    title: "YouTube Introduction",
    subtitle: "Watch my introduction video",
    url: "https://www.youtube.com/watch?v=cmq5yUa6e6s",
    icon: "youtube",
    gradient: "from-red-50 to-orange-50",
    iconColor: "text-red-600 dark:text-red-400",
    fullWidth: true,
  },
];

export const socialMediaLinks: SocialMediaLink[] = [
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
    color: "pink",
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
    fullWidth: true,
  },
];

export const faqs: FaqItem[] = [
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
];

export const artistInspiration = [
  "Ryuki Ryi",
  "Ruintlonewolf",
  "Avogado6",
  "Velinxi",
  "Shigenori Soejima",
  "Zephyo",
];

export const clipStudioBrushes = {
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
];

export const dniHard = [
  "Zionist, nazi, racist, republican, homophobic, xenophobic, proship, pedophilic",
  "Lolicons or shotacons",
  "Dream team / Wilbur Soot supporter",
  "Anti-selfship",
  "You hate Maelle from Expedition 33",
];
