#!/usr/bin/env node
/**
 * cli.mjs — 唯一写入口
 *
 *   node scripts/cli.mjs new-song --slug jiaowo-laowangba --title 叫我老王八
 *   node scripts/cli.mjs save --file payload.json
 *   node scripts/cli.mjs show --slug jiaowo-laowangba
 *   node scripts/cli.mjs query --sql "select * from songs"
 *
 * 规则见 references/20-写入手册.md：一步 = 一个事务，全进或全不进。
 * 路径一律相对 D:\vibe-mv-文件库\<slug>\
 */

import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const DB_PATH = process.env.MV_DB || 'D:/vibe-mv/mv.db';
const FILE_ROOT = process.env.MV_FILES || 'D:/vibe-mv-文件库';

const GATES = ['G0', 'G1', 'G2', 'G3', 'G3.5', 'G4', 'G5'];
const CATS = ['角色', '道具', '特效', '背景'];
const IMG_KINDS = ['ref', 'picked', 'final', 'reject'];
const STATUS = ['todo', 'partial', 'draft', 'done'];

const sha = (algo, buf) => createHash(algo).update(buf).digest('hex');
const die = (code, msg) => { console.error('[cli] ' + msg); process.exit(code); };
const now = () => new Date().toLocaleString('sv-SE').replace('T', ' ');

function open() {
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON');
  return db;
}

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) o[a.slice(2)] = true;
    else { o[a.slice(2)] = v; i++; }
  }
  return o;
}

function getSong(db, slug) {
  const s = db.prepare('SELECT * FROM songs WHERE slug = ?').get(slug);
  if (!s) die(3, `歌不存在：${slug}。先跑 new-song。`);
  return s;
}

function absOf(slug, rel) {
  if (!rel) die(2, 'path 为空');
  if (path.isAbsolute(rel)) die(2, `path 必须是相对路径：${rel}`);
  return path.join(FILE_ROOT, slug, rel);
}

/* ---------------- new-song ---------------- */

function newSong(argv) {
  const o = parseArgs(argv);
  if (!o.slug || !o.title) die(2, 'new-song 需要 --slug 与 --title');
  const db = open();
  const has = db.prepare('SELECT id FROM songs WHERE slug = ?').get(o.slug);
  if (has) { console.log(`[cli] 已存在，不重复建：${o.slug}`); db.close(); return; }
  db.exec('BEGIN');
  let songId;
  try {
    const info = db.prepare(
      'INSERT INTO songs (slug, title, dur, bpm, music_key, engine, canvas, note) VALUES (?,?,?,?,?,?,?,?)'
    ).run(o.slug, o.title, o.dur ? Number(o.dur) : null, o.bpm ? Number(o.bpm) : null,
      o.key || null, o.engine || null, o.canvas || null, o.note || null);
    songId = Number(info.lastInsertRowid);
    const st = db.prepare('INSERT INTO stages (song_id, gate, status) VALUES (?,?,?)');
    for (const g of GATES) st.run(songId, g, 'todo');
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    die(2, e.message);
  }
  console.log(`[cli] 建歌成功：${o.title} (${o.slug}) song_id=${songId}，已插 ${GATES.length} 关`);
  db.close();
}

/* ---------------- save（唯一写入口；与 git 无关） ---------------- */

