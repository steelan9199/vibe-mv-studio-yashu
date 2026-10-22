#!/usr/bin/env node
/** main.mjs — 启动入口：定工作目录 → 起服务。 */
import { serve } from '@hono/node-server';
import { config } from './config.mjs';
import { app } from './app.mjs';

/* serveStatic 的 root 相对 cwd，锁死到技能目录，双击启动也不会跑偏 */
process.chdir(config.root);

serve({ fetch: app.fetch, hostname: config.host, port: config.port }, (info) => {
  console.log(`[studio] MV 工作室  http://${info.address}:${info.port}`);
  console.log(`[studio] 库      ${config.dbPath}`);
  console.log(`[studio] 文件库  ${config.libRoot}`);
});
