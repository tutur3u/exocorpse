-- ============================================================================
-- EXOCORPSE FANTASY WIKI SEED DATA
-- ============================================================================
-- Sample data for the Exocorpse story universe
-- ============================================================================

-- ============================================================================
-- DEFAULT RELATIONSHIP TYPES (Global)
-- ============================================================================

-- Populate auth users
INSERT INTO
    "auth"."users" (
        "instance_id",
        "id",
        "aud",
        "role",
        "email",
        "encrypted_password",
        "email_confirmed_at",
        "invited_at",
        "confirmation_token",
        "confirmation_sent_at",
        "recovery_token",
        "recovery_sent_at",
        "email_change_token_new",
        "email_change",
        "email_change_sent_at",
        "last_sign_in_at",
        "raw_app_meta_data",
        "raw_user_meta_data",
        "is_super_admin",
        "created_at",
        "updated_at",
        "phone",
        "phone_confirmed_at",
        "phone_change",
        "phone_change_token",
        "phone_change_sent_at",
        "email_change_token_current",
        "email_change_confirm_status",
        "banned_until",
        "reauthentication_token",
        "reauthentication_sent_at",
        "is_sso_user"
    )
VALUES
    (
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000001',
        'authenticated',
        'authenticated',
        'local@tuturuuu.com',
        extensions.crypt('password123', extensions.gen_salt('bf')),
        '2023-02-18 23:31:13.017218+00',
        NULL,
        '',
        '2023-02-18 23:31:12.757017+00',
        '',
        NULL,
        '',
        '',
        NULL,
        '2023-02-18 23:31:13.01781+00',
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        NULL,
        '2023-02-18 23:31:12.752281+00',
        '2023-02-18 23:31:13.019418+00',
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        'f'
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000002',
        'authenticated',
        'authenticated',
        'user1@tuturuuu.com',
        extensions.crypt('password123', extensions.gen_salt('bf')),
        '2023-02-19 00:01:51.351735+00',
        NULL,
        '',
        '2023-02-19 00:01:51.147035+00',
        '',
        NULL,
        '',
        '',
        NULL,
        '2023-02-19 00:01:51.352369+00',
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        NULL,
        '2023-02-19 00:01:51.142802+00',
        '2023-02-19 00:01:51.353896+00',
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        'f'
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000003',
        'authenticated',
        'authenticated',
        'user2@tuturuuu.com',
        extensions.crypt('password123', extensions.gen_salt('bf')),
        '2023-02-18 23:36:54.88495+00',
        NULL,
        '',
        '2023-02-18 23:36:54.67958+00',
        '',
        NULL,
        '',
        '',
        NULL,
        '2023-02-18 23:36:54.885592+00',
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        NULL,
        '2023-02-18 23:36:54.674532+00',
        '2023-02-18 23:36:54.887312+00',
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        'f'
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000004',
        'authenticated',
        'authenticated',
        'user3@tuturuuu.com',
        extensions.crypt('password123', extensions.gen_salt('bf')),
        '2023-02-18 23:36:56.08865+00',
        NULL,
        '',
        '2023-02-18 23:36:55.827566+00',
        '',
        NULL,
        '',
        '',
        NULL,
        '2023-02-18 23:48:04.159175+00',
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        NULL,
        '2023-02-18 23:36:55.823901+00',
        '2023-02-18 23:48:04.16081+00',
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        'f'
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000005',
        'authenticated',
        'authenticated',
        'user4@tuturuuu.com',
        extensions.crypt('password123', extensions.gen_salt('bf')),
        '2023-02-18 23:30:49.554834+00',
        NULL,
        '',
        '2023-02-18 23:30:49.330541+00',
        '',
        NULL,
        '',
        '',
        NULL,
        '2023-02-18 23:48:24.578005+00',
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        NULL,
        '2023-02-18 23:30:49.322994+00',
        '2023-02-18 23:48:24.579303+00',
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        'f'
    );

