/** 成本：总计 / 按歌 / 按资产 / 流水。 */
import { Hono } from 'hono';
import { buildCosts } from '../services/costs.service.mjs';

export const costsRoute = new Hono();

costsRoute.get('/costs', (c) => c.json(buildCosts()));
