-- Fix Django user permissions
-- Run this as postgres superuser

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE django_blog_db TO "user";

-- Connect to the database
\c django_blog_db;

-- Grant all privileges on all tables (including django_migrations)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "user";

-- Grant all privileges on all sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "user";

-- Grant all privileges on the public schema
GRANT ALL PRIVILEGES ON SCHEMA public TO "user";

-- Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO "user";

-- Make the user the owner of the public schema (if needed)
-- ALTER SCHEMA public OWNER TO "user";

-- Grant privileges on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "user";
