#!/usr/bin/env node
/**
 * status.mjs — 自检与待办推导（工作室的"我该干什么"）
 *
 *   node scripts/status.mjs            人读报告
 *   node scripts/status.mjs --json     机器读（给页面 / 给经理）
 *
 * 这个脚本存在的唯一目的：让工作室不必问任何人"我现在该干什么"。
 * 所有结论都从 mv.db + 文件库推出来，不猜、不编。
 */

import { DatabaseSync } from 'node:sqlite';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.MV_DB || 'D:/vibe-mv/mv.db';
const FILE_ROOT = process.env.MV_FILES || 'D:/vibe-mv-文件库';
const GATES = ['G0', 'G1', 'G2', 'G3', 'G3.5', 'G4', 'G5'];
const GATE_NAME = {
  G0: '收料', G1: '测量', G2: '打轴', G3: '内容', 'G3.5': '资产', G4: '装配', G5: '出片',
};

const out = { db: DB_PATH, fileRoot: FILE_ROOT, at: new Date().toLocaleString('sv-SE'), songs: [], backlog: [], warnings: [], roadmap: [] };
const warn = (m) => out.warnings.push(m);

if (!existsSync(DB_PATH)) {
  out.warnings.push(`库不存在：${DB_PATH} —— 先跑 db.mjs init`);
  print();
  process.exit(0);
}

const db = new DatabaseSync(DB_PATH, { readOnly: true });

const rows = (sql, ...p) => db.prepare(sql).all(...p);
const one = (sql, ...p) => db.prepare(sql).get(...p);

const schemaVer = one('PRAGMA user_version').user_version;
out.schema = schemaVer;
out.tables = one("select count(*) n from sqlite_master where type='table' and name not like 'sqlite_%'").n;

/* ---------- 每首歌 ---------- */
const songs = rows('select * from songs order by id');

for (const s of songs) {
  const stages = rows('select gate,status,note from stages where song_id=? ', s.id);
  const st = Object.fromEntries(stages.map((x) => [x.gate, x]));
  const done = GATES.filter((g) => st[g]?.status === 'done');
  const nextGate = GATES.find((g) => st[g]?.status !== 'done') ?? null;

  const docs = Object.fromEntries(rows('select kind, version, length(doc) n from docs where song_id=?', s.id).map((d) => [d.kind, d]));
  const nAsset = one('select count(*) n from assets where song_id=?', s.id).n;
  const nImg = one('select count(*) n from images i join assets a on a.id=i.asset_id where a.song_id=?', s.id).n;
  const nPicked = one('select count(*) n from images i join assets a on a.id=i.asset_id where a.song_id=? and i.picked=1', s.id).n;
  const nSvg = one('select count(*) n from svgs v join assets a on a.id=v.asset_id where a.song_id=?', s.id).n;
  const nArt = one('select count(*) n from artifacts where song_id=?', s.id).n;
  const nRun = one('select count(*) n from skill_runs where song_id=?', s.id).n;

  /* 文件丢失体检（不阻断，只报） */
  const missing = [];
  for (const a of rows('select path from artifacts where song_id=?', s.id)) {
    if (!existsSync(path.join(FILE_ROOT, s.slug, a.path))) missing.push(a.path);
  }
  for (const im of rows('select i.path from images i join assets a on a.id=i.asset_id where a.song_id=?', s.id)) {
    if (!existsSync(path.join(FILE_ROOT, s.slug, im.path))) missing.push(im.path);
  }
  if (missing.length) warn(`${s.slug}：${missing.length} 个登记文件在磁盘上找不到（如 ${missing[0]}）`);

  /* 文件库里有图但库里没记录（只扫 images 一层，不递归全库） */
  const orphan = [];
  const imgRoot = path.join(FILE_ROOT, s.slug, 'images');
  if (existsSync(imgRoot)) {
    for (const k of readdirSync(imgRoot)) {
      const dir = path.join(imgRoot, k);
      let files = [];
      try { files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)); } catch { continue; }
      const known = new Set(rows('select i.path from images i join assets a on a.id=i.asset_id where a.song_id=?', s.id).map((r) => path.basename(r.path)));
      for (const f of files) if (!known.has(f)) orphan.push(`${k}/${f}`);
    }
  }
  if (orphan.length) warn(`${s.slug}：${orphan.length} 张图在文件库但库里没登记（如 ${orphan[0]}）—— 该跑一次入库`);

  const songOut = {
    slug: s.slug, title: s.title, dur: s.dur, bpm: s.bpm, key: s.music_key,
    done: done.length, total: GATES.length, nextGate,
    stages: GATES.map((g) => ({ gate: g, status: st[g]?.status ?? 'todo', note: st[g]?.note ?? '' })),
    docs: Object.keys(docs), assets: nAsset, images: nImg, picked: nPicked, svgs: nSvg, artifacts: nArt, runs: nRun,
    missingFiles: missing.length, orphanImages: orphan.length,
  };
  out.songs.push(songOut);

  /* ---------- 待办推导：状态 → 我该做什么 ---------- */
  const push = (pri, action, why) => out.backlog.push({ songs: [s.slug], pri, action, why });

  if (!docs.lyrics) push(1, 'G2 逐字轴还没入库', 'docs 缺 kind=lyrics，网页单歌页会空');
  if (!docs.music && st.G1?.status === 'done') push(2, 'G1 音乐档案没入库', 'G1 标了 done 但 docs 缺 kind=music');

  if (st['G3.5']?.status !== 'done' && nAsset === 0) {
    push(3, 'G3.5 资产清单还没入库（0 件资产）', 'assets 表空，图墙/资产库页无从显示');
  }
  if (nAsset > 0 && nImg === 0) {
    push(2, `G3.5 有 ${nAsset} 件资产但一张图都没入库`, 'assets 有行、images 为 0，说明图还散在旧目录');
  }
  if (nAsset > 0 && nImg > 0 && nPicked === 0 && nSvg === 0) {
    push(4, '资产还在待选阶段（无定稿图、无 SVG）', '等老板选图 + 资产层画 SVG');
  }
  if (orphan.length) push(2, `入库 ${orphan.length} 张孤儿图`, '文件库里已有、库里没有，属于漏记');
  if (missing.length) push(5, `补 ${missing.length} 个丢失文件或修正路径`, '老板说过丢了可以重生成，所以优先级低');

  if (st.G5?.status !== 'done' && docs.story) push(4, 'G4 装配待办：story 已有，待 build.mjs 渲片', '');
}

