/** song.service.mjs — 单歌页的全部数据，一次给足，前端不再二次请求。 */
import { artifactsOf, docsOf } from '../repositories/docs.repo.mjs';
import { findSongBySlug, stagesOf } from '../repositories/songs.repo.mjs';
import { mainImageId, pipelineOf, svgIdsOf } from '../repositories/assets.repo.mjs';
import { ofSong as imagesOfSong, svgsOfSong } from '../repositories/images.repo.mjs';
import { runsOfSong } from '../repositories/skills.repo.mjs';
import { ofSong as decisionsOfSong } from '../repositories/decisions.repo.mjs';
import { ofSong as costsOfSong } from '../repositories/costs.repo.mjs';
import { currentOf, toRail } from './stages.service.mjs';

export function buildSongDetail(slug) {
  const song = findSongBySlug(slug);
  if (!song) return null;

  const rail = toRail(stagesOf(song.id));
  const assets = pipelineOf(song.id).map((asset) => ({
    ...asset,
    mainImageId: mainImageId(asset.asset_id),
    svgIds: svgIdsOf(asset.asset_id),
  }));

  return {
    song,
    stages: rail,
    current: currentOf(rail),
    docs: docsOf(song.id),
    artifacts: artifactsOf(song.id),
    assets,
    images: imagesOfSong(song.id),
    svgs: svgsOfSong(song.id),
    runs: runsOfSong(song.id),
    decisions: decisionsOfSong(song.id),
    costs: costsOfSong(song.id),
  };
}
