/** 技能：矩阵 + 调用明细。 */
import { Hono } from 'hono';
import { buildRuns, buildSkills } from '../services/skills.service.mjs';

export const skillsRoute = new Hono();

skillsRoute.get('/skills', (c) => c.json(buildSkills()));

skillsRoute.get('/runs', (c) => c.json(buildRuns(c.req.query('song'))));
