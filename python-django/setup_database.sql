-- PostgreSQL Database Setup Script
-- Run this script as the postgres superuser

-- Create database
CREATE DATABASE django_blog_db;

-- Create user
CREATE USER django_user WITH PASSWORD 'django_password';

-- Grant privileges
ALTER ROLE django_user SET client_encoding TO 'utf8';
ALTER ROLE django_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE django_user SET timezone TO 'UTC';

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE django_blog_db TO django_user;

-- Connect to the database and grant schema privileges
\c django_blog_db;
GRANT ALL ON SCHEMA public TO django_user;