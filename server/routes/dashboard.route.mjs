/** 首页：歌列表 + 进度 + 待办。 */
import { Hono } from 'hono';
import { buildDashboard } from '../services/dashboard.service.mjs';

export const dashboardRoute = new Hono();

dashboardRoute.get('/songs', (c) => c.json(buildDashboard()));
