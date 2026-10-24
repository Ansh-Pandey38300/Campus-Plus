-- Trust
-- Owner: vishal
-- Tables: ratings, notifications
-- Rules: plural lowercase table names, id as primary key, created_at on every table,
--        DECIMAL(10,2) for money, DATETIME for dates. Only the owner edits this file.
-- 3. Create RATINGS table
CREATE TABLE IF NOT EXISTS ratings (
    id INT NOT NULL AUTO_INCREMENT,
    deal_id INT NOT NULL UNIQUE,
    rater_id INT NOT NULL,
    seller_id INT NOT NULL,
    stars INT NOT NULL,
    comment VARCHAR(1000) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT chk_ratings_stars
        CHECK (stars BETWEEN 1 AND 5),

    CONSTRAINT fk_ratings_deal
        FOREIGN KEY (deal_id)
        REFERENCES deals(id),

    CONSTRAINT fk_ratings_rater
        FOREIGN KEY (rater_id)
        REFERENCES users(id),

    CONSTRAINT fk_ratings_seller
        FOREIGN KEY (seller_id)
        REFERENCES users(id)
) ENGINE=InnoDB;


-- 4. Insert demo values into RATINGS
INSERT INTO ratings
(id, deal_id, rater_id, seller_id, stars, comment, created_at)
VALUES
(1, 101, 1, 2, 5, 'Item as described.', '2026-10-20 11:00:00'),
(2, 102, 2, 1, 4, 'Smooth handover.', '2026-10-20 12:15:00'),
(3, 103, 3, 2, 3, 'Communication could improve.', '2026-10-20 13:30:00');


-- 5. Create NOTIFICATIONS table
CREATE TABLE IF NOT EXISTS notifications (
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