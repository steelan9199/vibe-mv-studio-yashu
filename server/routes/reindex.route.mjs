/** 刷新索引：唯一的写方向动作（ingest，不是页面渲染）。 */
import { Hono } from 'hono';
import { config } from '../config.mjs';
import { getDb } from '../db.mjs';
import { reindex } from '../ingest.mjs';

export const reindexRoute = new Hono();

reindexRoute.post('/reindex', (c) => {
  const result = reindex(getDb(), { libRoot: config.libRoot, skillsDir: config.skillsDir });
  return c.json({ ok: true, ...result });
});
