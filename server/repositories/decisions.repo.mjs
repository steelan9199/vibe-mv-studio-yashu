/** decisions：老板的决定（只增不改）。 */
import { all } from '../db.mjs';

export const ofSong = (songId) =>
  all('SELECT * FROM decisions WHERE song_id = ? ORDER BY at DESC', songId);
