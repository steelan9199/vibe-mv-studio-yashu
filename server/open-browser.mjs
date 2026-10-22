/**
 * open-browser.mjs — 服务真正 listen 成功之后才开浏览器。
 *
 * 规矩：
 *   - Windows 固定用 Edge（老板指定），装了但没在 PATH 也能找到；
 *   - 找不到 Edge 就退回系统默认浏览器，绝不静默失败；
 *   - 只在 MV_OPEN_BROWSER=1 时执行，跑测试 / npm start 不会乱弹窗。
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const EDGE_CANDIDATES = [
  path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Microsoft\\Edge\\Application\\msedge.exe'),
  path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Microsoft\\Edge\\Application\\msedge.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'Microsoft\\Edge\\Application\\msedge.exe'),
];

const findEdge = () => EDGE_CANDIDATES.find((p) => p && existsSync(p));

const launch = (command, args) =>
  spawn(command, args, { detached: true, stdio: 'ignore', windowsHide: true }).unref();

/** 用 Edge 打开；没有 Edge 就交给系统默认浏览器 */
export function openBrowser(url) {
  if (process.env.MV_OPEN_BROWSER !== '1') return false;

  const edge = findEdge();
  try {
    if (edge) launch(edge, [url]);
    else if (process.platform === 'win32') launch('cmd', ['/c', 'start', '', url]);
    else if (process.platform === 'darwin') launch('open', [url]);
    else launch('xdg-open', [url]);
    return true;
  } catch (error) {
    console.warn(`[studio] 打开浏览器失败：${error.message}，请手动访问 ${url}`);
    return false;
  }
}
