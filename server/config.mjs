/**
 * config.mjs — 运行期常量集中一处，别在代码里散落盘符。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  root: ROOT,
  webDir: path.join(ROOT, 'web'),
  distDir: path.join(ROOT, 'web', 'dist'),
  dbPath: process.env.MV_DB || 'D:/vibe-mv/mv.db',
  libRoot: path.resolve(process.env.MV_FILES || 'D:/vibe-mv-文件库'),
  skillsDir: process.env.MV_SKILLS || 'C:/Users/Administrator/.workbuddy/skills',
  host: process.env.MV_HOST || '127.0.0.1',
  port: Number(process.env.MV_PORT || 8791),
};

/**
 * 技能白名单 —— 「经理 + 团队花名册」，顺序即页面显示顺序。
 *
 * 只同步、只显示这两类技能：老板在本工作台干活，用得到的就这两拨。
 * 其余 30 多个技能（打轴以外的一次性工具、微信、AutoHotkey 之类）与本工作台无关，
 * 塞进技能页只会把真正在用的十几个冲淡。要加新人 = 先改经理 SKILL.md §1 花名册，
 * 再把名字加到这里，不许只改一处。
 */
export const rosterSkills = [
  'vibe-mv-manager-yashu',        // 经理（编排层）
  'song-analyzer-yashu',          // 测歌
  'lyric-tapper-yashu',           // 打轴（老板亲手）
  'mv-storyboard-yashu',          // 内容·创作
  'mv-shotlist-yashu',            // 内容·落位
  'svg-asset-drawing-yashu',      // 资产·手绘
  'comfyui-local-yashu',          // 资产·本地前处理
  'runninghub-cloud-yashu',       // 资产·云端生图
  'vibe-knowledge-mv-yashu',      // 引擎·剪纸海
  'vibe-mv-flatpaper',            // 引擎·扁平白底
  'vibe-mv-studio-yashu',         // 工具·数据工作台（本页）
];

export const isRosterSkill = (name) => rosterSkills.includes(name);
