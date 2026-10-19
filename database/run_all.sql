-- Builds the whole database in one go.
-- Run from inside the /database folder:   mysql -u root -p < run_all.sql
-- The files run in this order because later tables point to earlier ones (foreign keys).

CREATE DATABASE IF NOT EXISTS campus_plus;
USE campus_plus;

SOURCE schema/01_master_data.sql;
SOURCE schema/02_users.sql;
SOURCE schema/03_requests.sql;
SOURCE schema/04_offers.sql;
SOURCE schema/05_deals.sql;
SOURCE schema/06_trust.sql;

-- Seed data (sample rows) is added later from /database/seed
