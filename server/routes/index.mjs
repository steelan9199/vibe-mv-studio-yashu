/** 路由装配：一处挂全部 API，新增域只改这里。 */
import { Hono } from 'hono';
import { dashboardRoute } from './dashboard.route.mjs';
import { songRoute } from './song.route.mjs';
import { assetsRoute } from './assets.route.mjs';
import { skillsRoute } from './skills.route.mjs';
import { costsRoute } from './costs.route.mjs';
import { reindexRoute } from './reindex.route.mjs';

export const apiRoute = new Hono()
  .route('/', dashboardRoute)
  .route('/', songRoute)
  .route('/', assetsRoute)
  .route('/', skillsRoute)
  .route('/', costsRoute)
  .route('/', reindexRoute);
