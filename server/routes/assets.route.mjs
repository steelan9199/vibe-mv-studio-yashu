/** 资产库：筛选列表 + 单件明细。 */
import { Hono } from 'hono';
import { buildAssetDetail, buildAssetList } from '../services/assets.service.mjs';

export const assetsRoute = new Hono();

assetsRoute.get('/assets', (c) => {
  const q = c.req.query();
  return c.json(buildAssetList({
    song: q.song || undefined,
    cat: q.cat || undefined,
    channel: q.channel || undefined,
    status: q.status || undefined,
  }));
});

assetsRoute.get('/assets/:id', (c) => {
  const detail = buildAssetDetail(Number(c.req.param('id')));
  return detail ? c.json(detail) : c.json({ error: '没有这件资产' }, 404);
});
