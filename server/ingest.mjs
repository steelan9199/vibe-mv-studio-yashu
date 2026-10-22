/**
 * ingest.mjs — 写库方向的扫盘（唯一允许 readdir 的模块）
 *
 * 页面渲染永远不许扫盘；只有「刷新索引」和未来的入库走这里。
 *   reindex(db)  重扫技能目录、补 artifacts.bytes、补 images 尺寸
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { isRosterSkill } from './config.mjs';

const DIM_KINDS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function parseFrontmatter(txt) {
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    fm[k] = v;
  }
  return fm;
}

function oneLineRole(desc = '') {
  if (!desc) return null;
  let s = desc.split('触发词')[0].replace(/^【[^】]*】/, '').trim();
  s = s.split('。')[0].trim();
  if (s.length > 60) s = s.slice(0, 58) + '…';
  return s || null;
}

/* ---------- 图片尺寸（不引第三方库） ---------- */
function imgSize(buf, ext) {
  try {
    if (ext === '.png') {
      if (buf.length < 24) return null;
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    }
    if (ext === '.jpg' || ext === '.jpeg') {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const mk = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (mk >= 0xc0 && mk <= 0xcf && mk !== 0xc4 && mk !== 0xc8 && mk !== 0xcc) {
          return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
        }
        i += 2 + len;
      }
      return null;
    }
    if (ext === '.webp') {
      const fmt = buf.toString('ascii', 12, 16);
      if (fmt === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
      if (fmt === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
      if (fmt === 'VP8L') {
        const b = buf.readUInt32LE(21);
        return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
      }
      return null;
    }
  } catch { /* 坏文件不阻断 */ }
  return null;
}

export function reindex(db, { libRoot, skillsDir }) {
  const out = { skills: 0, skillsNew: 0, artifacts: 0, images: 0, dims: 0, missing: [] };

  /* 1. 技能表：扫每个子目录的 SKILL.md frontmatter */
  if (skillsDir && existsSync(skillsDir)) {
    const upsert = db.prepare(`
      INSERT INTO skills (name, layer, role, version, doc_path, synced_at)
      VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))
      ON CONFLICT(name) DO UPDATE SET
        layer    = coalesce(excluded.layer, skills.layer),
        role     = coalesce(excluded.role, skills.role),
        version  = coalesce(excluded.version, skills.version),
        doc_path = excluded.doc_path,
        synced_at= excluded.synced_at`);
    for (const dir of readdirSync(skillsDir)) {
      const file = path.join(skillsDir, dir, 'SKILL.md');
      if (!existsSync(file)) continue;
      const fm = parseFrontmatter(readFileSync(file, 'utf8'));
      const name = fm.name || dir;
      /* 只入库「经理 + 花名册」，白名单在 config.mjs；不在册的技能与本工作台无关 */
      if (!isRosterSkill(name)) continue;
      const before = db.prepare('SELECT count(*) n FROM skills WHERE name=?').get(name).n;
      upsert.run(name, fm.layer ?? null, oneLineRole(fm.description), fm.version ?? null, file);
      out.skills++;
      if (!before) out.skillsNew++;
    }
  }

  /* 2. artifacts：补字节数 */
  const songs = db.prepare('SELECT id, slug FROM songs').all();
  const setBytes = db.prepare('UPDATE artifacts SET bytes=? WHERE id=?');
  for (const s of songs) {
    for (const a of db.prepare('SELECT id, path, bytes FROM artifacts WHERE song_id=?').all(s.id)) {
      const full = path.join(libRoot, s.slug, a.path);
      if (!existsSync(full)) { out.missing.push(`${s.slug}/${a.path}`); continue; }
      const n = statSync(full).size;
      if (a.bytes !== n) { setBytes.run(n, a.id); out.artifacts++; }
    }
  }

  /* 3. images：补 bytes / w / h（只补空的，不改已填的） */
  const updImg = db.prepare('UPDATE images SET bytes=?, w=?, h=? WHERE id=?');
  for (const s of songs) {
    const imgs = db.prepare(`
      SELECT i.id, i.path, i.bytes, i.w, i.h FROM images i
      JOIN assets a ON a.id = i.asset_id WHERE a.song_id=?`).all(s.id);
    for (const im of imgs) {
      const full = path.join(libRoot, s.slug, im.path);
      if (!existsSync(full)) { out.missing.push(`${s.slug}/${im.path}`); continue; }
      const buf = readFileSync(full);
      const ext = path.extname(full).toLowerCase();
      let w = im.w, h = im.h;
      if ((!w || !h) && DIM_KINDS.has(ext)) {
        const d = imgSize(buf, ext);
        if (d) { w = d.w; h = d.h; out.dims++; }
      }
      if (im.bytes !== buf.length || w !== im.w || h !== im.h) {
        updImg.run(buf.length, w ?? null, h ?? null, im.id);
        out.images++;
      }
    }
  }

  return out;
}
