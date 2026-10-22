/**
 * db.mjs — 单例连接 + 三个薄查询助手。
 * 只有 repository 层用它；service 不写 SQL，route 不碰库。
 */
import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { config } from './config.mjs';

let handle = null;

export function getDb() {
  if (handle) return handle;
  if (!existsSync(config.dbPath)) {
    throw new Error(`库不存在：${config.dbPath}（先跑 npm run db:init）`);
  }
  handle = new DatabaseSync(config.dbPath);
  handle.exec('PRAGMA foreign_keys = ON');
  return handle;
}

export const all = (sql, ...params) => getDb().prepare(sql).all(...params);
export const one = (sql, ...params) => getDb().prepare(sql).get(...params);
export const run = (sql, ...params) => getDb().prepare(sql).run(...params);

export function closeDb() {
  if (handle) { handle.close(); handle = null; }
}
