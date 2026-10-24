
-- ============================================================
-- CAMPUS PLUS
-- Module: Offers and Offer History
-- Based on: Consolidated ER Draft v1
-- Dependencies: users, requests
-- ============================================================


-- ============================================================
-- 1. OFFERS
-- Stores each seller's current offer for a request.
-- A seller can have only one offer per request.
-- ============================================================

CREATE TABLE IF NOT EXISTS offers (
    id INT NOT NULL AUTO_INCREMENT,
    request_id INT NOT NULL,
    seller_id INT NOT NULL,
    offered_price DECIMAL(10,2) NOT NULL,
    offer_note TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT uq_offers_request_seller
        UNIQUE (request_id, seller_id),

    CONSTRAINT chk_offers_offered_price
        CHECK (offered_price > 0),

    CONSTRAINT fk_offers_request
        FOREIGN KEY (request_id)
        REFERENCES requests(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_offers_seller
        FOREIGN KEY (seller_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    INDEX idx_offers_seller_id (seller_id)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 2. OFFER HISTORY
-- Stores the price-revision history of an offer.
-- The initial history record has previous_price = NULL.
-- History rows should be appended, not overwritten.
-- ============================================================

CREATE TABLE IF NOT EXISTS offer_history (
    id INT NOT NULL AUTO_INCREMENT,
    offer_id INT NOT NULL,
    previous_price DECIMAL(10,2) NULL,
    new_price DECIMAL(10,2) NOT NULL,
    changed_by_user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT chk_offer_history_previous_price
        CHECK (
            previous_price IS NULL
            OR previous_price > 0
        ),

    CONSTRAINT chk_offer_history_new_price
        CHECK (new_price > 0),

    CONSTRAINT fk_offer_history_offer
        FOREIGN KEY (offer_id)
        REFERENCES offers(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_offer_history_changed_by
        FOREIGN KEY (changed_by_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    INDEX idx_offer_history_changed_by_user_id
        (changed_by_user_id),

    INDEX idx_offer_history_created_at (created_at)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
