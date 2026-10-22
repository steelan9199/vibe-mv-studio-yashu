#!/usr/bin/env node
/**
 * open-studio.mjs — 在 VS Code 里点一下，打开数据工作台。
 *
 * 干三件事，顺序不许反：
 *   1. 探活：`/api/songs` 有应答 = 服务已在跑，别再起第二个（EADDRINUSE 会把窗口闪掉）；
 *   2. 没起就**后台**起 `server/main.mjs`（detached，关掉调试会话也不跟着死），轮询等就绪；
 *   3. 就绪后才开浏览器（Edge 优先，走 server/open-browser.mjs 那套，不另写一份）。
 *
 * 用法：
 *   node scripts/open-studio.mjs            探活 → 按需起服务 → 开浏览器
 *   node scripts/open-studio.mjs --no-open  只保证服务在跑，不开浏览器（自测 / CI 用）
 *   MV_PORT=8799 node scripts/open-studio.mjs   换端口（config.mjs 读同一个变量）
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../server/config.mjs';
import { probe } from '../server/http/probe.mjs';
import { openBrowser } from '../server/open-browser.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = `http://${config.host}:${config.port}/`;
const OPEN_PAGE = `${BASE}skills`; // 老板常看技能页；首页从左上角导航一步可达

/* node:sqlite 要 Node ≥22.5，本机固定用 nvm 的 v24；找不到才退回当前解释器 */
const NODE_BIN = ['D:/software/nvm/v24.22.1/node.exe', process.execPath].find((p) => p && existsSync(p));

const alive = () => probe(`${BASE}api/songs`, 900);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitReady(totalMs = 20000) {
  const deadline = Date.now() + totalMs;
  while (Date.now() < deadline) {
    if (await alive()) return true;
    await sleep(400);
  }
  return false;
}

function startServer() {
  const child = spawn(NODE_BIN, [path.join(ROOT, 'server', 'main.mjs')], {
    cwd: ROOT,
    detached: true,          // 独立进程：调试会话结束、这个脚本退出，服务都照跑
    stdio: 'ignore',
    windowsHide: true,
    env: { ...process.env, MV_OPEN_BROWSER: '0' }, // 浏览器由本脚本开，服务自己别抢
  });
  child.unref();
  return child.pid;
}

async function main() {
  const noOpen = process.argv.includes('--no-open');
  console.log(`→ 工作台 ${BASE}`);

  if (await alive()) {
    console.log('  服务已经在跑了，不再起第二个。');
  } else {
    const pid = startServer();
    console.log(`  服务没起，已后台拉起（pid ${pid}），等它就绪…`);
    if (!(await waitReady())) {
      console.error(`  等了 20s 还没就绪：${BASE}。看日志或双击 启动工作室.cmd 排查。`);
      process.exit(1);
    }
    console.log('  服务就绪。');
  }

  if (noOpen) {
    console.log('  --no-open：跳过开浏览器。');
    return;
  }

  process.env.MV_OPEN_BROWSER = '1'; // open-browser.mjs 的开关，不设它只会静默返回
  console.log(openBrowser(OPEN_PAGE) ? `  已在浏览器打开 ${OPEN_PAGE}` : `  打开浏览器失败，手动访问 ${OPEN_PAGE}`);
}

main().catch((error) => {
  console.error(`打开工作台失败：${error.message}`);
  process.exit(1);
});
