/** skills.service.mjs — 技能 × 歌 的调用矩阵 + 明细流水。 */
import { allRuns, listSkills, matrixCells, unsyncedCount } from '../repositories/skills.repo.mjs';
import { listSongRefs } from '../repositories/songs.repo.mjs';

export function buildSkills() {
  const songs = listSongRefs();
  const cells = matrixCells();

  const skills = listSkills().map((skill) => ({
    id: skill.id,
    name: skill.name,
    layer: skill.layer,
    role: skill.role,
    version: skill.version,
    runs: skill.runs,
    cells: songs.map((song) => cells.find((cell) => cell.skill_id === skill.id && cell.song_id === song.id)?.n ?? 0),
  }));

  const runs = allRuns();
  return {
    songs,
    /* 矩阵只放真被调用过的技能，零调用的进卡片区，免得一屏全是 0 */
    matrix: skills.filter((skill) => skill.runs > 0),
    skills,
    runs,
    totalRuns: runs.length,
    unsynced: unsyncedCount(),
  };
}

export const buildRuns = (slug) => {
  const { runs } = buildSkills();
  return { runs: slug ? runs.filter((run) => run.slug === slug) : runs };
};
