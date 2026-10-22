/** skills / skill_runs：技能表与调用流水。 */
import { all, one } from '../db.mjs';

export const listSkills = () =>
  all(`SELECT k.*, (SELECT count(*) FROM skill_runs r WHERE r.skill_id = k.id) runs
         FROM skills k ORDER BY runs DESC, k.name`);

export const matrixCells = () =>
  all('SELECT skill_id, song_id, count(*) n FROM skill_runs GROUP BY skill_id, song_id');

export const allRuns = () =>
  all(`SELECT r.id, r.gate, r.started_at, r.ended_at, r.ok, r.note,
              k.id skill_id, k.name skill, s.slug, s.title, r.artifact_id
         FROM skill_runs r
         JOIN skills k ON k.id = r.skill_id
         LEFT JOIN songs s ON s.id = r.song_id
        ORDER BY coalesce(r.started_at, '') DESC, r.id DESC`);

export const runsOfSong = (songId) =>
  all(`SELECT r.id, r.gate, r.started_at, r.ended_at, r.ok, r.note, r.artifact_id, k.name skill
         FROM skill_runs r JOIN skills k ON k.id = r.skill_id
        WHERE r.song_id = ? ORDER BY coalesce(r.started_at, ''), r.id`, songId);

/** 只算真被调用过的技能：没跑过的技能缺 layer 不算问题 */
export const unsyncedCount = () =>
  one(`SELECT count(*) n FROM skills k
        WHERE k.doc_path IS NULL
          AND EXISTS (SELECT 1 FROM skill_runs r WHERE r.skill_id = k.id)`).n;
