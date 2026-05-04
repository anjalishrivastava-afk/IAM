import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const DB_PATH = join(__dirname, '..', 'data', 'dev.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  mkdirSync(dirname(DB_PATH), { recursive: true })
  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  migrate(_db)
  return _db
}

export function closeDb(): void {
  _db?.close()
  _db = null
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS role (
      id TEXT PRIMARY KEY,
      role_name TEXT NOT NULL,
      description TEXT NOT NULL,
      scope_type TEXT NOT NULL,
      assigned_user_count INTEGER NOT NULL DEFAULT 0,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS privilege_set (
      id TEXT PRIMARY KEY,
      privilege_set_name TEXT NOT NULL,
      description TEXT NOT NULL,
      long_description TEXT NOT NULL,
      scope_type TEXT NOT NULL,
      assigned_role_count INTEGER NOT NULL DEFAULT 0,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_privilege_set (
      role_id TEXT NOT NULL REFERENCES role(id) ON DELETE CASCADE,
      privilege_set_id TEXT NOT NULL REFERENCES privilege_set(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, privilege_set_id)
    );

    CREATE TABLE IF NOT EXISTS role_assigned_user (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL REFERENCES role(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_rau_role ON role_assigned_user(role_id);

    CREATE TABLE IF NOT EXISTS privilege_category (
      id TEXT PRIMARY KEY,
      privilege_set_id TEXT NOT NULL REFERENCES privilege_set(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      sidebar_count_label INTEGER NOT NULL,
      granted_count INTEGER NOT NULL,
      total_count INTEGER NOT NULL,
      sort_order INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_pc_ps ON privilege_category(privilege_set_id);

    CREATE TABLE IF NOT EXISTS privilege_subgroup (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES privilege_category(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      granted_count INTEGER NOT NULL,
      total_count INTEGER NOT NULL,
      sort_order INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_psg_cat ON privilege_subgroup(category_id);

    CREATE TABLE IF NOT EXISTS privilege_permission (
      id TEXT PRIMARY KEY,
      subgroup_id TEXT NOT NULL REFERENCES privilege_subgroup(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      default_granted INTEGER NOT NULL,
      is_plan_gated INTEGER NOT NULL,
      sort_order INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_pp_sg ON privilege_permission(subgroup_id);

    CREATE TABLE IF NOT EXISTS permission_grant (
      privilege_set_id TEXT NOT NULL REFERENCES privilege_set(id) ON DELETE CASCADE,
      permission_id TEXT NOT NULL REFERENCES privilege_permission(id) ON DELETE CASCADE,
      granted INTEGER NOT NULL,
      PRIMARY KEY (privilege_set_id, permission_id)
    );
  `)
}
