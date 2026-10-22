#!/usr/bin/env node
/**
 * db.mjs — 建库 / 迁移 / 体检
 *
 *   node scripts/db.mjs init      建库建表（幂等，可重复跑）
 *   node scripts/db.mjs stats     打印各表行数与 schema 版本
 *
 * 数据库位置：D:\vibe-mv\mv.db（可用环境变量 MV_DB 覆盖）
 * DDL 权威：references/10-数据模型.md，两边必须一致
 */

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.MV_DB || 'D:/vibe-mv/mv.db';
const SCHEMA_VERSION = 2;

const DDL = `
CREATE TABLE IF NOT EXISTS songs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  dur        REAL,
  bpm        REAL,
  music_key  TEXT,
  engine     TEXT,
  canvas     TEXT,
  note       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS stages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id     INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  gate        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'todo',
  started_at  TEXT,
  finished_at TEXT,
  note        TEXT,
  UNIQUE(song_id, gate)
);

CREATE TABLE IF NOT EXISTS artifacts (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  gate    TEXT NOT NULL,
  kind    TEXT NOT NULL,
  path    TEXT NOT NULL,
  bytes   INTEGER,
  md5     TEXT,
  mtime   TEXT,
  note    TEXT,
  UNIQUE(song_id, path)
);

CREATE TABLE IF NOT EXISTS docs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id    INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL,
  path       TEXT,
  doc        TEXT NOT NULL,
  md5        TEXT,
  version    INTEGER NOT NULL DEFAULT 1,
  meta_json  TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE(song_id, kind, version)
);

CREATE TABLE IF NOT EXISTS assets (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id   INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  asset_key TEXT NOT NULL,
  name      TEXT NOT NULL,
  cat       TEXT NOT NULL,
  angle     TEXT,
  channel   TEXT,
  status    TEXT NOT NULL DEFAULT 'todo',
  spec_json TEXT,
  note      TEXT,
  UNIQUE(song_id, asset_key)
);

CREATE TABLE IF NOT EXISTS images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id   INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  path       TEXT NOT NULL,
  kind       TEXT NOT NULL DEFAULT 'ref',
  w          INTEGER,
  h          INTEGER,
  bytes      INTEGER,
  sha256     TEXT NOT NULL UNIQUE,
  prompt     TEXT,
  seed       INTEGER,
  workflow   TEXT,
  cost       REAL NOT NULL DEFAULT 0,
  picked     INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS svgs (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  path     TEXT NOT NULL,
  symbol   TEXT NOT NULL,
  source   TEXT NOT NULL,
  version  INTEGER NOT NULL DEFAULT 1,
  approved INTEGER NOT NULL DEFAULT 0,
  bytes    INTEGER,
  note     TEXT,
  UNIQUE(asset_id, version)
);

CREATE TABLE IF NOT EXISTS skills (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL UNIQUE,
  layer     TEXT,
  role      TEXT,
  version   TEXT,
  doc_path  TEXT,
  synced_at TEXT
);

CREATE TABLE IF NOT EXISTS skill_runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id     INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  skill_id    INTEGER NOT NULL REFERENCES skills(id),
  gate        TEXT,
  run_key     TEXT NOT NULL UNIQUE,
  started_at  TEXT,
  ended_at    TEXT,
  ok          INTEGER NOT NULL DEFAULT 1,
  note        TEXT,
  artifact_id INTEGER REFERENCES artifacts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS decisions (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  scope   TEXT NOT NULL,
  target  TEXT NOT NULL,
  verdict TEXT NOT NULL,
  note    TEXT,
  at      TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS costs (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id  INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  kind     TEXT NOT NULL,
  qty      REAL NOT NULL DEFAULT 1,
  amount   REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CNY',
  ref      TEXT,
  at       TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE INDEX IF NOT EXISTS idx_docs_song      ON docs(song_id, kind);
CREATE INDEX IF NOT EXISTS idx_stages_song    ON stages(song_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_song ON artifacts(song_id, gate);
CREATE INDEX IF NOT EXISTS idx_assets_song    ON assets(song_id, cat);
CREATE INDEX IF NOT EXISTS idx_images_asset   ON images(asset_id, kind);
CREATE INDEX IF NOT EXISTS idx_images_picked  ON images(picked) WHERE picked = 1;
CREATE INDEX IF NOT EXISTS idx_runs_song      ON skill_runs(song_id, gate);
CREATE INDEX IF NOT EXISTS idx_decisions_song ON decisions(song_id, scope);
CREATE INDEX IF NOT EXISTS idx_costs_song     ON costs(song_id, at);

CREATE VIEW IF NOT EXISTS v_song_progress AS
SELECT so.id AS song_id, so.slug, so.title,
       count(*) FILTER (WHERE st.status = 'done') AS done_gates,
       count(*)                                   AS total_gates,
       max(st.finished_at)                        AS last_touch
FROM songs so JOIN stages st ON st.song_id = so.id
GROUP BY so.id;

CREATE VIEW IF NOT EXISTS v_asset_pipeline AS
SELECT a.id AS asset_id, a.song_id, a.asset_key, a.name, a.cat, a.channel, a.status,
       count(i.id)                                 AS img_total,
       count(i.id) FILTER (WHERE i.picked = 1)     AS img_picked,
       count(i.id) FILTER (WHERE i.kind = 'final') AS img_final,
       (SELECT count(*) FROM svgs v WHERE v.asset_id = a.id AND v.approved = 1) AS svg_ok
FROM assets a LEFT JOIN images i ON i.asset_id = a.id
GROUP BY a.id;
`;

function open() {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  return db;
}

function init() {
  const db = open();
  db.exec(DDL);
  db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  ).all();
  const views = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='view' ORDER BY name"
  ).all();
  console.log(`[db] ${DB_PATH}`);
  console.log(`[db] schema v${db.prepare('PRAGMA user_version').get().user_version}`);
  console.log(`[db] tables(${tables.length}): ${tables.map(t => t.name).join(', ')}`);
  console.log(`[db] views(${views.length}): ${views.map(v => v.name).join(', ')}`);
  db.close();
}

function stats() {
  const db = open();
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  ).all();
  console.log(`[db] ${DB_PATH}  schema v${db.prepare('PRAGMA user_version').get().user_version}`);
  for (const t of tables) {
    const n = db.prepare(`SELECT count(*) AS n FROM "${t.name}"`).get().n;
    console.log(`  ${t.name.padEnd(14)} ${n}`);
  }
  db.close();
}

const cmd = process.argv[2];
if (cmd === 'init') init();
else if (cmd === 'stats') stats();
else {
  console.log('用法: node scripts/db.mjs init|stats');
  process.exit(1);
}
