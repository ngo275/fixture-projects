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
ENV_LOCAL_FILE="$PROJECT_ROOT/.env.local"

echo "Loading environment variables..."
# Load env vars (optional .env and .env.local). Fall back to existing env + defaults
set -a
if [ -f "$ENV_FILE" ]; then
  echo "- Loaded $ENV_FILE"
  source "$ENV_FILE"
else
  echo "- Warning: .env not found at $ENV_FILE (proceeding with current environment and defaults)"
fi
if [ -f "$ENV_LOCAL_FILE" ]; then
  echo "- Loaded $ENV_LOCAL_FILE"
  source "$ENV_LOCAL_FILE"
fi
set +a

# Defaults if not present
DB_NAME="${DB_NAME:-django_blog_db}"
DB_USER="${DB_USER:-_user}"
DB_PASSWORD="${DB_PASSWORD:-password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Superuser to run admin commands. Override with PGSUPERUSER env if needed.
PGSUPERUSER="${PGSUPERUSER:-postgres}"

# If no PGPASSWORD is set for non-interactive psql, try common fallbacks
if [ -z "${PGPASSWORD:-}" ]; then
  if [ -n "${PG_SUPERUSER_PASSWORD:-}" ]; then
    export PGPASSWORD="$PG_SUPERUSER_PASSWORD"
    echo "Using PGPASSWORD from PG_SUPERUSER_PASSWORD"
  elif [ -n "${POSTGRES_PASSWORD:-}" ]; then
    export PGPASSWORD="$POSTGRES_PASSWORD"
    echo "Using PGPASSWORD from POSTGRES_PASSWORD"
  fi
fi

echo "Using DB_NAME=$DB_NAME, DB_USER=$DB_USER, DB_HOST=$DB_HOST, DB_PORT=$DB_PORT"

PSQL_BASE=(psql -v ON_ERROR_STOP=1 -h "$DB_HOST" -p "$DB_PORT")

# Helper to run SQL as superuser (PGPASSWORD/PGUSER can be set by caller)
psql_su() {
  "${PSQL_BASE[@]}" -U "$PGSUPERUSER" "$@"
}

# Verify admin privileges (SUPERUSER or CREATEROLE) before proceeding
echo "Checking admin privileges for user '$PGSUPERUSER'..."
if ! ADMIN_CHECK=$(psql_su -d postgres -tAc "SELECT current_user, rolsuper, rolcreaterole FROM pg_roles WHERE rolname = current_user" 2>&1); then
  echo "Error: failed to connect as '$PGSUPERUSER'."
  echo "$ADMIN_CHECK"
  echo "Hint: Set a password via one of: export PGPASSWORD=... | export PG_SUPERUSER_PASSWORD=... | export POSTGRES_PASSWORD=..."
  echo "      Or set PGSUPERUSER to an admin role (with SUPERUSER or CREATEROLE)."
  exit 1
fi
IFS='|' read -r CURRENT_USER IS_SUPER IS_CREATEROLE <<< "$ADMIN_CHECK"
if [ "${IS_SUPER}" != "t" ] && [ "${IS_CREATEROLE}" != "t" ]; then
  echo "Error: connected as '$CURRENT_USER' without sufficient privileges (SUPERUSER/CREATEROLE required)."
  echo "Set PGSUPERUSER to an admin role and export its password (PGPASSWORD, PG_SUPERUSER_PASSWORD, or POSTGRES_PASSWORD)."
  exit 1
fi

echo "Ensuring role '$DB_USER' exists..."
psql_su -d postgres <<SQL
DO \$\$
DECLARE
  v_user text := '${DB_USER}';
  v_password text := '${DB_PASSWORD}';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = v_user) THEN
    EXECUTE format('CREATE USER %I WITH PASSWORD %L', v_user, v_password);
  ELSE
    -- Reset password to match env to avoid drift
    EXECUTE format('ALTER ROLE %I WITH PASSWORD %L', v_user, v_password);
  END IF;
END
\$\$ LANGUAGE plpgsql;
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
ALTER ROLE "${DB_USER}" SET client_encoding TO 'utf8';
ALTER ROLE "${DB_USER}" SET default_transaction_isolation TO 'read committed';
ALTER ROLE "${DB_USER}" SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME}" TO "${DB_USER}";
SQL

echo "Granting schema privileges on '$DB_NAME'..."
psql_su -d "$DB_NAME" <<SQL
GRANT ALL ON SCHEMA public TO "${DB_USER}";
SQL

echo "Database setup complete."

