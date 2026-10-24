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