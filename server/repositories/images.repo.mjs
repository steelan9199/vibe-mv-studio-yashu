/** images / svgs：附件本体（库内只有路径与元数据）。 */
import { all } from '../db.mjs';

export const ofSong = (songId) =>
  all(
    `SELECT i.*, a.asset_key, a.name AS asset_name
       FROM images i JOIN assets a ON a.id = i.asset_id
      WHERE a.song_id = ? ORDER BY a.asset_key, i.id`,
    songId,
  );

export const ofAsset = (assetId) =>
  all("SELECT * FROM images WHERE asset_id = ? ORDER BY (kind = 'final') DESC, picked DESC, id", assetId);

export const svgsOfSong = (songId) =>
  all(
    `SELECT v.id, v.asset_id, v.path, v.symbol, v.version, v.approved, v.bytes, a.asset_key
       FROM svgs v JOIN assets a ON a.id = v.asset_id
      WHERE a.song_id = ? ORDER BY a.asset_key, v.version DESC`,
    songId,
  );

export const svgsOfAsset = (assetId) =>
  all('SELECT * FROM svgs WHERE asset_id = ? ORDER BY version DESC', assetId);
