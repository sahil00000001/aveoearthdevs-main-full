-- Simple enum fix for user_type
DROP TYPE IF EXISTS user_type CASCADE;
CREATE TYPE user_type AS ENUM ('BUYER', 'SUPPLIER', 'ADMIN');
