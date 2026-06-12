import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config } from "./config.js";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'instructor', 'admin')),
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK(provider IN ('github', 'linkedin')),
  provider_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS oauth_exchange_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code_hash TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user ON oauth_accounts(user_id);

CREATE TABLE IF NOT EXISTS lecture_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL COLLATE NOCASE,
  lecture_number INTEGER NOT NULL,
  sections_json TEXT NOT NULL DEFAULT '{}',
  quiz_score INTEGER,
  quiz_completed INTEGER NOT NULL DEFAULT 0,
  problems_completed_json TEXT NOT NULL DEFAULT '[]',
  hands_on_task_completed INTEGER NOT NULL DEFAULT 0,
  lecture_completed INTEGER NOT NULL DEFAULT 0,
  last_section TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, course_slug, lecture_number)
);

CREATE TABLE IF NOT EXISTS project_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL COLLATE NOCASE,
  project_id TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, course_slug, project_id)
);

CREATE TABLE IF NOT EXISTS user_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK(activity_type IN ('lecture_complete','quiz_passed','problem_solved','project_completed','course_complete','progress_update')),
  meta_json TEXT NOT NULL DEFAULT '{}',
  activity_date TEXT NOT NULL DEFAULT (date('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_lecture_progress_user ON lecture_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_user ON project_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_date ON user_activities(user_id, activity_date);
`;

let db: DatabaseSync | null = null;

function migrateOAuthProviders(database: DatabaseSync): void {
  const row = database
    .prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'oauth_accounts'`)
    .get() as { sql?: string } | undefined;
    if (!row?.sql || !row.sql.includes("'google'")) return;

  database.exec(`
    CREATE TABLE oauth_accounts_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL CHECK(provider IN ('github', 'linkedin')),
      provider_user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(provider, provider_user_id)
    );
    INSERT INTO oauth_accounts_new SELECT * FROM oauth_accounts;
    DROP TABLE oauth_accounts;
    ALTER TABLE oauth_accounts_new RENAME TO oauth_accounts;
    CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user ON oauth_accounts(user_id);
  `);
}

export function getDb(): DatabaseSync {
  if (db) return db;

  const dir = path.dirname(config.databasePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new DatabaseSync(config.databasePath);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(SCHEMA);
  migrateOAuthProviders(db);
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function resetDbForTests(databasePath: string): DatabaseSync {
  closeDb();
  if (fs.existsSync(databasePath)) fs.unlinkSync(databasePath);
  process.env.DATABASE_PATH = databasePath;
  return getDb();
}
