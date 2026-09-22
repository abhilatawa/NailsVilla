-- Development seed data. Real production catalog, pricing, and durations are
-- entered by the owner through the admin panel; these values are illustrative only.

INSERT INTO service_categories (name, description, display_order, active) VALUES
    ('Manicure', 'Classic and gel manicures for healthy, polished nails.', 1, TRUE),
    ('Pedicure', 'Relaxing pedicure treatments.', 2, TRUE),
    ('Acrylic', 'Acrylic sets, fills, and touch-ups.', 3, TRUE),
    ('Extensions', 'Nail extensions for length and shape.', 4, TRUE),
    ('Nail Art', 'Custom and creative nail art designs.', 5, TRUE),
    ('Removal', 'Safe removal and repair services.', 6, TRUE),
    ('Other', 'Additional services.', 7, TRUE);

INSERT INTO services (
    category_id, name, description, short_description, price_type,
    price_minor, starting_price_minor, min_price_minor, max_price_minor,
    currency, duration_minutes, buffer_minutes, active, featured, display_order
) VALUES
    (
        (SELECT id FROM service_categories WHERE name = 'Manicure'),
        'Gel Manicure',
        'A long-lasting gel polish manicure with cuticle care and shaping.',
        'Long-lasting gel polish manicure',
        'FIXED', 6000, NULL, NULL, NULL, 'CAD', 60, 10, TRUE, TRUE, 1
    ),
    (
        (SELECT id FROM service_categories WHERE name = 'Manicure'),
        'French Tips',
        'A timeless French tip finish, hand-painted or gel.',
        'Classic French tip finish',
        'STARTING_FROM', NULL, 6500, NULL, NULL, 'CAD', 60, 10, TRUE, FALSE, 2
    ),
    (
        (SELECT id FROM service_categories WHERE name = 'Acrylic'),
        'Acrylic Full Set',
        'A full set of acrylic nails, sculpted and shaped to your preference.',
        'Full acrylic set, sculpted and shaped',
        'STARTING_FROM', NULL, 7000, NULL, NULL, 'CAD', 90, 15, TRUE, TRUE, 3
    ),
    (
        (SELECT id FROM service_categories WHERE name = 'Acrylic'),
        'Acrylic Fill',
        'A fill to maintain your existing acrylic set.',
        'Maintenance fill for acrylic sets',
        'FIXED', 5500, NULL, NULL, NULL, 'CAD', 60, 10, TRUE, FALSE, 4
    ),
    (
        (SELECT id FROM service_categories WHERE name = 'Extensions'),
        'Nail Extensions',
        'Custom-length nail extensions built to your desired shape.',
        'Custom-length nail extensions',
        'STARTING_FROM', NULL, 8000, NULL, NULL, 'CAD', 90, 15, TRUE, FALSE, 5
    ),
    (
        (SELECT id FROM service_categories WHERE name = 'Nail Art'),
        'Custom Nail Art',
        'Personalized hand-painted nail art, from minimal accents to full designs.',
        'Personalized hand-painted designs',
        'RANGE', NULL, NULL, 2000, 6000, 'CAD', 30, 5, TRUE, TRUE, 6
    ),
    (
        (SELECT id FROM service_categories WHERE name = 'Nail Art'),
        'Chrome Nails',
        'A mirror-finish chrome effect over gel or acrylic.',
        'Mirror-finish chrome effect',
        'STARTING_FROM', NULL, 7500, NULL, NULL, 'CAD', 75, 15, TRUE, TRUE, 7
    ),
    (
        (SELECT id FROM service_categories WHERE name = 'Nail Art'),
        'Ombre Nails',
        'A smooth gradient blend between two or more colors.',
        'Smooth gradient color blend',
        'STARTING_FROM', NULL, 7000, NULL, NULL, 'CAD', 75, 15, TRUE, FALSE, 8
    ),
    (
        (SELECT id FROM service_categories WHERE name = 'Removal'),
        'Nail Removal',
        'Safe soak-off removal of gel, acrylic, or extensions.',
        'Safe gel/acrylic soak-off removal',
        'FIXED', 1500, NULL, NULL, NULL, 'CAD', 20, 5, TRUE, FALSE, 9
    ),
    (
        (SELECT id FROM service_categories WHERE name = 'Removal'),
        'Nail Repair',
        'A quick repair for a chipped or broken nail.',
        'Repair for a chipped or broken nail',
        'STARTING_FROM', NULL, 1000, NULL, NULL, 'CAD', 20, 5, TRUE, FALSE, 10
    );