INSERT INTO relationship_types (id, story_id, name, slug, description, category, color, icon, is_mutual, reverse_name, is_default) VALUES
  (extensions.uuid_generate_v4(), NULL, 'Friend', 'friend', 'Close friendship', 'social', '#4ade80', '👥', true, NULL, true),
  (extensions.uuid_generate_v4(), NULL, 'Family', 'family', 'Family relation', 'family', '#f59e0b', '👨‍👩‍👧‍👦', true, NULL, true),
  (extensions.uuid_generate_v4(), NULL, 'Parent', 'parent', 'Parent relationship', 'family', '#f59e0b', '👪', false, 'Child', true),
  (extensions.uuid_generate_v4(), NULL, 'Sibling', 'sibling', 'Sibling relationship', 'family', '#f59e0b', '👫', true, NULL, true),
  (extensions.uuid_generate_v4(), NULL, 'Romantic Partner', 'romantic-partner', 'Romantic relationship', 'romantic', '#ec4899', '💕', true, NULL, true),
  (extensions.uuid_generate_v4(), NULL, 'Rival', 'rival', 'Competitive rivalry', 'antagonistic', '#ef4444', '⚔️', true, NULL, true),
  (extensions.uuid_generate_v4(), NULL, 'Enemy', 'enemy', 'Hostile relationship', 'antagonistic', '#dc2626', '💢', true, NULL, true),
  (extensions.uuid_generate_v4(), NULL, 'Mentor', 'mentor', 'Teaching relationship', 'professional', '#3b82f6', '📚', false, 'Student', true),
  (extensions.uuid_generate_v4(), NULL, 'Colleague', 'colleague', 'Work relationship', 'professional', '#06b6d4', '💼', true, NULL, true),
  (extensions.uuid_generate_v4(), NULL, 'Acquaintance', 'acquaintance', 'Casual relationship', 'social', '#94a3b8', '👋', true, NULL, true);

-- ============================================================================
-- DEFAULT EVENT TYPES (Global)
-- ============================================================================

INSERT INTO event_types (id, story_id, name, slug, description, color, icon, is_default) VALUES
  (extensions.uuid_generate_v4(), NULL, 'Mission', 'mission', 'Operational mission or assignment', '#3b82f6', '🎯', true),
  (extensions.uuid_generate_v4(), NULL, 'Battle', 'battle', 'Combat encounter', '#ef4444', '⚔️', true),
  (extensions.uuid_generate_v4(), NULL, 'Discovery', 'discovery', 'Important discovery or revelation', '#8b5cf6', '🔍', true),
  (extensions.uuid_generate_v4(), NULL, 'Meeting', 'meeting', 'Significant meeting between characters', '#06b6d4', '🤝', true),
  (extensions.uuid_generate_v4(), NULL, 'Betrayal', 'betrayal', 'Act of betrayal', '#dc2626', '🗡️', true),
  (extensions.uuid_generate_v4(), NULL, 'Founding', 'founding', 'Establishment of organization or location', '#10b981', '🏛️', true),
  (extensions.uuid_generate_v4(), NULL, 'Death', 'death', 'Character death', '#000000', '💀', true),
  (extensions.uuid_generate_v4(), NULL, 'Celebration', 'celebration', 'Celebration or festival', '#f59e0b', '🎉', true);

-- ============================================================================
-- DEFAULT OUTFIT TYPES (Global)
-- ============================================================================

INSERT INTO outfit_types (id, story_id, name, slug, description, color, icon, is_default) VALUES
  (extensions.uuid_generate_v4(), NULL, 'Casual', 'casual', 'Everyday casual wear', '#94a3b8', '👕', true),
  (extensions.uuid_generate_v4(), NULL, 'Formal', 'formal', 'Formal attire', '#1e293b', '🎩', true),
  (extensions.uuid_generate_v4(), NULL, 'Combat', 'combat', 'Combat or tactical gear', '#ef4444', '🛡️', true),
  (extensions.uuid_generate_v4(), NULL, 'Uniform', 'uniform', 'Organization uniform', '#3b82f6', '👔', true),
  (extensions.uuid_generate_v4(), NULL, 'Sleepwear', 'sleepwear', 'Pajamas and sleepwear', '#a78bfa', '🌙', true),
  (extensions.uuid_generate_v4(), NULL, 'Ceremonial', 'ceremonial', 'Ceremonial outfit', '#f59e0b', '👑', true);

