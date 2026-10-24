-- Users
-- Owner: vishal
-- Tables: users, plus anything needed for roles
-- Rules: plural lowercase table names, id as primary key, created_at on every table,
--        DECIMAL(10,2) for money, DATETIME for dates. Only the owner edits this file.
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


