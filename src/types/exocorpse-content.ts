export type ExocorpseJson =
  | string
  | number
  | boolean
  | null
  | { [key: string]: ExocorpseJson | undefined }
  | ExocorpseJson[];

type AuditFields = {
  created_at: string;
  updated_at: string;
};

export interface AboutPageSettings extends AuditFields {
  id: number;
  hero_name: string;
  hero_subtitle: string;
  hero_bio: string;
  hero_image_url: string | null;
  hero_image_alt: string;
  about_use_heading: string;
  experiences_heading: string;
  more_info_heading: string;
  favorites_heading: string;
  faq_title: string;
  faq_intro: string;
  dni_title: string;
  dni_intro: string;
  socials_title: string;
  socials_intro: string;
  socials_primary_username: string;
  socials_secondary_username: string;
}

export interface AboutFaq extends AuditFields {
  id: string;
  display_order: number;
  faq_type: string;
  question: string;
  programs_text: string | null;
  devices_text: string | null;
  brushes_procreate_text: string | null;
  brushes_paint_tool_sai_text: string | null;
  social_intro_text: string | null;
  social_note_prefix: string | null;
  social_display_name: string | null;
  social_note_suffix: string | null;
  commissions_text: string | null;
  username_template: string | null;
  username_prefix_left: string | null;
  username_prefix_right: string | null;
  username_result: string | null;
  alias_primary: string | null;
  alias_secondary: string | null;
  alias_description: string | null;
}

export interface AboutContentItem extends AuditFields {
  id: string;
  body: string;
  color_key: string | null;
  display_order: number;
  icon_key: string | null;
  is_full_width: boolean;
  section: string;
  seed_key: string | null;
  subtitle: string | null;
  title: string;
  url: string | null;
  variant: string | null;
}

export interface Story extends AuditFields {
  id: string;
  content: string | null;
  created_by: string | null;
  deleted_at: string | null;
  description: string | null;
  is_published: boolean;
  slug: string;
  summary: string | null;
  theme_background_image: string | null;
  theme_primary_color: string | null;
  theme_secondary_color: string | null;
  theme_text_color: string | null;
  title: string;
  updated_by: string | null;
  visibility: "public" | "unlisted" | "private";
}

export interface World extends AuditFields {
  id: string;
  content: string | null;
  created_by: string | null;
  deleted_at: string | null;
  description: string | null;
  name: string;
  population: number | null;
  size: string | null;
  slug: string;
  story_id: string;
  summary: string | null;
  theme_background_image: string | null;
  theme_primary_color: string | null;
  theme_secondary_color: string | null;
  theme_text_color: string | null;
  world_type: string | null;
}

export interface Character extends AuditFields {
  id: string;
  abilities: string | null;
  age: number | null;
  backstory: string | null;
  banner_image: string | null;
  birthday: string | null;
  build: string | null;
  color_palette: string[] | null;
  created_by: string | null;
  deleted_at: string | null;
  description: string | null;
  distinguishing_features: string | null;
  eye_color: string | null;
  fanwork_policy: string | null;
  featured_image: string | null;
  gender: string | null;
  hair_color: string | null;
  height: string | null;
  lore: string | null;
  name: string;
  nickname: string | null;
  occupation: string | null;
  personality_summary: string | null;
  profile_image: string | null;
  pronouns: string | null;
  quote: string | null;
  skin_tone: string | null;
  slug: string;
  species: string | null;
  spotify_link: string | null;
  status: string | null;
  theme_primary_color: string | null;
  theme_secondary_color: string | null;
  theme_text_color: string | null;
  weight: string | null;
}

export interface CharacterDetail extends Character {
  factions: ExocorpseJson | null;
  world_ids: ExocorpseJson;
}

