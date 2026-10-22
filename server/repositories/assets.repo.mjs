/** assets(+images/svgs 统计)：资产是业务对象，图与 SVG 是它的附件。 */
import { all, one } from '../db.mjs';

/** 主图优先级：final → picked → 第一张 ref */
const MAIN_IMAGE_SQL = `
  SELECT id FROM images WHERE asset_id = ?
  ORDER BY (kind = 'final') DESC, picked DESC, id LIMIT 1`;

export const mainImageId = (assetId) => one(MAIN_IMAGE_SQL, assetId)?.id ?? null;

export const pipelineOf = (songId) =>
  all('SELECT * FROM v_asset_pipeline WHERE song_id = ? ORDER BY cat, asset_key', songId);

export const svgIdsOf = (assetId) =>
  all('SELECT id FROM svgs WHERE asset_id = ? ORDER BY version DESC', assetId).map((r) => r.id);

export function findFiltered({ song, cat, channel, status } = {}) {
  const where = [];
  const params = [];
  if (song) { where.push('s.slug = ?'); params.push(song); }
  if (cat) { where.push('a.cat = ?'); params.push(cat); }
  if (channel) { where.push('a.channel = ?'); params.push(channel); }
  if (status) { where.push('a.status = ?'); params.push(status); }

  return all(
    `SELECT a.*, s.slug, s.title,
            coalesce(vp.img_total, 0)  img_total,
            coalesce(vp.img_picked, 0) img_picked,
            coalesce(vp.img_final, 0)  img_final,
            coalesce(vp.svg_ok, 0)     svg_ok,
            (SELECT coalesce(sum(i.cost), 0) FROM images i WHERE i.asset_id = a.id) cost
       FROM assets a
       JOIN songs s ON s.id = a.song_id
       LEFT JOIN v_asset_pipeline vp ON vp.asset_id = a.id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY s.title, a.cat, a.asset_key`,
    ...params,
  );
}

export const findById = (id) =>
  one('SELECT a.*, s.slug, s.title FROM assets a JOIN songs s ON s.id = a.song_id WHERE a.id = ?', id);

export const ofSong = (songId) =>
  all('SELECT a.id, a.asset_key, a.name FROM assets a WHERE a.song_id = ? ORDER BY a.asset_key', songId);

export const filterOptions = () => ({
  songs: all('SELECT slug, title FROM songs ORDER BY title'),
  cats: all('SELECT DISTINCT cat FROM assets ORDER BY cat').map((r) => r.cat),
  channels: all('SELECT DISTINCT channel FROM assets WHERE channel IS NOT NULL ORDER BY channel').map((r) => r.channel),
  statuses: all('SELECT DISTINCT status FROM assets ORDER BY status').map((r) => r.status),
});
