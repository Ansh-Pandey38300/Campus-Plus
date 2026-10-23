-- 1. Create USERS table
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    department_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT chk_users_role
        CHECK (role IN ('student', 'senior', 'admin')),

    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
) ENGINE=InnoDB;


-- 2. Insert demo values into USERS
INSERT INTO users
(id, name, email, password_hash, role, department_id, created_at)
VALUES
(1, 'Aarav Mehta', 'aarav.mehta@example.com', 'DEMO_HASH_1', 'student', 1, '2026-10-20 09:15:00'),
(2, 'Diya Sharma', 'diya.sharma@example.com', 'DEMO_HASH_2', 'senior', 1, '2026-10-20 09:22:00'),
(3, 'Kabir Singh', 'kabir.singh@example.com', 'DEMO_HASH_3', 'student', 2, '2026-10-20 10:05:00'),
(4, 'Admin User', 'admin@example.com', 'DEMO_HASH_4', 'admin', NULL, '2026-10-20 10:30:00');


-- 3. Create RATINGS table
CREATE TABLE ratings (
    id INT NOT NULL AUTO_INCREMENT,
    transaction_id INT NOT NULL UNIQUE,
    rater_id INT NOT NULL,
    seller_id INT NOT NULL,
    stars INT NOT NULL,
    comment VARCHAR(1000) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT chk_ratings_stars
        CHECK (stars BETWEEN 1 AND 5),

    CONSTRAINT fk_ratings_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES transactions(id),

    CONSTRAINT fk_ratings_rater
        FOREIGN KEY (rater_id)
        REFERENCES users(id),

    CONSTRAINT fk_ratings_seller
        FOREIGN KEY (seller_id)
        REFERENCES users(id)
) ENGINE=InnoDB;


-- 4. Insert demo values into RATINGS
INSERT INTO ratings
(id, transaction_id, rater_id, seller_id, stars, comment, created_at)
VALUES
(1, 101, 1, 2, 5, 'Item as described.', '2026-10-20 11:00:00'),
(2, 102, 2, 1, 4, 'Smooth handover.', '2026-10-20 12:15:00'),
(3, 103, 3, 2, 3, 'Communication could improve.', '2026-10-20 13:30:00');


-- 5. Create NOTIFICATIONS table
CREATE TABLE notifications (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    message VARCHAR(1000) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
) ENGINE=InnoDB;


-- 6. Insert demo values into NOTIFICATIONS
INSERT INTO notifications
(id, user_id, message, is_read, created_at)
VALUES
(1, 1, 'Your offer was submitted.', FALSE, '2026-10-20 09:30:00'),
(2, 2, 'You received a new offer.', TRUE, '2026-10-20 10:10:00'),
(3, 1, 'Your transaction is confirmed.', FALSE, '2026-10-20 11:45:00'),
(4, 3, 'A request matching your category is available.', FALSE, '2026-10-20 12:20:00');