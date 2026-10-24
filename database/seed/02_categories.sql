
-- Seed parent categories
INSERT INTO categories (name, parent_id)
SELECT names.name, NULL
FROM (
    SELECT 'Books' AS name
    UNION ALL SELECT 'Electronics'
    UNION ALL SELECT 'Stationery'
    UNION ALL SELECT 'Hostel Essentials'
    UNION ALL SELECT 'Sports'
    UNION ALL SELECT 'Clothing'
) AS names
WHERE NOT EXISTS (
    SELECT 1 FROM categories c WHERE c.name = names.name
);

-- Seed subcategories
INSERT INTO categories (name, parent_id)
SELECT child.name, parent.id
FROM (
    SELECT 'Textbooks' AS name, 'Books' AS parent_name
    UNION ALL SELECT 'Notes and Guides', 'Books'
    UNION ALL SELECT 'Laptops and Accessories', 'Electronics'
    UNION ALL SELECT 'Phones and Accessories', 'Electronics'
    UNION ALL SELECT 'Lab Supplies', 'Stationery'
    UNION ALL SELECT 'Pens and Notebooks', 'Stationery'
    UNION ALL SELECT 'Bedding', 'Hostel Essentials'
    UNION ALL SELECT 'Storage and Organizers', 'Hostel Essentials'
    UNION ALL SELECT 'Sports Equipment', 'Sports'
    UNION ALL SELECT 'Clothing and Shoes', 'Clothing'
) AS child
JOIN categories parent ON parent.name = child.parent_name
WHERE NOT EXISTS (
    SELECT 1
    FROM categories existing
    WHERE existing.name = child.name
);
