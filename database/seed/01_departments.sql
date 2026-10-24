
-- Seed departments for Campus Plus
INSERT INTO departments (name)
SELECT names.name
FROM (
    SELECT 'Computer Science' AS name
    UNION ALL SELECT 'Electronics and Communication'
    UNION ALL SELECT 'Mechanical Engineering'
    UNION ALL SELECT 'Civil Engineering'
    UNION ALL SELECT 'Electrical Engineering'
    UNION ALL SELECT 'Information Technology'
    UNION ALL SELECT 'Biotechnology'
    UNION ALL SELECT 'Business Administration'
) AS names
WHERE NOT EXISTS (
    SELECT 1
    FROM departments d
    WHERE d.name = names.name
);
