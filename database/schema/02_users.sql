-- Users
-- Owner: vishal
-- Tables: users, plus anything needed for roles
-- Rules: plural lowercase table names, id as primary key, created_at on every table,
--        DECIMAL(10,2) for money, DATETIME for dates. Only the owner edits this file.
-- 1. Create USERS table
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    department_id INT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT chk_users_role
        CHECK (role IN ('student', 'senior', 'admin')),

    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
) ENGINE=InnoDB;