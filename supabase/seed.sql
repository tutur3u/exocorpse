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
-- SEED DATA: Blog Posts
-- ============================================================================

INSERT INTO blog_posts (slug, title, content, excerpt, published_at) VALUES
  (
    'welcome-to-exocorpse',
    'Welcome to Exocorpse',
    '# Welcome to Exocorpse

Welcome to the official wiki for the Exocorpse universe. This is a comprehensive resource documenting the underground corporation that strives to cleanse humanity''s sins through unconventional means.

## About This Wiki

This wiki serves as the primary source for information about:

- **The Organization**: Structure, divisions, and operations
- **Characters**: Operatives, commanders, and key figures
- **Locations**: Facilities, safe houses, and operational bases
- **Events**: Missions, pivotal moments, and timeline events
- **Factions**: Prototype Pulse and Prototype Neuro divisions

## Getting Started

If you''re new to Exocorpse, we recommend starting with:

1. **The Story Overview** - Get a high-level understanding of the universe
2. **The Characters** - Meet the operatives at the heart of Exocorpse
3. **The Prototypes** - Learn about Pulse and Neuro specializations

## Community Contributions

This wiki is maintained by fans of the Exocorpse universe. If you have content to contribute, please reach out through the contact form.

---

*Last updated: Today*

*"Someone must bear the burden of sin so that others may live in the light."*',
    'Discover the world of Exocorpse, an underground corporation operating in the shadows of modern society.',
    '2025-10-21 08:00:00+00'
  ),
  (
    'understanding-the-prototypes',
    'Understanding the Prototypes: Pulse vs Neuro',
    '# Understanding the Prototypes: Pulse vs Neuro

One of the most fundamental aspects of Exocorpse is the Prototype system—a classification that divides operatives into two primary branches based on their aptitudes and specializations.

## The Philosophy Behind Prototypes

The founders of Exocorpse believed that human potential comes in distinct forms. Rather than forcing all recruits into a single mold, they developed a system that identifies, nurtures, and specializes individuals according to their natural strengths.

## Prototype: Pulse

**Pulse operatives** are the physical embodiment of Exocorpse''s direct action capabilities. They are warriors, athletes, and tacticians.

### Selection Criteria
- Exceptional physical conditioning
- Combat proficiency (any discipline)
- Quick decision-making under pressure
- High pain tolerance
- Tactical thinking and adaptability

### Training Program
The Pulse training program lasts 2 years and is one of the most rigorous on Earth. Only 40% of applicants complete it.

### Specializations
- **Combat Operative**: Direct action, infiltration, extraction
- **Tactical Commander**: Planning and coordination
- **Close Protection**: VIP security and bodyguard services

### Notable Traits
- Exceptional physical conditioning
- Enhanced reflexes through training
- Superior pain tolerance
- Tactical analysis capabilities

## Prototype: Neuro

**Neuro operatives** are the architects of Exocorpse''s most complex operations, working in the shadows and pulling strings from behind the scenes.

### Selection Criteria
- Exceptional intelligence (typically IQ 140+)
- Advanced psychological understanding
- Pattern recognition abilities
- Social engineering skills
- Information synthesis capabilities

### Training Program
The Neuro training program lasts 3 years and focuses on psychology, cryptography, sociology, and manipulation techniques.

### Specializations
- **Intelligence Analyst**: Information gathering and analysis
- **Psychologist**: Interrogation and psychological profiling
- **Information Warfare Specialist**: Data manipulation and misinformation

### Notable Traits
- Eidetic memory
- Rapid pattern recognition
- Psychological profiling ability
- Advanced threat assessment

## Dual-Type Operatives (Rare)

In exceptional cases, an individual may demonstrate aptitude in both Pulse and Neuro disciplines. These dual-type operatives are extraordinarily rare—fewer than 10 are currently active.

Viktor Sokolov is one of the most famous examples of a dual-type operative, commanding joint operations between both divisions.

## Comparison Table

| Aspect | Pulse | Neuro |
|--------|-------|-------|
| Primary Focus | Physical Action | Information & Psychology |
| Training Duration | 2 years | 3 years |
| Completion Rate | 40% | 60% |
| Typical Role | Field Operations | Analysis & Planning |
| Strength | Direct Execution | Strategic Manipulation |
| Key Skill | Combat | Psychology |

---

*"The heart beats and the mind thinks. Both are essential to Exocorpse."*',
    'Learn how Exocorpse identifies and specializes its operatives into two distinct prototype systems.',
    '2025-10-21 10:30:00+00'
  ),
  (
    'the-marrow-headquarters',
    'The Marrow: Exocorpse''s Hidden Heart',
    '# The Marrow: Exocorpse''s Hidden Heart

The Marrow is more than just a building—it''s the beating heart of the entire Exocorpse organization. Located 200 meters beneath Tokyo, this state-of-the-art facility represents decades of planning, construction, and refinement.

## Historical Background

Construction of The Marrow began in 2008, two years before Exocorpse''s official founding. The project required:

- 847 workers sworn to secrecy
- $2.3 billion in funding
- 18 months of continuous construction
- Complete destruction of all records after completion

The facility was first occupied in March 2010, just months after Exocorpse''s founding.

## Facility Overview

### Size and Capacity
- **Total Area**: 145,000 square meters
- **Personnel Capacity**: 2,000 (current occupancy: ~1,500)
- **Depth**: 200 meters below street level
- **Levels**: 7 operational levels

### The Seven Levels

**Level 1: Reception & Cover Operations**
- Legitimate business fronts
- Public-facing administrative offices
- Visitor reception areas
- Identity verification stations

**Level 2: Administration & Mission Planning**
- Executive offices
- Strategic planning rooms
- Secure communication centers
- Archive storage

**Level 3: Training Facilities**
- Combat training grounds (Pulse)
- Psychological training labs (Neuro)
- Simulation chambers
- Physical conditioning areas

**Level 4: Medical & Research Division**
- Advanced medical facilities
- Surgical suites
- Psychological evaluation rooms
- Genetic research labs (classified)

**Level 5: Armory & Equipment Storage**
- Weapons storage and maintenance
- Tactical gear inventory
- Technology and gadget development
- Ammunition and explosives storage

**Level 6: Command Center & Archives**
- Central command operations
- Real-time mission monitoring
- Historical records and documents
- Strategic intelligence storage

**Level 7: High-Security Detention & Interrogation**
- Secure holding cells
- Advanced interrogation rooms
- Psychological manipulation chambers
- Medical extraction facilities

## Security Systems

### Physical Security
- Biometric identification at all entry points
- Neural pattern recognition technology
- Pressure-sensitive flooring in sensitive areas
- Automated security response systems

### Cybersecurity
- Air-gapped networks for critical systems
- Quantum encryption for communications
- AI-assisted threat detection
- 247 redundant backup systems

### Access Control
- 32 separate security zones
- Retinal scanning at critical junctures
- Voice pattern verification
- Temporal access restrictions (time-based access)

## Notable Achievements

The Marrow has never been breached in its 15-year operational history. It has weathered:

- 47 attempted infiltrations (all neutralized)
- 3 close calls with government investigations
- Hundreds of cyber attacks (none successful)
- Natural disasters that would have destroyed lesser facilities

---

*"The Marrow is not just our headquarters. It is our statement. It is our promise that Exocorpse is built to last."*
— Viktor Sokolov, Commander',
    'Explore the architecture, layout, and security systems of The Marrow, Exocorpse''s secret headquarters beneath Tokyo.',
    '2025-10-21 14:15:00+00'
  ),
  (
    'operatic-cardiac-arrest-breakdown',
    'Operation Cardiac Arrest: A Tactical Breakdown',
    '# Operation Cardiac Arrest: A Tactical Breakdown

Operation Cardiac Arrest stands as one of the most successful and complex missions in Exocorpse history. Executed in March 2020, it eliminated a terrorist threat before it could claim countless civilian lives.

## Mission Objectives

1. Locate and neutralize 8 key terrorist operatives
2. Secure classified intelligence documents
3. Prevent scheduled terrorist attack
4. Maintain operational secrecy (zero collateral damage)

## Pre-Mission Intelligence

Through months of Neuro-division analysis, Exocorpse identified:

- 8 terrorist cells coordinating an attack
- Planning to execute simultaneous strikes across Singapore
- Target: Civilian entertainment districts
- Timeline: 72 hours from mission start
- Estimated casualties: 3,000-5,000 civilians

## The Execution

### Phase 1: Insertion (00:00 - 02:30)
Kazuki Yamamoto led a team of 8 Pulse operatives across Singapore using pre-positioned safe houses and disguises. Each operative was equipped with:

- Advanced communication systems
- Non-lethal and lethal options
- Thermal imaging technology
- Backup extraction routes

### Phase 2: Simultaneous Strikes (03:00 - 04:30)
All 8 targets were neutralized within a 90-minute window across the city:

- Marina Bay Sands penthouse: 2 operatives eliminated
- Sentosa underground bunker: 3 operatives eliminated
- Changi Business Park warehouse: 1 operative eliminated
- Bukit Timah Nature Reserve safe house: 2 operatives eliminated

**Execution Time**: 87 minutes
**Casualties on Exocorpse side**: 0
**Civilian injuries**: 0
**Mission status**: COMPLETE

### Phase 3: Intelligence Recovery (04:45 - 06:00)
Neuro operatives remotely accessed terrorist communications and financial records, securing:

- Attack blueprints
- Funding sources
- International contact information
- Future operation plans

### Phase 4: Extraction (06:15 - 08:00)
All Exocorpse operatives extracted via pre-arranged transport, leaving no trace of their involvement.

## Impact

- Prevented estimated 3,500+ civilian deaths
- Disrupted international terrorist networks
- Enhanced Exocorpse''s reputation internally
- Established Kazuki Yamamoto as elite-tier operative
- Demonstrated seamless Pulse-Neuro coordination

## Lessons Learned

1. **Precision Planning Pays Off**: Months of intelligence work enabled flawless execution
2. **Team Cohesion**: Perfect coordination between operatives
3. **Technology Advantage**: Advanced equipment made the difference
4. **Neuro Support**: Psychological operations intel was critical

---

*"The heart stopped beating. The threat was eliminated. Civilians went to bed that night, never knowing how close death came."*
— Mission report, Operation Cardiac Arrest',
    'A detailed tactical analysis of Operation Cardiac Arrest, one of Exocorpse''s most successful missions.',
    '2025-10-21 16:45:00+00'
  ),
  (
    'philosophy-of-exocorpse',
    'The Philosophy of Exocorpse: Sin for Salvation',
    '# The Philosophy of Exocorpse: Sin for Salvation

At its core, Exocorpse is built on a singular, controversial philosophy: **Someone must bear the burden of sin so that others may live in the light.**

## The Founding Principle

In 2010, seven disillusioned operatives gathered beneath Tokyo with a radical idea. They believed that:

1. **Governments are inefficient** - Bureaucracy prevents necessary action
2. **Morality is a luxury** - When lives are at stake, rules must bend
3. **The greater good justifies the means** - Sometimes dirty work prevents greater harm
4. **Shadow work is noble** - Those who do it sacrifice their souls for civilization

## Core Tenets

### Tenet 1: Necessary Evil

Not all targets deserve death. Not all means are justified. But when the choice is between one murder and a genocide, Exocorpse believes in the murder.

The organization operates in the moral gray zone, accepting contracts that governments cannot acknowledge but desperately need executed.

### Tenet 2: The Sacrifice

Members of Exocorpse understand they are sacrificing their souls for the greater good. Each mission taken, each life ended, each psyche manipulated—all are burdens the operative bears so civilians need not.

### Tenet 3: Purpose Over Profit

While Exocorpse is well-funded, its primary motivation is not money. It is the belief that their work matters, that their sacrifices have meaning.

### Tenet 4: Perfection in Execution

If you must sin, sin perfectly. Sloppy work causes collateral damage. Precise work achieves objectives cleanly. Exocorpse demands excellence.

### Tenet 5: Selective Recruitment

Not everyone can bear the weight of this work. Exocorpse recruits only the strongest—physically and psychologically—understanding that weak links lead to mission failure and innocent deaths.

## The Criticism

Of course, this philosophy is controversial. Critics argue:

- **It''s moral relativism**: Who decides what counts as "necessary"?
- **It breeds corruption**: Power to decide who lives and dies is inherently corrupting
- **It''s cult-like**: The philosophy asks for absolute belief and sacrifice
- **It justifies atrocity**: Any evil can be justified as "necessary"

Exocorpse members acknowledge these criticisms but maintain their conviction that perfect isn''t possible in a broken world.

## In Practice

This philosophy manifests as:

- **Surgical precision**: Kill only the target, never the innocent
- **Psychological fortitude**: Accept the weight of your actions
- **Mission before self**: Personal wants mean nothing compared to objectives
- **Loyalty above all**: Trust your team completely or don''t work
- **Constant questioning**: Never become comfortable; always question if you''re on the right side

---

*"We are not heroes. We are not villains. We are the necessary shadow between light and darkness. And we bear the weight so you don''t have to."*
— Exocorpse Operative Creed',
    'Explore the philosophical foundation that drives Exocorpse operatives and justifies their morally ambiguous work.',
    '2025-10-20 09:00:00+00'
  );


--
-- Seed Data for table `blacklisted_users`
--

INSERT INTO blacklisted_users (username, reasoning, timestamp) VALUES
(
    'spam_bot_42',
    'Persistent commercial spamming across multiple public channels.',
    '2025-10-22 10:00:00-04' -- Yesterday at 10 AM (adjust timezone as needed)
),
(
    'troll_king_99',
    'Repeated harassment and targeted abusive behavior toward other users.',
    '2025-10-23 03:15:22-04' -- Early this morning
),
(
    'phish_attempt',
    'Attempted to share malicious links and harvest login credentials.',
    '2025-10-23 15:40:05-04' -- Just a moment ago
),
(
    'cheater_joe',
    'Exploited a known game bug for unfair advantage, disrupting competitive play.',
    '2025-10-20 18:30:00-04' -- A few days ago
),
(
    'duplicate_acct',
    'Created a secondary account to evade a temporary ban on their main profile.',
    '2025-10-15 12:00:00-04' -- Oldest entry
);


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
