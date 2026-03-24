CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS about_page_settings (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    hero_name TEXT NOT NULL DEFAULT '',
    hero_subtitle TEXT NOT NULL DEFAULT '',
    hero_bio TEXT NOT NULL DEFAULT '',
    hero_image_url TEXT,
    hero_image_alt TEXT NOT NULL DEFAULT 'About Me',
    about_use_heading TEXT NOT NULL DEFAULT 'What I Use',
    experiences_heading TEXT NOT NULL DEFAULT 'Experiences',
    more_info_heading TEXT NOT NULL DEFAULT 'More Information',
    favorites_heading TEXT NOT NULL DEFAULT 'Favorites',
    faq_title TEXT NOT NULL DEFAULT 'Frequently Asked Questions',
    faq_intro TEXT NOT NULL DEFAULT '',
    dni_title TEXT NOT NULL DEFAULT 'Do Not Interact',
    dni_intro TEXT NOT NULL DEFAULT '',
    socials_title TEXT NOT NULL DEFAULT 'Social Media',
    socials_intro TEXT NOT NULL DEFAULT '',
    socials_primary_username TEXT NOT NULL DEFAULT 'exocorpse',
    socials_secondary_username TEXT NOT NULL DEFAULT 'exocorpsehq',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about_faqs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    faq_type TEXT NOT NULL UNIQUE CHECK (
        faq_type IN (
            'programs',
            'brushes',
            'permissions',
            'social',
            'assets',
            'artists',
            'commissions',
            'username',
            'alias'
        )
    ),
    question TEXT NOT NULL DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    programs_text TEXT,
    devices_text TEXT,
    brushes_procreate_text TEXT,
    brushes_paint_tool_sai_text TEXT,
    social_intro_text TEXT,
    social_note_prefix TEXT,
    social_display_name TEXT,
    social_note_suffix TEXT,
    commissions_text TEXT,
    username_prefix_left TEXT,
    username_prefix_right TEXT,
    username_result TEXT,
    alias_primary TEXT,
    alias_secondary TEXT,
    alias_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about_content_items (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    section TEXT NOT NULL CHECK (
        section IN (
            'about_use_card',
            'experience',
            'more_info',
            'favorite',
            'social_link',
            'dni_soft',
            'dni_hard',
            'faq_program_other',
            'faq_brush_inside',
            'faq_brush_outside',
            'faq_permission_allowed',
            'faq_permission_prohibited',
            'faq_asset_credit',
            'faq_artist'
        )
    ),
    variant TEXT,
    title TEXT,
    subtitle TEXT,
    body TEXT NOT NULL DEFAULT '',
    url TEXT,
    icon_key TEXT,
    color_key TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_full_width BOOLEAN NOT NULL DEFAULT FALSE,
    seed_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_about_faqs_display_order
ON about_faqs(display_order);

CREATE INDEX IF NOT EXISTS idx_about_content_items_section_display_order
ON about_content_items(section, display_order);

CREATE TRIGGER update_about_page_settings_updated_at
BEFORE UPDATE ON about_page_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_faqs_updated_at
BEFORE UPDATE ON about_faqs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_content_items_updated_at
BEFORE UPDATE ON about_content_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE "public"."about_page_settings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON "public"."about_page_settings"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."about_page_settings"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."about_page_settings"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON "public"."about_page_settings"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

ALTER TABLE "public"."about_faqs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON "public"."about_faqs"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."about_faqs"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."about_faqs"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON "public"."about_faqs"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

ALTER TABLE "public"."about_content_items" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON "public"."about_content_items"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."about_content_items"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."about_content_items"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON "public"."about_content_items"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

INSERT INTO about_page_settings (
    id,
    hero_name,
    hero_subtitle,
    hero_bio,
    hero_image_url,
    hero_image_alt,
    about_use_heading,
    experiences_heading,
    more_info_heading,
    favorites_heading,
    faq_title,
    faq_intro,
    dni_title,
    dni_intro,
    socials_title,
    socials_intro,
    socials_primary_username,
    socials_secondary_username
) VALUES (
    1,
    'Fenrys & Morris',
    'Freelance Illustrator, Writer & Game Developer',
    'I''m Fenrys & Morris, an illustrator and writer duo in one. I specialize in illustrative works, story & dialogue writing, and sprite work for game development. I try to be a jack of all trades while trying to keep my limits behind creative work as much as possible. Fenrys serves as the artist representative, while Morris as the writer representative. They represent me as a branding and as who I am.',
    '/LykoTwins.webp',
    'About Me',
    'What I Use',
    'Experiences',
    'More Information',
    'Favorites',
    'Frequently Asked Questions',
    'Click on any question to expand the answer',
    'Do Not Interact',
    'Please respect these boundaries',
    'Social Media',
    'Find me on these platforms! All usernames are either',
    'exocorpse',
    'exocorpsehq'
) ON CONFLICT (id) DO UPDATE SET
    hero_name = EXCLUDED.hero_name,
    hero_subtitle = EXCLUDED.hero_subtitle,
    hero_bio = EXCLUDED.hero_bio,
    hero_image_url = EXCLUDED.hero_image_url,
    hero_image_alt = EXCLUDED.hero_image_alt,
    about_use_heading = EXCLUDED.about_use_heading,
    experiences_heading = EXCLUDED.experiences_heading,
    more_info_heading = EXCLUDED.more_info_heading,
    favorites_heading = EXCLUDED.favorites_heading,
    faq_title = EXCLUDED.faq_title,
    faq_intro = EXCLUDED.faq_intro,
    dni_title = EXCLUDED.dni_title,
    dni_intro = EXCLUDED.dni_intro,
    socials_title = EXCLUDED.socials_title,
    socials_intro = EXCLUDED.socials_intro,
    socials_primary_username = EXCLUDED.socials_primary_username,
    socials_secondary_username = EXCLUDED.socials_secondary_username;

INSERT INTO about_faqs (
    faq_type,
    question,
    display_order,
    programs_text,
    devices_text,
    brushes_procreate_text,
    brushes_paint_tool_sai_text,
    social_intro_text,
    social_note_prefix,
    social_display_name,
    social_note_suffix,
    commissions_text,
    username_prefix_left,
    username_prefix_right,
    username_result,
    alias_primary,
    alias_secondary,
    alias_description
) VALUES
    (
        'programs',
        'What programs / devices do you use?',
        0,
        'Paint Tool Sai V2, Clip Studio Paint & Procreate',
        'XP-Pen Artist Pro 24 165Hz Gen 2 & iPad Pro 12.9" 5th Gen',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    ),
    (
        'brushes',
        'What are your brushes?',
        1,
        NULL,
        NULL,
        'Feast''s Paint & Pencil Brushes, Tinderbox, Derwent, Dan092''s Set',
        'Pencil brush with the Fuzystatic Texture',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    ),
    (
        'permissions',
        'What are your permissions when it comes to your art?',
        2,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    ),
    (
        'social',
        'Where can we find you on social media?',
        3,
        NULL,
        NULL,
        NULL,
        NULL,
        'All my usernames are either exocorpse or exocorpsehq, nothing else.',
        'I only list ones where I''m active on, but if they don''t have',
        'Fenrys & Morris',
        'as the display name, that is not me.',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    ),
    (
        'assets',
        'Who made your assets?',
        4,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    ),
    (
        'artists',
        'Which artists inspired your artstyle?',
        5,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    ),
    (
        'commissions',
        'Are your commissions open?',
        6,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'Please check the Commission tab for more information regarding this.',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    ),
    (
        'username',
        'What does your username mean?',
        7,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'Exo',
        'Corpse',
        'Exocorpse',
        NULL,
        NULL,
        NULL
    ),
    (
        'alias',
        'What alias should we refer to you as?',
        8,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'Fenrys',
        'Morris',
        'works, as they represent me as a person, and my branding as a whole.'
    )
ON CONFLICT (faq_type) DO UPDATE SET
    question = EXCLUDED.question,
    display_order = EXCLUDED.display_order,
    programs_text = EXCLUDED.programs_text,
    devices_text = EXCLUDED.devices_text,
    brushes_procreate_text = EXCLUDED.brushes_procreate_text,
    brushes_paint_tool_sai_text = EXCLUDED.brushes_paint_tool_sai_text,
    social_intro_text = EXCLUDED.social_intro_text,
    social_note_prefix = EXCLUDED.social_note_prefix,
    social_display_name = EXCLUDED.social_display_name,
    social_note_suffix = EXCLUDED.social_note_suffix,
    commissions_text = EXCLUDED.commissions_text,
    username_prefix_left = EXCLUDED.username_prefix_left,
    username_prefix_right = EXCLUDED.username_prefix_right,
    username_result = EXCLUDED.username_result,
    alias_primary = EXCLUDED.alias_primary,
    alias_secondary = EXCLUDED.alias_secondary,
    alias_description = EXCLUDED.alias_description;

INSERT INTO about_content_items (
    section,
    title,
    subtitle,
    body,
    url,
    icon_key,
    color_key,
    display_order,
    is_full_width,
    seed_key
) VALUES
    ('about_use_card', 'Programs', NULL, 'Procreate, Clip Studio Paint, Paint Tool Sai V2', NULL, 'palette', NULL, 0, FALSE, 'about-use-programs'),
    ('about_use_card', 'Tools', NULL, 'iPad Pro 12.9 inch 5th Gen, XP-Pen Artist Pro 24 165 Hz 2nd Gen', NULL, 'desktop', NULL, 1, FALSE, 'about-use-tools'),
    ('about_use_card', 'Other Stuff', NULL, 'Vegas Pro 17 (video editing), Live2D + After Effects (puppeting)', NULL, 'pencil', NULL, 2, FALSE, 'about-use-other'),
    ('experience', NULL, NULL, 'Self-taught artist for 10 years', NULL, '🎨', NULL, 0, FALSE, 'experience-artist'),
    ('experience', NULL, NULL, 'Self-taught writer for 4 years', NULL, '✍️', NULL, 1, FALSE, 'experience-writer'),
    ('experience', NULL, NULL, 'Undergraduate of RMIT Game Design program', NULL, '🎮', NULL, 2, FALSE, 'experience-rmit'),
    ('experience', NULL, NULL, 'Worked on 400+ commissions on VGen', NULL, '💼', NULL, 3, FALSE, 'experience-vgen'),
    ('experience', NULL, NULL, 'Worked as a Merch Artist & Page Artist for 2 fanzines', NULL, '📚', NULL, 4, FALSE, 'experience-fanzines'),
    ('more_info', NULL, NULL, 'I''m fully Vietnamese, but more fluent in English', NULL, '🇻🇳', NULL, 0, FALSE, 'more-info-vietnamese'),
    ('more_info', NULL, NULL, 'I''m a queer man (shocker)', NULL, '🏳️‍🌈', NULL, 1, FALSE, 'more-info-queer'),
    ('more_info', NULL, NULL, 'I love story-esque games, bonus points if indie!', NULL, '🎮', NULL, 2, FALSE, 'more-info-games'),
    ('more_info', NULL, NULL, 'I selfship with fictional characters (not surprising)', NULL, '💕', NULL, 3, FALSE, 'more-info-selfship'),
    ('favorite', 'Games', NULL, 'Umamusume, Expedition 33, AI: The Somnium Files, Until Dawn, Persona, Minecraft, Overwatch, Phasmophobia', NULL, '🎮', NULL, 0, FALSE, 'favorite-games'),
    ('favorite', 'Musicians', NULL, 'Crywolf, MNQN, Starset, Porter Robinson, Mili, NateWantsToBattle', NULL, '🎵', NULL, 1, FALSE, 'favorite-musicians'),
    ('favorite', 'Media', NULL, 'Le Petit Prince, Blade Runner 2049, Arcane, Umamusume: Cinderella Gray, Violet Evergarden, Belle, Look Back', NULL, '📺', NULL, 2, FALSE, 'favorite-media'),
    ('favorite', 'Characters', NULL, 'Gustave, Maelle; Jayce; Aiba, Mizuki Date; Oguri Cap, Narita Taishin, Narita Brian, Haru Urara; Reaper, Soldier 76, Pharah, Sigma, Moira; Shinjiro Aragaki, Akihiko Sanada, Joker', NULL, '⭐', NULL, 3, FALSE, 'favorite-characters'),
    ('social_link', 'Tumblr', 'exocorpsehq', '', 'https://exocorpsehq.tumblr.com/', 'tumblr', 'blue', 0, FALSE, 'social-tumblr'),
    ('social_link', 'Twitch', 'exocorpsehq', '', 'https://www.twitch.tv/exocorpsehq', 'twitch', 'purple', 1, FALSE, 'social-twitch'),
    ('social_link', 'VGen', 'exocorpse', '', 'https://vgen.co/exocorpse', 'vgen', 'vgen', 2, FALSE, 'social-vgen'),
    ('social_link', 'Bluesky', '@exocorpse.bsky.social', '', 'https://bsky.app/profile/exocorpse.bsky.social', 'bluesky', 'sky', 3, FALSE, 'social-bluesky'),
    ('social_link', 'Discord Server', 'discord.gg/exocorpse', '', 'https://discord.gg/exocorpse', 'discord', 'indigo', 4, FALSE, 'social-discord'),
    ('social_link', 'Twitter', 'exocorpsehq', '', 'https://x.com/exocorpsehq', 'twitter', 'blue', 5, FALSE, 'social-twitter'),
    ('dni_soft', NULL, NULL, 'Anybody under 16', NULL, NULL, NULL, 0, FALSE, 'dni-soft-under-16'),
    ('dni_soft', NULL, NULL, 'You hate any of my favorites', NULL, NULL, NULL, 1, FALSE, 'dni-soft-favorites'),
    ('dni_soft', NULL, NULL, 'You get mad at my jokes against Americans', NULL, NULL, NULL, 2, FALSE, 'dni-soft-americans'),
    ('dni_soft', NULL, NULL, 'You like Kasumi Yoshizawa (Persona) or Iris Sagan (AITSF)', NULL, NULL, NULL, 3, FALSE, 'dni-soft-kasumi'),
    ('dni_hard', NULL, NULL, 'Zionist, nazi, racist, republican, homophobic, xenophobic, proship, pedophilic', NULL, NULL, NULL, 0, FALSE, 'dni-hard-bigotry'),
    ('dni_hard', NULL, NULL, 'Lolicons or shotacons', NULL, NULL, NULL, 1, FALSE, 'dni-hard-lolicon'),
    ('dni_hard', NULL, NULL, 'Dream team / Wilbur Soot supporter', NULL, NULL, NULL, 2, FALSE, 'dni-hard-dream'),
    ('dni_hard', NULL, NULL, 'Anti-selfship', NULL, NULL, NULL, 3, FALSE, 'dni-hard-anti-selfship'),
    ('dni_hard', NULL, NULL, 'You hate Maelle from Expedition 33', NULL, NULL, NULL, 4, FALSE, 'dni-hard-maelle'),
    ('faq_program_other', 'Video Editing / Puppeting', NULL, 'Vegas Pro 17, After Effects, Live2D', NULL, NULL, NULL, 0, FALSE, 'faq-program-other-video'),
    ('faq_program_other', 'Writing', NULL, 'Ellipsus & ZenWriter', NULL, NULL, NULL, 1, FALSE, 'faq-program-other-writing'),
    ('faq_brush_inside', 'ggpen', NULL, '', 'https://assets.clip-studio.com/en-us/detail?id=1762452', NULL, NULL, 0, FALSE, 'faq-brush-inside-ggpen'),
    ('faq_brush_inside', 'Found Pencil', NULL, '', 'https://assets.clip-studio.com/en-us/detail?id=1876673', NULL, NULL, 1, FALSE, 'faq-brush-inside-found-pencil'),
    ('faq_brush_inside', 'HibiRough', NULL, '', 'https://assets.clip-studio.com/en-us/detail?id=1764501', NULL, NULL, 2, FALSE, 'faq-brush-inside-hibirough'),
    ('faq_brush_inside', 'Real G-Pen', NULL, '', NULL, NULL, NULL, 3, FALSE, 'faq-brush-inside-real-g-pen'),
    ('faq_brush_outside', 'Yizheng Ke', NULL, '', 'https://www.mediafire.com/file/rk0nh415xvn1e6d/yizhengKE.abr/file', NULL, NULL, 0, FALSE, 'faq-brush-outside-yizheng'),
    ('faq_brush_outside', 'MINJYE''s Pentagram', NULL, '', 'https://pxplus.io/en/product/2850/detail', NULL, NULL, 1, FALSE, 'faq-brush-outside-minjye'),
    ('faq_brush_outside', 'Nekojira', NULL, '', 'https://www.youtube.com/@nekojira425/featured', NULL, NULL, 2, FALSE, 'faq-brush-outside-nekojira'),
    ('faq_brush_outside', 'QMENG', NULL, '', 'https://www.postype.com/@q-meng/series/1066317', NULL, NULL, 3, FALSE, 'faq-brush-outside-qmeng'),
    ('faq_permission_allowed', 'Profile layouts / video edits / fanfiction, personal printing', NULL, 'All OK! Make sure it has direct credit to me!', NULL, NULL, NULL, 0, FALSE, 'faq-permission-allowed-layouts'),
    ('faq_permission_allowed', 'Material for learning / studying', NULL, 'All OK! Make sure it has direct credit to me (and tag me too! I''d love to see it)', NULL, NULL, NULL, 1, FALSE, 'faq-permission-allowed-learning'),
    ('faq_permission_allowed', 'Reposting', NULL, 'Only with direct credit to me, otherwise prohibited', NULL, NULL, NULL, 2, FALSE, 'faq-permission-allowed-reposting'),
    ('faq_permission_prohibited', 'Commercial printing', NULL, 'Prohibited, unless you''re a client that has purchased said rights to an artwork you''ve commissioned from me', NULL, NULL, NULL, 0, FALSE, 'faq-permission-prohibited-commercial'),
    ('faq_permission_prohibited', 'Edits on artwork, AI and NFT', NULL, 'Prohibited', NULL, NULL, NULL, 1, FALSE, 'faq-permission-prohibited-ai'),
    ('faq_asset_credit', 'Logo', 'PrimaRoxas', '', 'https://vgen.co/PrimaRoxas', NULL, NULL, 0, FALSE, 'faq-asset-logo'),
    ('faq_asset_credit', 'Website', 'Tuturuuu', '', 'https://tuturuuu.com/?no-redirect=1', NULL, NULL, 1, FALSE, 'faq-asset-website'),
    ('faq_artist', 'Ryuki Ryi', NULL, '', NULL, NULL, NULL, 0, FALSE, 'faq-artist-ryuki'),
    ('faq_artist', 'Ruintlonewolf', NULL, '', NULL, NULL, NULL, 1, FALSE, 'faq-artist-ruintlonewolf'),
    ('faq_artist', 'Avogado6', NULL, '', NULL, NULL, NULL, 2, FALSE, 'faq-artist-avogado6'),
    ('faq_artist', 'Velinxi', NULL, '', NULL, NULL, NULL, 3, FALSE, 'faq-artist-velinxi'),
    ('faq_artist', 'Shigenori Soejima', NULL, '', NULL, NULL, NULL, 4, FALSE, 'faq-artist-soejima'),
    ('faq_artist', 'Zephyo', NULL, '', NULL, NULL, NULL, 5, FALSE, 'faq-artist-zephyo')
ON CONFLICT (seed_key) DO UPDATE SET
    section = EXCLUDED.section,
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    body = EXCLUDED.body,
    url = EXCLUDED.url,
    icon_key = EXCLUDED.icon_key,
    color_key = EXCLUDED.color_key,
    display_order = EXCLUDED.display_order,
    is_full_width = EXCLUDED.is_full_width;
