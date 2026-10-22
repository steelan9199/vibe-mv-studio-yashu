/** 单歌：一次给全量，页面不再二次请求。 */
import { Hono } from 'hono';
import { buildSongDetail } from '../services/song.service.mjs';

export const songRoute = new Hono();

songRoute.get('/song/:slug', (c) => {
  const detail = buildSongDetail(c.req.param('slug'));
  return detail ? c.json(detail) : c.json({ error: '没有这首歌' }, 404);
});
