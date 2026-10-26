
-- Seed suggested campus pickup locations
INSERT INTO pickup_locations (name, description)
SELECT locations.name, locations.description
FROM (
    SELECT 'Main Gate' AS name, 'Meet near the main campus entrance' AS description
    UNION ALL SELECT 'Library', 'Meet outside the central library'
    UNION ALL SELECT 'Cafeteria', 'Meet near the campus cafeteria'
    UNION ALL SELECT 'Main Academic Block', 'Meet at the main academic building'
    UNION ALL SELECT 'Hostel Reception', 'Meet near the hostel reception'
    UNION ALL SELECT 'Sports Complex', 'Meet near the campus sports complex'
    UNION ALL SELECT 'Auditorium', 'Meet outside the campus auditorium'
    UNION ALL SELECT 'Computer Lab Block', 'Meet near the computer laboratory block'
    UNION ALL SELECT 'Admin Office', 'Meet outside the administration office'
    UNION ALL SELECT 'Parking Area', 'Meet at the main campus parking area'
    UNION ALL SELECT 'Medical Room', 'Meet near the campus medical room'
    UNION ALL SELECT 'Workshop Block', 'Meet near the workshop building'
    UNION ALL SELECT 'Garden Area', 'Meet in the campus garden area'
    UNION ALL SELECT 'Bus Stop', 'Meet at the campus bus stop'
    UNION ALL SELECT 'Sports Complex', 'Meet near the campus sports complex'
) AS locations
WHERE NOT EXISTS (
    SELECT 1
    FROM pickup_locations p
    WHERE p.name = locations.name
);
