import { Pool } from 'pg'

declare global {
  var pgPool: Pool | undefined
}

/**
 * Returns a shared pg Pool instance. Connection is created lazily on first query.
 */
export function getPool(): Pool {
  if (!global.pgPool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set')
    }
    global.pgPool = new Pool({ connectionString })
  }
  return global.pgPool
}

/**
 * Ensures the `items` table exists. Call at the beginning of each request.
 */
export async function ensureItemsTable(): Promise<void> {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    DROP TRIGGER IF EXISTS set_timestamp ON items;
    CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON items
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
  `)
}

export type Item = {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}


