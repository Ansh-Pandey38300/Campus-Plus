-- Requests
-- Owner: (Ayush)
-- Tables: requests, seller_items
-- Rules: plural lowercase table names, id as primary key, created_at on every table,
--        DECIMAL(10,2) for money, DATETIME for dates. Only the owner edits this file.


USE campus_plus;

-- 1. Table: requests
CREATE TABLE IF NOT EXISTS requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    pickup_location_id INT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    max_budget DECIMAL(10,2) NOT NULL CHECK (max_budget > 0),
    deadline DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (pickup_location_id) REFERENCES pickup_locations(id) ON DELETE RESTRICT
);

-- 2. Table: seller_items
CREATE TABLE IF NOT EXISTS seller_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    item_condition VARCHAR(30) NOT NULL,
    asking_price DECIMAL(10,2) NOT NULL CHECK (asking_price > 0),
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);