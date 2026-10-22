/** skills.service.mjs — 技能 × 歌 的调用矩阵 + 明细流水。
 *
 * 只放「经理 + 团队花名册」（config.rosterSkills 为准）：技能页是给老板看
 * 这条 MV 流水线有谁在干活，不是本机技能总目录。库里的无关技能读的时候过滤掉，
 * 不删库、不靠 reindex 兜底，白名单一改就生效。
 */
import { allRuns, listSkills, matrixCells, unsyncedCount } from '../repositories/skills.repo.mjs';
import { listSongRefs } from '../repositories/songs.repo.mjs';
import { rosterSkills } from '../config.mjs';

export function buildSkills() {
  const songs = listSongRefs();
  const cells = matrixCells();

  const order = new Map(rosterSkills.map((name, i) => [name, i]));
  const mine = listSkills()
    .filter((skill) => order.has(skill.name))
    .sort((a, b) => order.get(a.name) - order.get(b.name)); // 经理在前，其余按花名册顺序

  const skills = mine.map((skill) => ({
    id: skill.id,
    name: skill.name,
    layer: skill.layer,
    role: skill.role,
    version: skill.version,
    runs: skill.runs,
    cells: songs.map((song) => cells.find((cell) => cell.skill_id === skill.id && cell.song_id === song.id)?.n ?? 0),
  }));

  const runs = allRuns().filter((run) => order.has(run.skill));
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
