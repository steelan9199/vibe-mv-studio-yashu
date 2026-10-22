/**
 * app.mjs — Hono 应用装配：API、媒体、静态产物、SPA 兜底、错误兜底。
 * 这里不写业务，业务在 service / route。
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { config } from './config.mjs';
import { apiRoute } from './routes/index.mjs';
import { mediaRoute } from './routes/media.route.mjs';

export const app = new Hono();

app.use('*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'no-store');
});

app.route('/api', apiRoute);
app.route('/media', mediaRoute);

/* Vite 构建产物：/assets/* 是带 hash 的静态文件 */
app.use('/assets/*', serveStatic({ root: './web/dist' }));

/* 其余 GET 一律交给 Vue Router（history 模式） */
app.get('*', (c) => {
  const entry = path.join(config.distDir, 'index.html');
  if (!existsSync(entry)) {
    return c.text('前端还没构建。在技能目录跑一次：npm run build', 503);
  }
  return c.html(readFileSync(entry, 'utf8'));
});

app.notFound((c) => c.json({ error: 'not found' }, 404));

app.onError((error, c) => {
  console.error('[studio]', error);
  return c.json({ error: error.message }, 500);
});