export interface Faction extends AuditFields {
  id: string;
  banner_image: string | null;
  content: string | null;
  created_by: string | null;
  deleted_at: string | null;
  description: string | null;
  faction_type: string | null;
  founding_date: string | null;
  ideology: string | null;
  logo_url: string | null;
  member_count: number | null;
  name: string;
  parent_faction_id: string | null;
  power_level: string | null;
  primary_goal: string | null;
  reputation: string | null;
  slug: string;
  status: string | null;
  summary: string | null;
  theme_primary_color: string | null;
  theme_secondary_color: string | null;
  theme_text_color: string | null;
  world_id: string | null;
}

export interface Location extends AuditFields {
  id: string;
  banner_image: string | null;
  created_by: string | null;
  deleted_at: string | null;
  description: string | null;
  geography: string | null;
  history: string | null;
  image_url: string | null;
  map_image: string | null;
  name: string;
  parent_location_id: string | null;
  slug: string;
  summary: string | null;
  world_id: string;
}

export interface ArtPiece extends AuditFields {
  id: string;
  artist_name: string | null;
  artist_url: string | null;
  created_date: string | null;
  deleted_at: string | null;
  description: string | null;
  display_order: number | null;
  image_url: string;
  is_featured: boolean | null;
  slug: string;
  tags: string[] | null;
  thumbnail_url: string | null;
  title: string;
  year: number | null;
}

export interface WritingPiece extends AuditFields {
  id: string;
  content: string;
  cover_image: string | null;
  created_date: string | null;
  deleted_at: string | null;
  display_order: number | null;
  excerpt: string | null;
  is_featured: boolean | null;
  slug: string;
  tags: string[] | null;
  thumbnail_url: string | null;
  title: string;
  word_count: number | null;
  year: number | null;
}

export interface GamePiece extends AuditFields {
  id: string;
  cover_image_url: string | null;
  description: string | null;
  game_url: string | null;
  slug: string;
  title: string;
}

export interface GamePieceGalleryImage extends AuditFields {
  id: string;
  description: string | null;
  display_order: number;
  game_piece_id: string;
  image_url: string;
}

export interface BlogPost extends AuditFields {
  id: string;
  content: string;
  cover_url: string | null;
  excerpt: string | null;
  published_at: string | null;
  slug: string;
  title: string;
}

export interface Addon {
  addon_id: string;
  description: string | null;
  is_exclusive: boolean;
  name: string;
  percentage: boolean;
  price_impact: number;
}

export interface Picture {
  caption: string | null;
  image_url: string;
  is_primary_example: boolean;
  picture_id: string;
  service_id: string;
  style_id: string | null;
  uploaded_at: string | null;
}

export interface Style {
  description: string | null;
  name: string;
  service_id: string;
  slug: string;
  style_id: string;
}

export interface ServiceAddon {
  addon_id: string;
  addon_is_exclusive: boolean;
  service_id: string;
}

export interface Service {
  addons?: Addon[];
  base_price: number;
  comm_link: string | null;
  cover_image_url: string | null;
  created_at: string;
  description: string | null;
  is_active: boolean;
  name: string;
  pictures?: Picture[];
  service_addons?: Array<ServiceAddon & { addons?: Addon }>;
  service_id: string;
  slug: string;
  styles?: Array<Style & { pictures?: Picture[] }>;
}

export type ExocorpseTables = {
  about_page_settings: AboutPageSettings;
  about_faqs: AboutFaq;
  about_content_items: AboutContentItem;
  stories: Story;
  worlds: World;
  characters: Character;
  character_details: CharacterDetail;
  factions: Faction;
  locations: Location;
  art_pieces: ArtPiece;
  writing_pieces: WritingPiece;
  game_pieces: GamePiece;
  game_piece_gallery_images: GamePieceGalleryImage;
  blog_posts: BlogPost;
  addons: Addon;
  pictures: Picture;
  styles: Style;
  service_addons: ServiceAddon;
  services: Service;
};

export type ExocorpseTable<Name extends keyof ExocorpseTables> =
  ExocorpseTables[Name];
