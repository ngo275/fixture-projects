-- PostgreSQL Database Setup Script
-- Run this script as the postgres superuser

-- Create database
CREATE DATABASE blog_db;

-- Create user
CREATE USER user WITH PASSWORD 'password';

-- Grant privileges
ALTER ROLE user SET client_encoding TO 'utf8';
ALTER ROLE user SET default_transaction_isolation TO 'read committed';
ALTER ROLE user SET timezone TO 'UTC';

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE django_blog_db TO user;

-- Connect to the database and grant schema privileges
\c django_blog_db;
GRANT ALL ON SCHEMA public TO user;