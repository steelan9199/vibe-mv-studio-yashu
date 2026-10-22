/**
 * config.mjs — 运行期常量集中一处，别在代码里散落盘符。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  root: ROOT,
  webDir: path.join(ROOT, 'web'),
  distDir: path.join(ROOT, 'web', 'dist'),
  dbPath: process.env.MV_DB || 'D:/vibe-mv/mv.db',
  libRoot: path.resolve(process.env.MV_FILES || 'D:/vibe-mv-文件库'),
  skillsDir: process.env.MV_SKILLS || 'C:/Users/Administrator/.workbuddy/skills',
  host: process.env.MV_HOST || '127.0.0.1',
  port: Number(process.env.MV_PORT || 8791),
};
