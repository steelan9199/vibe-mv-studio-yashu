/** docs / artifacts：文本产物与二进制文件登记的读取。 */
import { all } from '../db.mjs';

export const docsOf = (songId) =>
  all('SELECT id, kind, path, version, doc, updated_at FROM docs WHERE song_id = ? ORDER BY kind, version DESC', songId);

export const artifactsOf = (songId) =>
  all('SELECT id, gate, kind, path, bytes, note, mtime FROM artifacts WHERE song_id = ? ORDER BY gate, id', songId);
