/** media：只把 id 换成库里的相对路径，绝不接受前端传路径。 */
import { one } from '../db.mjs';

const QUERIES = {
  image: `SELECT i.path AS rel, s.slug FROM images i
            JOIN assets a ON a.id = i.asset_id JOIN songs s ON s.id = a.song_id WHERE i.id = ?`,
  artifact: `SELECT a.path AS rel, s.slug FROM artifacts a JOIN songs s ON s.id = a.song_id WHERE a.id = ?`,
  svg: `SELECT v.path AS rel, s.slug FROM svgs v
          JOIN assets a ON a.id = v.asset_id JOIN songs s ON s.id = a.song_id WHERE v.id = ?`,
};

/** /media/<kind>/<id> 的 kind → 查哪张表 */
const KIND_TABLE = { image: 'image', audio: 'artifact', video: 'artifact', svg: 'svg' };

export const tableFor = (kind) => KIND_TABLE[kind] ?? null;

export const locate = (kind, id) => {
  const table = tableFor(kind);
  if (!table) return null;
  return one(QUERIES[table], id) ?? null;
};
