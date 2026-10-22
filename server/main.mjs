#!/usr/bin/env node
/**
 * main.mjs — 启动入口：定工作目录 → 起服务 → 就绪后打开 Edge。
 * 端口已被自己占用时不报错崩掉，而是提示「已经开着了」并直接把页面打开。
 */
import { serve } from '@hono/node-server';
import { config } from './config.mjs';
import { app } from './app.mjs';
import { probe } from './http/probe.mjs';
import { openBrowser } from './open-browser.mjs';

/* serveStatic 的 root 相对 cwd，锁死到技能目录，双击启动也不会跑偏 */
process.chdir(config.root);

const base = `http://${config.host}:${config.port}/`;

const server = serve({ fetch: app.fetch, hostname: config.host, port: config.port }, (info) => {
  const url = `http://${info.address}:${info.port}/`;
  console.log('');
  console.log(`  MV 工作室已就绪  ${url}`);
  console.log(`  库      ${config.dbPath}`);
  console.log(`  文件库  ${config.libRoot}`);
  console.log('');
  console.log('  正在用 Edge 打开工作台…（这个窗口别关，关了服务就停）');
  console.log('');
  openBrowser(url);
});

server.on('error', async (error) => {
  if (error?.code !== 'EADDRINUSE') throw error;

  const alreadyOurs = await probe(`${base}api/songs`);
  if (alreadyOurs) {
    console.log('');
    console.log(`  工作室已经在跑了：${base}`);
    console.log('  直接把页面打开，不用再起第二个。');
    openBrowser(base);
    /* 退出码 2 = 「本来就在跑」，启动脚本看到它会直接收工，不留一个要按键的窗口 */
    process.exit(2);
  }

  console.error('');
  console.error(`  端口 ${config.port} 被别的程序占了，起不来。`);
  console.error('  换个端口：set MV_PORT=8792 && node server\\main.mjs');
  process.exit(1);
});
