-- 1. Requests without offers
SELECT r.id, r.title, r.max_budget, r.status
FROM requests r
WHERE NOT EXISTS (
    SELECT 1
    FROM offers o
    WHERE o.request_id = r.id
);

-- 2. Top categories by number of requests
SELECT c.name AS category, COUNT(r.id) AS total_requests
FROM categories c
LEFT JOIN requests r ON r.category_id = c.id
GROUP BY c.id, c.name
ORDER BY total_requests DESC;

-- 3. Top sellers by completed deals
SELECT u.id, u.name, COUNT(d.id) AS completed_deals
FROM users u
JOIN deals d ON d.seller_id = u.id
WHERE d.status = 'completed'
GROUP BY u.id, u.name
ORDER BY completed_deals DESC;

-- 4. Buyer savings on completed deals
SELECT
    r.id AS request_id,
    r.title,
    r.max_budget,
    d.agreed_amount,
    (r.max_budget - d.agreed_amount) AS savings
FROM deals d
JOIN requests r ON r.id = d.request_id
WHERE d.status = 'completed'
ORDER BY savings DESC;