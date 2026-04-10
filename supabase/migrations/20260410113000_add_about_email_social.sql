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
) VALUES (
    'social_link',
    'Email',
    'exocorpsehq@gmail.com',
    '',
    'mailto:exocorpsehq@gmail.com',
    'email',
    'pink',
    6,
    FALSE,
    'social-email'
)
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
