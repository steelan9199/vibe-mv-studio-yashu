/** songs / stages 两张表的数据访问。 */
import { all, one } from '../db.mjs';

export const listSongs = () => all('SELECT * FROM songs ORDER BY updated_at DESC, id');

export const findSongBySlug = (slug) => one('SELECT * FROM songs WHERE slug = ?', slug);

/** 只取引用字段，给矩阵/下拉用 */
export const listSongRefs = () => all('SELECT id, slug, title FROM songs ORDER BY id');

export const stagesOf = (songId) =>
  all('SELECT gate, status, note, started_at, finished_at FROM stages WHERE song_id = ?', songId);

export const countsOf = (songId) =>
  one(
    `SELECT
       (SELECT count(*) FROM docs      WHERE song_id = ?) docs,
       (SELECT group_concat(kind) FROM docs WHERE song_id = ?) doc_kinds,
       (SELECT count(*) FROM assets    WHERE song_id = ?) assets,
       (SELECT count(*) FROM images i JOIN assets a ON a.id = i.asset_id WHERE a.song_id = ?) images,
       (SELECT count(*) FROM images i JOIN assets a ON a.id = i.asset_id WHERE a.song_id = ? AND i.picked = 1) picked,
       (SELECT count(*) FROM svgs   v JOIN assets a ON a.id = v.asset_id WHERE a.song_id = ?) svgs,
       (SELECT count(*) FROM artifacts WHERE song_id = ?) artifacts,
       (SELECT count(*) FROM skill_runs WHERE song_id = ?) runs,
       (SELECT count(*) FROM decisions  WHERE song_id = ?) decisions`,
    songId, songId, songId, songId, songId, songId, songId, songId, songId,
  );

export const lastFinished = (songId) =>
  one('SELECT gate, finished_at FROM stages WHERE song_id = ? AND finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1', songId);

export const totals = () => ({
  songs: one('SELECT count(*) n FROM songs').n,
  videos: one("SELECT count(*) n FROM artifacts WHERE kind = 'video'").n,
  assets: one('SELECT count(*) n FROM assets').n,
  images: one('SELECT count(*) n FROM images').n,
});

/** 状态是 draft/partial 的关：有产出但等老板点头 */
export const pendingVerdicts = () =>
  all(`SELECT s.title, s.slug, st.gate FROM stages st
       JOIN songs s ON s.id = st.song_id
       WHERE st.status IN ('draft','partial')
       ORDER BY s.id, st.gate`);
