import Database from '@tauri-apps/plugin-sql'
import type { BulletWithTags, Tag } from '../types'

let _db: Database | null = null

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS jobs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  company     TEXT    NOT NULL,
  title       TEXT    NOT NULL,
  start_date  TEXT    NOT NULL,
  end_date    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bullets (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id        INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  mode          TEXT    NOT NULL CHECK (mode IN ('custom', 'imm')),
  custom_text   TEXT,
  imm_impact    TEXT,
  imm_method    TEXT,
  imm_metric    TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6366f1'
);

CREATE TABLE IF NOT EXISTS bullet_tags (
  bullet_id INTEGER NOT NULL REFERENCES bullets(id) ON DELETE CASCADE,
  tag_id    INTEGER NOT NULL REFERENCES tags(id)    ON DELETE CASCADE,
  PRIMARY KEY (bullet_id, tag_id)
);

CREATE TABLE IF NOT EXISTS jd_sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL DEFAULT 'Untitled',
  jd_text    TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jd_session_bullets (
  session_id INTEGER NOT NULL REFERENCES jd_sessions(id) ON DELETE CASCADE,
  bullet_id  INTEGER NOT NULL REFERENCES bullets(id)     ON DELETE CASCADE,
  PRIMARY KEY (session_id, bullet_id)
);
`

export async function getDb(): Promise<Database> {
  if (!_db) {
    _db = await Database.load('sqlite:impact.db')
    for (const stmt of SCHEMA.split(';').map((s) => s.trim()).filter(Boolean)) {
      await _db.execute(stmt)
    }
  }
  return _db
}

export async function getTagsForBullet(db: Database, bulletId: number): Promise<Tag[]> {
  return db.select<Tag[]>(
    `SELECT t.* FROM tags t JOIN bullet_tags bt ON bt.tag_id = t.id WHERE bt.bullet_id = ? ORDER BY t.name`,
    [bulletId]
  )
}

export async function attachTagsToBullets(db: Database, bullets: Omit<BulletWithTags, 'tags'>[]): Promise<BulletWithTags[]> {
  return Promise.all(
    bullets.map(async (b) => ({
      ...b,
      tags: await getTagsForBullet(db, b.id)
    }))
  )
}

export async function setBulletTags(db: Database, bulletId: number, tagIds: number[]): Promise<void> {
  await db.execute('DELETE FROM bullet_tags WHERE bullet_id = ?', [bulletId])
  for (const tagId of tagIds) {
    await db.execute('INSERT OR IGNORE INTO bullet_tags (bullet_id, tag_id) VALUES (?, ?)', [bulletId, tagId])
  }
}
