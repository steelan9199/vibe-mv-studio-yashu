/** costs + images.cost：一切花钱的记录。 */
import { all, one } from '../db.mjs';

export const sumCosts = () => one('SELECT coalesce(sum(amount), 0) s FROM costs').s;
export const sumCostsSince = (monthPrefix) =>
  one('SELECT coalesce(sum(amount), 0) s FROM costs WHERE at LIKE ?', monthPrefix + '%').s;

export const sumImageCost = () => one('SELECT coalesce(sum(cost), 0) s FROM images').s;
export const sumImageCostSince = (monthPrefix) =>
  one('SELECT coalesce(sum(cost), 0) s FROM images WHERE created_at LIKE ?', monthPrefix + '%').s;

export const countImages = () => one('SELECT count(*) n FROM images').n;

export const ofSong = (songId) =>
  all('SELECT * FROM costs WHERE song_id = ? ORDER BY at DESC', songId);

export const bySong = () =>
  all(`SELECT s.id, s.slug, s.title,
              (SELECT count(*) FROM images i JOIN assets a ON a.id = i.asset_id WHERE a.song_id = s.id) img,
              (SELECT coalesce(sum(i.cost), 0) FROM images i JOIN assets a ON a.id = i.asset_id WHERE a.song_id = s.id) img_cost,
              (SELECT coalesce(sum(c.amount), 0) FROM costs c WHERE c.song_id = s.id) other
         FROM songs s
        ORDER BY (img_cost + other) DESC`);

export const byAsset = (limit = 20) =>
  all(`SELECT a.id, a.asset_key, a.name, a.cat, s.title,
              (SELECT count(*) FROM images i WHERE i.asset_id = a.id) img,
              (SELECT coalesce(sum(i.cost), 0) FROM images i WHERE i.asset_id = a.id) cost
         FROM assets a JOIN songs s ON s.id = a.song_id
        ORDER BY cost DESC, img DESC LIMIT ?`, limit);

export const flow = (limit = 50) => {
  const rows = [
    ...all(`SELECT c.at at, c.kind kind, c.amount amount, c.currency cur, c.ref ref, s.title, 'cost' src
              FROM costs c LEFT JOIN songs s ON s.id = c.song_id`),
    ...all(`SELECT i.created_at at, 'image' kind, i.cost amount, 'CNY' cur, a.asset_key ref, s.title, 'image' src
              FROM images i JOIN assets a ON a.id = i.asset_id JOIN songs s ON s.id = a.song_id
             WHERE i.cost > 0`),
  ];
  return rows.sort((a, b) => String(b.at ?? '').localeCompare(String(a.at ?? ''))).slice(0, limit);
};