-- ============================================================================
-- EXOCORPSE STORY
-- ============================================================================

INSERT INTO stories (id, title, slug, description, summary, theme_primary_color, theme_secondary_color, theme_background_color, theme_text_color, content, is_published, visibility) VALUES
  (
    extensions.uuid_generate_v4(),
    'Exocorpse',
    'exocorpse',
    'An underground corporation that strives to cleanse all of humanity''s sins by devoting themselves to being sinners.',
    'A dark tale of an underground organization performing morally gray missions in pursuit of a better world.',
    '#dc2626', -- Red primary
    '#991b1b', -- Darker red secondary
    '#0f0f0f', -- Dark background
    '#f5f5f5', -- Light text
    '# Exocorpse

Exocorpse is an underground corporation that operates in the shadows of society, striving to cleanse all of humanity''s sins through an unconventional method: by devoting themselves to being sinners. The organization believes that by taking on the world''s darkness, they can create a path toward a better future.

## Philosophy

The staff of Exocorpse perform missions that society deems immoral or illegal—heists, assassinations, bodyguard services, information manipulation—all in pursuit of what they believe is a noble goal. They operate under the philosophy that someone must bear the burden of sin so that others may live in the light.

## The Prototype System

The corporation has extreme interests in the biology and psychology of humanity, which has led to the development of two distinct branches, each specialized in different aspects of human potential:

### Prototype: Pulse
The branch designated for individuals who excel in physical strength, combat, agility, and brute force. Pulses are the frontliners of the corporation, executing direct action missions. They follow the rhythm of the heart—each step calculated, each strategy precise.

### Prototype: Neuro
The branch designated for individuals who excel in intelligence, psychology, and manipulation. Neuros work in the background, pulling strings and orchestrating complex operations. They understand the dialects of the world and weave them into their plans.

## Structure

The corporation operates with military precision, divided into cells and divisions. Each member undergoes rigorous testing to determine their prototype classification, though some rare individuals show aptitude for both branches.',
    true,
    'public'
  );

-- Store the story ID for later use
DO $$
DECLARE
  v_story_id UUID;
  v_world_id UUID;
  v_pulse_faction_id UUID;
  v_neuro_faction_id UUID;
  v_hq_location_id UUID;
  v_char1_id UUID;
  v_char2_id UUID;
  v_char3_id UUID;
  v_mission_event_type_id UUID;
  v_combat_outfit_type_id UUID;
  v_mentor_rel_type_id UUID;
  v_rival_rel_type_id UUID;