/* ---------- 全局待办（跟具体歌无关） ---------- */
const distIndex = path.join(import.meta.dirname, '..', 'web', 'dist', 'index.html');
if (!existsSync(distIndex)) {
  out.backlog.push({
    songs: [], pri: 3,
    action: '前端还没构建（web/dist/index.html 不存在）',
    why: '双击启动工作室只能看到提示，先跑 npm run build',
  });
}
const skillGap = one(`select count(*) n from skills k
  where k.doc_path is null
    and exists(select 1 from skill_runs r where r.skill_id = k.id)`).n;
if (skillGap) warn(`${skillGap} 条技能缺 layer/role/doc_path —— 在网页点「刷新索引」，或跑一次 POST /api/reindex 补`);

/* ---------- 未建模块（roadmap，不是待办噪音） ---------- */
for (const [f, when] of [
  ['scripts/selftest.mjs', 'W4'],
  ['cli.mjs export-story', 'W6'],
]) if (!existsSync(path.join(import.meta.dirname, '..', f.split(' ')[0]))) out.roadmap.push(`${f} —— ${when}`);

out.backlog.sort((a, b) => a.pri - b.pri);

db.close();
print();

/* ---------- 输出 ---------- */
function print() {
  const j = process.argv.includes('--json');
  if (j) { console.log(JSON.stringify(out, null, 2)); return; }

  const L = [];
  L.push(`库：${out.db}  schema v${out.schema ?? '?'}  ${out.tables ?? '?'} 表`);
  L.push('');

  if (!out.songs.length) {
    L.push('歌：0 首。等老板给音频与歌词，然后 new-song。');
  }
  for (const s of out.songs) {
    L.push(`【${s.title}】${s.slug}  ${s.dur ?? '?'}s ${s.bpm ?? '?'}BPM  ${s.key ?? ''}`);
    L.push('  关卡 ' + s.stages.map((x) => `${x.gate}${x.status === 'done' ? '✅' : x.status === 'partial' ? '🟡' : x.status === 'draft' ? '🔵' : '⬜'}`).join(' '));
    L.push(`  当前关：${s.nextGate ? `${s.nextGate} ${GATE_NAME[s.nextGate]}` : '全部过闸'}   入库：文档${s.docs.length} 资产${s.assets} 图${s.images}(定稿${s.picked}) SVG${s.svgs} 二进制${s.artifacts} 调用${s.runs}`);
    L.push('');
  }

  if (out.backlog.length) {
    L.push('该我做的（按优先级，不用等人说）：');
    out.backlog.forEach((b, i) => L.push(`  ${i + 1}. [P${b.pri}] ${b.action}${b.why ? `  —— ${b.why}` : ''}`));
    L.push('');
  }

  if (out.warnings.length) {
    L.push('体检警告：');
    out.warnings.forEach((w) => L.push(`  ! ${w}`));
    L.push('');
  }

  if (out.roadmap.length) {
    L.push('未建模块（别假装它们存在）：');
    out.roadmap.forEach((r) => L.push(`  - ${r}`));
    L.push('');
  }
  console.log(L.join('\n'));
}
