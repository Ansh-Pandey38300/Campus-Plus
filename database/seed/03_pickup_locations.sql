
-- Seed suggested campus pickup locations
INSERT INTO pickup_locations (name, description)
SELECT locations.name, locations.description
FROM (
    SELECT 'Main Gate' AS name, 'Meet near the main campus entrance' AS description
    UNION ALL SELECT 'Library', 'Meet outside the central library'
    UNION ALL SELECT 'Cafeteria', 'Meet near the campus cafeteria'
    UNION ALL SELECT 'Main Academic Block', 'Meet at the main academic building'
    UNION ALL SELECT 'Hostel Reception', 'Meet near the hostel reception'
) AS locations
WHERE NOT EXISTS (
    SELECT 1
    FROM pickup_locations p
    WHERE p.name = locations.name
);