BEGIN
  -- Get the story ID
  SELECT id INTO v_story_id FROM stories WHERE slug = 'exocorpse';

  -- ============================================================================
  -- WORLD
  -- ============================================================================

  INSERT INTO worlds (id, story_id, name, slug, description, summary, world_type, size, population, theme_primary_color, theme_secondary_color, content) VALUES
    (
      extensions.uuid_generate_v4(),
      v_story_id,
      'Earth - Present Day',
      'earth-present-day',
      'A version of modern Earth where the Exocorpse corporation operates in secret.',
      'Modern Earth with hidden underground organizations.',
      'planet',
      'Global',
      7800000000,
      '#1e293b',
      '#475569',
      '# Earth - Present Day

This is our world, but beneath the surface of everyday life, shadow organizations like Exocorpse operate with impunity. Governments are aware of their existence but choose to turn a blind eye, recognizing that some jobs are too dirty for official channels.

## Geography

Exocorpse operates globally, with cells in every major city. Their headquarters is rumored to be somewhere in East Asia, hidden beneath layers of corporate fronts and misdirection.

## Society

Most citizens are unaware of Exocorpse''s existence. Those who know of it speak in whispers, and those who work for it rarely speak at all.'
    )
  RETURNING id INTO v_world_id;

  -- ============================================================================
  -- FACTIONS
  -- ============================================================================

  -- Prototype: Pulse
  INSERT INTO factions (id, world_id, name, slug, description, summary, faction_type, founding_date, status, primary_goal, ideology, reputation, power_level, member_count, logo_url, color_scheme, content) VALUES
    (
      extensions.uuid_generate_v4(),
      v_world_id,
      'Prototype: Pulse',
      'prototype-pulse',
      'The frontline operatives of Exocorpse, specializing in physical combat and direct action.',
      'Combat specialists who follow the rhythm of the heart.',
      'division',
      '2015',
      'active',
      'Execute direct action missions with precision and efficiency',
      'Strength through discipline, power through action',
      'Feared and respected within Exocorpse',
      'global',
      847,
      '/assets/pulse-logo.png',
      '#dc2626',
      '# Prototype: Pulse

Pulse operatives are the beating heart of Exocorpse''s direct action capabilities. They are warriors, athletes, and tacticians rolled into one.

## Selection Criteria

- Exceptional physical conditioning
- Combat proficiency in multiple disciplines
- Quick decision-making under pressure
- High pain tolerance
- Tactical thinking

## Training

Pulse recruits undergo a 2-year training program that tests them to their absolute limits. Only 40% complete the program.

## Notable Operations

- The Singapore Heist (2018)
- Operation Cardiac Arrest (2020)
- The Manila Extraction (2022)'
    )
  RETURNING id INTO v_pulse_faction_id;

  -- Prototype: Neuro
  INSERT INTO factions (id, world_id, name, slug, description, summary, faction_type, founding_date, status, primary_goal, ideology, reputation, power_level, member_count, logo_url, color_scheme, content) VALUES
    (
      extensions.uuid_generate_v4(),
      v_world_id,
      'Prototype: Neuro',
      'prototype-neuro',
      'The intelligence and psychological operations division of Exocorpse.',
      'Master manipulators who control information and perception.',
      'division',
      '2015',
      'active',
      'Control information flow and manipulate key targets',
      'Knowledge is power, perception is reality',
      'Mysterious and enigmatic within Exocorpse',
      'global',
      523,
      '/assets/neuro-logo.png',
      '#3b82f6',
      '# Prototype: Neuro

Neuro operatives are the hidden architects of Exocorpse''s most complex operations. They work in shadows, pulling strings and manipulating events from behind the scenes.

## Selection Criteria

- Exceptional intelligence (IQ 140+)
- Advanced psychological understanding
- Pattern recognition abilities
- Social engineering skills
- Information synthesis

## Training

Neuro recruits undergo a 3-year program focused on psychology, cryptography, sociology, and manipulation techniques.

## Notable Operations

- The Berlin Information War (2017)
- Operation Neural Net (2019)
- The Tokyo Mind Game (2021)'
    )
  RETURNING id INTO v_neuro_faction_id;

  -- ============================================================================
  -- LOCATIONS
  -- ============================================================================

  -- Headquarters
  INSERT INTO locations (id, world_id, name, slug, description, summary, location_type, climate, population, coordinate_x, coordinate_y, content) VALUES
    (
      extensions.uuid_generate_v4(),
      v_world_id,
      'The Marrow',
      'the-marrow',
      'The central headquarters of Exocorpse, hidden beneath Tokyo.',
      'Exocorpse''s secret underground headquarters.',
      'building',
      'Controlled climate',
      1500,
      139.6917,
      35.6895,
      '# The Marrow

Named after bone marrow—the source of blood cells—The Marrow is the heart of Exocorpse operations. Located 200 meters beneath Tokyo, it''s a state-of-the-art facility that houses training grounds, medical facilities, armories, and command centers.

## Layout

- **Level 1**: Reception and cover operations (legitimate business fronts)
- **Level 2**: Administration and mission planning
- **Level 3**: Training facilities for both Pulse and Neuro
- **Level 4**: Medical and research division
- **Level 5**: Armory and equipment storage
- **Level 6**: Command center and archives
- **Level 7**: High-security detention and interrogation

## Access

Entry to The Marrow requires biometric identification and neural pattern recognition. The facility has never been breached.'
    )
  RETURNING id INTO v_hq_location_id;

  -- Other locations
  INSERT INTO locations (id, world_id, name, slug, description, summary, location_type, climate, population, content) VALUES
    (
      extensions.uuid_generate_v4(),
      v_world_id,
      'Singapore Safe House Alpha',
      'singapore-safe-house-alpha',
      'A covert safe house used for operations in Southeast Asia.',
      'Safe house for Southeast Asian operations.',
      'building',
      'Tropical',
      NULL,
      '# Singapore Safe House Alpha

A luxury penthouse that serves as a cover for Exocorpse operations in Singapore. To outsiders, it appears to be owned by a wealthy investor who travels frequently.'
    ),
    (
      extensions.uuid_generate_v4(),
      v_world_id,
      'Berlin Intelligence Hub',
      'berlin-intelligence-hub',
      'A Neuro-operated intelligence gathering station in Berlin.',
      'Intelligence gathering station in Europe.',
      'building',
      'Temperate',
      25,
      '# Berlin Intelligence Hub

Disguised as a tech startup office, this facility houses some of Exocorpse''s most advanced surveillance and data analysis equipment. It''s primarily staffed by Neuro operatives.'
    );

  -- ============================================================================
  -- CHARACTERS
  -- ============================================================================

  -- Character 1: Pulse Operative
  INSERT INTO characters (id, name, slug, nickname, age, species, gender, pronouns, height, build, hair_color, eye_color, status, occupation, personality_summary, backstory, skills, abilities, profile_image, color_scheme) VALUES
    (
      extensions.uuid_generate_v4(),
      'Kazuki Yamamoto',
      'kazuki-yamamoto',
      'Cardiac',
      28,
      'Human',
      'Male',
      'he/him',
      '185 cm',
      'Athletic, muscular',
      'Black',
      'Dark brown',
      'alive',
      'Prototype: Pulse Operative',
      'Disciplined and focused, with an unwavering commitment to the mission. Quiet but not cold, he values efficiency over emotion.',
      '# Backstory

Kazuki was recruited from the Japanese Self-Defense Forces after displaying exceptional combat abilities during a joint training exercise. He completed Pulse training in record time and quickly rose through the ranks.

Born in Osaka, he lost his family in a gang-related incident when he was 16. He joined the military seeking purpose and found it in Exocorpse''s mission.

## Motivation

Kazuki believes that by eliminating threats before they can harm innocents, he''s preventing others from experiencing the loss he endured.',
      'Expert in CQC, firearms, tactical planning, parkour, infiltration',
      'Enhanced reflexes through training, exceptional pain tolerance, tactical analysis',
      '/assets/characters/kazuki.png',
      '#dc2626'
    )
  RETURNING id INTO v_char1_id;

  -- Character 2: Neuro Operative
  INSERT INTO characters (id, name, slug, nickname, age, species, gender, pronouns, height, build, hair_color, eye_color, status, occupation, personality_summary, backstory, skills, abilities, profile_image, color_scheme) VALUES
    (
      extensions.uuid_generate_v4(),
      'Dr. Aisha Rahman',
      'aisha-rahman',
      'Synaptic',
      32,
      'Human',
      'Female',
      'she/her',
      '168 cm',
      'Slender',
      'Dark brown',
      'Hazel',
      'alive',
      'Prototype: Neuro Operative',
      'Brilliant and calculating, with an almost unsettling ability to read people. She speaks softly but her words carry weight.',
      '# Backstory

Dr. Rahman earned her PhD in Cognitive Psychology at 24 from MIT. She was recruited by Exocorpse after publishing a controversial paper on ethical manipulation for the greater good.

Born in London to Pakistani immigrants, she grew up watching her parents struggle against systemic discrimination. This shaped her worldview that sometimes rules must be broken to create real change.

## Motivation

Aisha believes that by understanding and manipulating the minds of those in power, she can steer humanity toward a better future.',
      'Expert in psychology, interrogation, social engineering, cryptography, data analysis',
      'Eidetic memory, rapid pattern recognition, psychological profiling',
      '/assets/characters/aisha.png',
      '#3b82f6'
    )
  RETURNING id INTO v_char2_id;

  -- Character 3: Dual-Type (rare)
  INSERT INTO characters (id, name, slug, nickname, age, species, gender, pronouns, height, build, hair_color, eye_color, status, occupation, personality_summary, likes, dislikes, fears, goals, backstory, skills, abilities, strengths, weaknesses, profile_image, color_scheme) VALUES
    (
      extensions.uuid_generate_v4(),
      'Viktor Sokolov',
      'viktor-sokolov',
      'Apex',
      35,
      'Human',
      'Male',
      'he/him',
      '178 cm',
      'Lean but strong',
      'Blonde',
      'Ice blue',
      'alive',
      'Exocorpse Commander (Dual-Type)',
      'Charismatic and strategic, Viktor is one of the few operatives who excels in both Pulse and Neuro disciplines. His leadership is respected but also feared.',
      'Classical music, chess, fine dining, solving complex problems',
      'Incompetence, weakness, emotional outbursts, failure',
      'Losing control, being outsmarted, the organization''s mission failing',
      'Perfect the dual-type program, create more operatives like himself, achieve Exocorpse''s ultimate vision',
      '# Backstory

Viktor Sokolov is a rarity in Exocorpse—a dual-type operative who excels in both physical and psychological operations. Born in Moscow to a family of academics and military officers, he was groomed from childhood to be exceptional.

He was recruited by Exocorpse at 23 after simultaneously completing special forces training and earning a master''s degree in Strategic Studies. His unique combination of skills caught the attention of Exocorpse''s founders, who saw in him the potential to bridge the gap between Pulse and Neuro.

## Rise to Power

Viktor quickly climbed the ranks, leading successful operations that required both direct action and psychological manipulation. By 30, he became one of Exocorpse''s youngest commanders.

## Current Role

Viktor now oversees joint operations between Pulse and Neuro divisions. He''s also leading a controversial program to identify and train more dual-type operatives, believing they represent the future of Exocorpse.

## Reputation

Among Pulse operatives, he''s respected for his combat prowess. Among Neuros, he''s admired for his strategic mind. Among both, he''s feared for his ruthlessness.',
      'Expert combatant, master strategist, psychological warfare, leadership, multilingual (Russian, English, Japanese, Mandarin, Arabic)',
      'Enhanced tactical analysis, exceptional physical conditioning, advanced psychological manipulation',
      'Versatility, strategic thinking, leadership, adaptability',
      'Perfectionism (can be a liability), trust issues, occasionally reckless when trying to prove a point',
      '/assets/characters/viktor.png',
      '#8b5cf6'
    )
  RETURNING id INTO v_char3_id;

  -- ============================================================================
  -- CHARACTER-WORLD ASSOCIATIONS
  -- ============================================================================

  INSERT INTO character_worlds (character_id, world_id) VALUES
    (v_char1_id, v_world_id),
    (v_char2_id, v_world_id),
    (v_char3_id, v_world_id);

  -- ============================================================================
  -- CHARACTER-FACTION ASSOCIATIONS
  -- ============================================================================

  INSERT INTO character_factions (character_id, faction_id, role, rank, join_date, is_current, notes) VALUES
    (v_char1_id, v_pulse_faction_id, 'Field Operative', 'Senior Agent', '2018', true, 'Specializes in high-risk extractions'),
    (v_char2_id, v_neuro_faction_id, 'Intelligence Analyst', 'Lead Psychologist', '2016', true, 'Heads the psychological operations division'),
    (v_char3_id, v_pulse_faction_id, 'Commander', 'Division Commander', '2015', true, 'Commands joint operations'),
    (v_char3_id, v_neuro_faction_id, 'Commander', 'Division Commander', '2015', true, 'Commands joint operations');

  -- ============================================================================
  -- CHARACTER RELATIONSHIPS
  -- ============================================================================

  -- Get relationship type IDs
  SELECT id INTO v_mentor_rel_type_id FROM relationship_types WHERE slug = 'mentor' LIMIT 1;
  SELECT id INTO v_rival_rel_type_id FROM relationship_types WHERE slug = 'rival' LIMIT 1;

  INSERT INTO character_relationships (character_a_id, character_b_id, relationship_type_id, description, is_mutual) VALUES
    (v_char3_id, v_char1_id, v_mentor_rel_type_id, 'Viktor mentored Kazuki during his early years in Exocorpse', false),
    (v_char2_id, v_char3_id, v_rival_rel_type_id, 'Aisha and Viktor have a professional rivalry, each believing their approach is superior', true);

  -- ============================================================================
  -- CHARACTER OUTFITS
  -- ============================================================================

  -- Get outfit type IDs
  SELECT id INTO v_combat_outfit_type_id FROM outfit_types WHERE slug = 'combat' LIMIT 1;

  INSERT INTO character_outfits (character_id, outfit_type_id, name, description, image_url, is_default, display_order) VALUES
    (v_char1_id, v_combat_outfit_type_id, 'Standard Pulse Combat Gear', 'Black tactical gear with red accents, reinforced plating at vital areas', '/assets/outfits/kazuki-combat.png', true, 1),
    (v_char2_id, v_combat_outfit_type_id, 'Neuro Field Suit', 'Sleek dark blue suit with integrated communication devices and hidden cameras', '/assets/outfits/aisha-field.png', true, 1),
    (v_char3_id, v_combat_outfit_type_id, 'Commander Tactical Uniform', 'Purple-accented tactical gear that combines Pulse and Neuro design elements', '/assets/outfits/viktor-tactical.png', true, 1);

  -- ============================================================================
  -- TIMELINES
  -- ============================================================================

  INSERT INTO timelines (world_id, name, description, start_date, end_date, era_name, color) VALUES
    (v_world_id, 'The Founding Era', 'The establishment and early years of Exocorpse', '2010', '2015', 'Genesis', '#10b981'),
    (v_world_id, 'The Expansion Era', 'Exocorpse expands globally and develops the Prototype system', '2015', '2020', 'Evolution', '#3b82f6'),
    (v_world_id, 'The Modern Era', 'Current operations and the rise of dual-type operatives', '2020', 'Present', 'Apex', '#8b5cf6');

  -- ============================================================================
  -- EVENTS
  -- ============================================================================

  -- Get event type ID
  SELECT id INTO v_mission_event_type_id FROM event_types WHERE slug = 'mission' LIMIT 1;

  INSERT INTO events (world_id, location_id, event_type_id, name, slug, summary, description, date, date_year, duration, significance, outcome, content) VALUES
    (
      v_world_id,
      v_hq_location_id,
      (SELECT id FROM event_types WHERE slug = 'founding' LIMIT 1),
      'The Founding of Exocorpse',
      'founding-of-exocorpse',
      'The underground corporation is established',
      'A group of disillusioned former intelligence operatives come together to form Exocorpse',
      'January 15, 2010',
      2010,
      '6 months',
      'world-changing',
      'Exocorpse successfully established with initial funding and recruitment',
      '# The Founding

On a cold January night in 2010, seven individuals gathered in an abandoned subway station beneath Tokyo. They were former intelligence operatives, special forces soldiers, and psychological warfare experts who had become disillusioned with their governments'' inability to address global threats effectively.

They founded Exocorpse with a radical philosophy: sometimes, to save humanity, one must embrace sin itself.'
    ),
    (
      v_world_id,
      NULL,
      v_mission_event_type_id,
      'Operation Cardiac Arrest',
      'operation-cardiac-arrest',
      'Major Pulse operation to eliminate a terrorist cell',
      'A high-stakes mission led by Kazuki Yamamoto to neutralize a terrorist threat',
      'March 22, 2020',
      2020,
      '48 hours',
      'major',
      'Complete success, zero casualties on Exocorpse side',
      '# Operation Cardiac Arrest

This operation became legendary within Pulse ranks. Kazuki Yamamoto led a team of eight operatives to infiltrate and dismantle a terrorist cell planning a major attack on civilian targets in Singapore.

The operation required precision timing, with multiple simultaneous strikes across the city. Every target was neutralized within a 90-minute window.'
    );

  -- ============================================================================
  -- EVENT PARTICIPANTS
  -- ============================================================================

  INSERT INTO event_participants (event_id, character_id, role, description) VALUES
    ((SELECT id FROM events WHERE slug = 'operation-cardiac-arrest'), v_char1_id, 'leader', 'Led the operation with tactical precision'),
    ((SELECT id FROM events WHERE slug = 'operation-cardiac-arrest'), v_char3_id, 'commander', 'Commanded the operation from headquarters');

  -- ============================================================================
  -- TAGS
  -- ============================================================================

  INSERT INTO tags (name, slug, description, category, color) VALUES
    ('Dark', 'dark', 'Dark themes and content', 'theme', '#1e293b'),
    ('Action', 'action', 'Action-heavy content', 'genre', '#ef4444'),
    ('Psychological', 'psychological', 'Psychological themes', 'theme', '#8b5cf6'),
    ('Modern', 'modern', 'Modern/contemporary setting', 'setting', '#06b6d4'),
    ('Original Story', 'original-story', 'Original content', 'content-type', '#10b981'),
    ('Completed', 'completed', 'Completed story', 'status', '#22c55e'),
    ('Ongoing', 'ongoing', 'Ongoing story', 'status', '#f59e0b');

  -- ============================================================================
  -- ENTITY TAGS
  -- ============================================================================

  INSERT INTO entity_tags (tag_id, entity_type, entity_id) VALUES
    ((SELECT id FROM tags WHERE slug = 'dark'), 'story', v_story_id),
    ((SELECT id FROM tags WHERE slug = 'action'), 'story', v_story_id),
    ((SELECT id FROM tags WHERE slug = 'psychological'), 'story', v_story_id),
    ((SELECT id FROM tags WHERE slug = 'modern'), 'story', v_story_id),
    ((SELECT id FROM tags WHERE slug = 'original-story'), 'story', v_story_id),
    ((SELECT id FROM tags WHERE slug = 'ongoing'), 'story', v_story_id),
    ((SELECT id FROM tags WHERE slug = 'action'), 'character', v_char1_id),
    ((SELECT id FROM tags WHERE slug = 'psychological'), 'character', v_char2_id),
    ((SELECT id FROM tags WHERE slug = 'action'), 'character', v_char3_id),
    ((SELECT id FROM tags WHERE slug = 'psychological'), 'character', v_char3_id);

  -- ============================================================================
  -- CHARACTER LOCATIONS
  -- ============================================================================

  INSERT INTO character_locations (character_id, location_id, association_type, is_current, notes) VALUES
    (v_char1_id, v_hq_location_id, 'workplace', true, 'Based at The Marrow'),
    (v_char2_id, v_hq_location_id, 'workplace', true, 'Works primarily at headquarters'),
    (v_char3_id, v_hq_location_id, 'workplace', true, 'Commands from The Marrow');

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Uncomment these to verify the seed data was inserted correctly

-- SELECT COUNT(*) as story_count FROM stories;
-- SELECT COUNT(*) as world_count FROM worlds;
-- SELECT COUNT(*) as faction_count FROM factions;
-- SELECT COUNT(*) as character_count FROM characters;
-- SELECT COUNT(*) as location_count FROM locations;
-- SELECT COUNT(*) as event_count FROM events;
-- SELECT COUNT(*) as relationship_type_count FROM relationship_types;
-- SELECT COUNT(*) as event_type_count FROM event_types;
-- SELECT COUNT(*) as outfit_type_count FROM outfit_types;
-- SELECT COUNT(*) as tag_count FROM tags;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
