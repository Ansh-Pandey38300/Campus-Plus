-- Deals
-- Owner: Parth
-- Tables: deals, transactions, handover_records, complaints, penalties
-- Rules: plural lowercase table names, id as primary key, created_at on every table,
--        DECIMAL(10,2) for money, DATETIME for dates. Only the owner edits this file.
-- Deals: records the agreement between buyer and seller.
CREATE TABLE IF NOT EXISTS deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL UNIQUE,
    offer_id INT NOT NULL UNIQUE,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    agreed_amount DECIMAL(10,2) NOT NULL,
    status ENUM('confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'confirmed',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_deals_request
        FOREIGN KEY (request_id) REFERENCES requests(id),
    CONSTRAINT fk_deals_offer
        FOREIGN KEY (offer_id) REFERENCES offers(id),
    CONSTRAINT fk_deals_buyer
        FOREIGN KEY (buyer_id) REFERENCES users(id),
    CONSTRAINT fk_deals_seller
        FOREIGN KEY (seller_id) REFERENCES users(id),

    CONSTRAINT chk_deals_agreed_amount
        CHECK (agreed_amount > 0)
) ENGINE=InnoDB;
-- Transactions: records payment attempts for a deal.
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
    reference_code VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_deal
        FOREIGN KEY (deal_id) REFERENCES deals(id),
    CONSTRAINT chk_transactions_amount
        CHECK (amount > 0)
) ENGINE=InnoDB;
-- Handover records: tracks item handover and buyer confirmation.
CREATE TABLE IF NOT EXISTS handover_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT NOT NULL UNIQUE,
    status ENUM('agreed', 'handed_over', 'confirmed')
        NOT NULL DEFAULT 'agreed',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_handover_records_deal
        FOREIGN KEY (deal_id) REFERENCES deals(id)
) ENGINE=InnoDB;
-- Complaints: records safety or transaction complaints.
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT NOT NULL,
    reporter_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('open', 'under_review', 'resolved', 'rejected')
        NOT NULL DEFAULT 'open',
    reviewed_by INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME NULL,
    CONSTRAINT fk_complaints_deal
        FOREIGN KEY (deal_id) REFERENCES deals(id),
    CONSTRAINT fk_complaints_reporter
        FOREIGN KEY (reporter_id) REFERENCES users(id),
    CONSTRAINT fk_complaints_reviewer
        FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB;
-- Penalties: records actions taken against a user after complaint review.
CREATE TABLE IF NOT EXISTS penalties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    complaint_id INT NOT NULL,
    type ENUM('warning', 'temporary_block') NOT NULL,
    until_date DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_penalties_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_penalties_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaints(id)
) ENGINE=InnoDB;