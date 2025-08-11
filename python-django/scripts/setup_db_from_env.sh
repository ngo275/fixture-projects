#!/usr/bin/env bash
set -euo pipefail

# Ensure we are running with bash even if invoked via `sh`
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi

# This script creates the PostgreSQL database and user using values from python-django/.env

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env not found at $ENV_FILE"
  echo "Create it with your DB settings first."
  exit 1
fi

# Load env vars
set -a
source "$ENV_FILE"
set +a

# Defaults if not present
DB_NAME="${DB_NAME:-django_blog_db}"
DB_USER="${DB_USER:-django_user}"
DB_PASSWORD="${DB_PASSWORD:-django_password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Superuser to run admin commands. Override with PGSUPERUSER env if needed.
PGSUPERUSER="${PGSUPERUSER:-postgres}"

echo "Using DB_NAME=$DB_NAME, DB_USER=$DB_USER, DB_HOST=$DB_HOST, DB_PORT=$DB_PORT"

PSQL_BASE=(psql -v ON_ERROR_STOP=1 -h "$DB_HOST" -p "$DB_PORT")

# Helper to run SQL as superuser (PGPASSWORD/PGUSER can be set by caller)
psql_su() {
  "${PSQL_BASE[@]}" -U "$PGSUPERUSER" "$@"
}

echo "Ensuring role '$DB_USER' exists..."
psql_su -d postgres <<SQL
DO \$$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
  ELSE
    -- Reset password to match .env to avoid drift
    ALTER ROLE $DB_USER WITH PASSWORD '$DB_PASSWORD';
  END IF;
END\$$;
SQL

echo "Ensuring database '$DB_NAME' exists..."
# Can't CREATE DATABASE inside a DO/transaction. Check and create outside.
DB_EXISTS=$(psql_su -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'")
if [ "$DB_EXISTS" != "1" ]; then
  psql_su -d postgres -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";"
else
  echo "Database '$DB_NAME' already exists."
fi

echo "Applying role settings and privileges..."
psql_su -d postgres <<SQL
ALTER ROLE $DB_USER SET client_encoding TO 'utf8';
ALTER ROLE $DB_USER SET default_transaction_isolation TO 'read committed';
ALTER ROLE $DB_USER SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
SQL

echo "Granting schema privileges on '$DB_NAME'..."
psql_su -d "$DB_NAME" <<SQL
GRANT ALL ON SCHEMA public TO $DB_USER;
SQL

echo "Database setup complete."