function save(file) {
  if (!file || file === true) die(2, 'save 需要 --file payload.json');
  if (!existsSync(file)) die(2, `payload 文件不存在：${file}`);
  let p;
  try { p = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { die(2, `payload 不是合法 JSON：${e.message}`); }
  if (!p.slug) die(2, 'payload 缺 slug');
  if (!p.gate) die(2, 'payload 缺 gate');

  const db = open();
  const song = getSong(db, p.slug);
  const sid = song.id;
  const stat = { songs: 0, stages: 0, docs: 0, artifacts: 0, assets: 0, images: 0, skipped: 0, runs: 0, decisions: 0, costs: 0 };

  db.exec('BEGIN');
  try {
    /* 1. song */
    if (p.song) {
      const s = p.song;
      db.prepare(`UPDATE songs SET
        title = coalesce(?, title), dur = coalesce(?, dur), bpm = coalesce(?, bpm),
        music_key = coalesce(?, music_key), engine = coalesce(?, engine),
        canvas = coalesce(?, canvas), note = coalesce(?, note), updated_at = ?
        WHERE id = ?`).run(
        s.title ?? null, s.dur ?? null, s.bpm ?? null, s.music_key ?? s.key ?? null,
        s.engine ?? null, s.canvas ?? null, s.note ?? null, now(), sid);
      stat.songs++;
    }

    /* 2. stage */
    if (p.stage) {
      const { status, note } = p.stage;
      if (status && !STATUS.includes(status)) die(2, `status 非法：${status}`);
      const doneAt = status === 'done' ? now() : null;
      db.prepare(`UPDATE stages SET
        status = coalesce(?, status), note = coalesce(?, note),
        started_at = coalesce(started_at, ?),
        finished_at = coalesce(?, finished_at)
        WHERE song_id = ? AND gate = ?`).run(status ?? null, note ?? null, now(), doneAt, sid, p.gate);
      stat.stages++;
    }

    /* 3. docs（文本类产物：歌词轴 / 音乐档案 / 分镜稿 / 口述稿） */
    for (const d of p.docs ?? []) {
      if (!d.kind) die(2, 'docs[] 缺 kind');
      let buf = null, docText = d.doc ?? null, rel = null;
      if (d.path) {
        rel = d.path;
        const abs = absOf(p.slug, rel);
        if (!existsSync(abs)) die(2, `docs 文件不存在：${abs}`);
        buf = readFileSync(abs);
        if (docText === null) docText = buf.toString('utf8');
      }
      if (docText === null) die(2, `docs[${d.kind}] 既没有 path 也没有 doc`);
      const src = buf ?? Buffer.from(docText, 'utf8');
      const md5v = sha('md5', src);
      const maxV = db.prepare('SELECT max(version) AS v FROM docs WHERE song_id=? AND kind=?').get(sid, d.kind).v;
      let ver;
      if (d.version) ver = Number(d.version);
      else ver = maxV ?? 1;
      const exist = db.prepare('SELECT id FROM docs WHERE song_id=? AND kind=? AND version=?').get(sid, d.kind, ver);
      if (exist) {
        db.prepare('UPDATE docs SET path=?, doc=?, md5=?, meta_json=?, updated_at=? WHERE id=?')
          .run(rel, docText, md5v, JSON.stringify(d.meta ?? null), now(), exist.id);
      } else {
        db.prepare('INSERT INTO docs (song_id, kind, path, doc, md5, version, meta_json) VALUES (?,?,?,?,?,?,?)')
          .run(sid, d.kind, rel, docText, md5v, ver, JSON.stringify(d.meta ?? null));
      }
      stat.docs++;
    }

    /* 4. artifacts（只服务二进制：audio / video / image 原图） */
    for (const a of p.artifacts ?? []) {
      if (!a.kind || !a.path) die(2, 'artifacts[] 缺 kind 或 path');
      const abs = absOf(p.slug, a.path);
      if (!existsSync(abs)) die(2, `artifact 文件不存在：${abs}`);
      const buf = readFileSync(abs);
      db.prepare(`INSERT INTO artifacts (song_id, gate, kind, path, bytes, md5, mtime, note)
        VALUES (?,?,?,?,?,?,?,?)
        ON CONFLICT(song_id, path) DO UPDATE SET
          gate=excluded.gate, kind=excluded.kind, bytes=excluded.bytes,
          md5=excluded.md5, mtime=excluded.mtime, note=excluded.note`).run(
        sid, a.gate ?? p.gate, a.kind, a.path, buf.length, sha('md5', buf), now(), a.note ?? null);
      stat.artifacts++;
    }

    /* 5. assets */
    for (const a of p.assets ?? []) {
      if (!a.asset_key || !a.name || !a.cat) die(2, 'assets[] 缺 asset_key / name / cat');
      if (!CATS.includes(a.cat)) die(2, `cat 非法：${a.cat}（只认 ${CATS.join('/')}）`);
      if (a.status && !STATUS.includes(a.status)) die(2, `asset.status 非法：${a.status}`);
      db.prepare(`INSERT INTO assets (song_id, asset_key, name, cat, angle, channel, status, spec_json, note)
        VALUES (?,?,?,?,?,?,?,?,?)
        ON CONFLICT(song_id, asset_key) DO UPDATE SET
          name=excluded.name, cat=excluded.cat, angle=excluded.angle, channel=excluded.channel,
          status=excluded.status, spec_json=excluded.spec_json, note=excluded.note`).run(
        sid, a.asset_key, a.name, a.cat, a.angle ?? null, a.channel ?? null,
        a.status ?? 'todo', a.spec_json ? JSON.stringify(a.spec_json) : null, a.note ?? null);
      stat.assets++;
    }

    /* 6. images */
    for (const im of p.images ?? []) {
      if (!im.asset_key || !im.path) die(2, 'images[] 缺 asset_key 或 path');
      if (im.kind && !IMG_KINDS.includes(im.kind)) die(2, `image.kind 非法：${im.kind}`);
      const asset = db.prepare('SELECT id FROM assets WHERE song_id=? AND asset_key=?').get(sid, im.asset_key);
      if (!asset) die(2, `图引用了不存在的资产：${im.asset_key}`);
      const abs = absOf(p.slug, im.path);
      if (!existsSync(abs)) die(2, `图不存在：${abs}`);
      const buf = readFileSync(abs);
      const h = sha('sha256', buf);
      const info = db.prepare(`INSERT OR IGNORE INTO images
        (asset_id, path, kind, w, h, bytes, sha256, prompt, seed, workflow, cost, picked)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        asset.id, im.path, im.kind ?? 'ref', im.w ?? null, im.h ?? null, buf.length,
        h, im.prompt ?? null, im.seed ?? null, im.workflow ?? null,
        im.cost ?? 0, im.picked ? 1 : 0);
      if (Number(info.changes) === 0) stat.skipped++; else stat.images++;
    }

    /* 7. skillRuns */
    for (const r of p.skillRuns ?? []) {
      if (!r.skill) die(2, 'skillRuns[] 缺 skill');
      let sk = db.prepare('SELECT id FROM skills WHERE name=?').get(r.skill);
      if (!sk) {
        const info = db.prepare('INSERT INTO skills (name, synced_at) VALUES (?,?)').run(r.skill, now());
        sk = { id: Number(info.lastInsertRowid) };
      }
      const atKey = r.started_at || r.note || 'default';
      const runKey = sha('sha1', `${p.slug}|${r.skill}|${r.gate ?? p.gate}|${atKey}`);
      let artId = null;
      if (r.artifactPath) {
        const a = db.prepare('SELECT id FROM artifacts WHERE song_id=? AND path=?').get(sid, r.artifactPath);
        if (a) artId = a.id;
      }
      const info = db.prepare(`INSERT OR IGNORE INTO skill_runs
        (song_id, skill_id, gate, run_key, started_at, ended_at, ok, note, artifact_id)
        VALUES (?,?,?,?,?,?,?,?,?)`).run(
        sid, sk.id, r.gate ?? p.gate, runKey, r.started_at ?? null, r.ended_at ?? null,
        r.ok === false ? 0 : 1, r.note ?? null, artId);
      if (Number(info.changes) > 0) stat.runs++; else stat.skipped++;
    }

    /* 8. decisions */
    for (const d of p.decisions ?? []) {
      if (!d.scope || !d.target || !d.verdict) die(2, 'decisions[] 缺 scope / target / verdict');
      // 同一条决定重复提交不重复记（老板重说一遍不产生新信息）；判决变了才追加
      const dup = db.prepare(
        'SELECT id FROM decisions WHERE song_id=? AND scope=? AND target=? AND verdict=? AND ifnull(note,\'\')=ifnull(?,\'\')'
      ).get(sid, d.scope, d.target, d.verdict, d.note ?? null);
      if (dup) { stat.skipped++; continue; }
      db.prepare('INSERT INTO decisions (song_id, scope, target, verdict, note, at) VALUES (?,?,?,?,?,?)')
        .run(sid, d.scope, d.target, d.verdict, d.note ?? null, d.at ?? now());
      stat.decisions++;
    }

    /* 9. costs */
    for (const c of p.costs ?? []) {
      if (!c.kind || c.amount === undefined) die(2, 'costs[] 缺 kind 或 amount');
      db.prepare('INSERT INTO costs (song_id, kind, qty, amount, currency, ref, at) VALUES (?,?,?,?,?,?,?)')
        .run(sid, c.kind, c.qty ?? 1, c.amount, c.currency ?? 'CNY', c.ref ?? null, c.at ?? now());
      stat.costs++;
    }

    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    die(2, '事务回滚：' + e.message);
  }

  const line = Object.entries(stat).map(([k, v]) => `${k}=${v}`).join(' ');
  console.log(`[cli] save OK  ${p.slug} @ ${p.gate}  ${line}`);
  db.close();
}

/* ---------------- show ---------------- */

function show(argv) {
  const o = parseArgs(argv);
  if (!o.slug) die(2, 'show 需要 --slug');
  const db = open();
  const s = getSong(db, o.slug);
  console.log(`歌：${s.title} (${s.slug})  engine=${s.engine ?? '-'}  dur=${s.dur ?? '-'}s  bpm=${s.bpm ?? '-'}`);
  console.log('\n关卡：');
  for (const st of db.prepare('SELECT * FROM stages WHERE song_id=? ORDER BY rowid').all(s.id)) {
    console.log(`  ${st.gate.padEnd(5)} ${st.status.padEnd(8)} ${st.note ?? ''}`);
  }
  const docs = db.prepare('SELECT kind, version, length(doc) AS n, path FROM docs WHERE song_id=? ORDER BY kind').all(s.id);
  console.log(`\n文本产物(${docs.length})：`);
  for (const d of docs) console.log(`  ${d.kind.padEnd(10)} v${d.version}  ${d.n} 字符  ${d.path ?? '(仅入库)'}`);
  const arts = db.prepare('SELECT kind, path, bytes FROM artifacts WHERE song_id=? ORDER BY kind').all(s.id);
  console.log(`\n二进制产物(${arts.length})：`);
  for (const a of arts) console.log(`  ${a.kind.padEnd(10)} ${(a.bytes / 1024).toFixed(0)}KB  ${a.path}`);
  const nAsset = db.prepare('SELECT count(*) n FROM assets WHERE song_id=?').get(s.id).n;
  const nImg = db.prepare('SELECT count(*) n FROM images i JOIN assets a ON a.id=i.asset_id WHERE a.song_id=?').get(s.id).n;
  const nRun = db.prepare('SELECT count(*) n FROM skill_runs WHERE song_id=?').get(s.id).n;
  console.log(`\n资产=${nAsset}  图=${nImg}  技能调用=${nRun}`);
  db.close();
}

/* ---------------- query ---------------- */

function query(argv) {
  const o = parseArgs(argv);
  if (!o.sql || o.sql === true) die(2, 'query 需要 --sql');
  const sql = String(o.sql).trim();
  if (!/^select\b/i.test(sql)) die(2, '只允许 SELECT');
  const db = open();
  const rows = db.prepare(sql).all();
  console.log(JSON.stringify(rows, null, 2));
  db.close();
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'new-song') newSong(rest);
else if (cmd === 'save') save(parseArgs(rest).file);
else if (cmd === 'show') show(rest);
else if (cmd === 'query') query(rest);
else {
  console.log('用法:');
  console.log('  cli.mjs new-song --slug <slug> --title <中文名>');
  console.log('  cli.mjs save --file payload.json      # 唯一写入口，与 git 无关');
  console.log('  cli.mjs show --slug <slug>');
  console.log('  cli.mjs query --sql "select ..."');
  process.exit(1);
}
