/** dashboard.service.mjs — 首页：几首歌、各卡在哪、有几件事等老板。 */
import dayjs from 'dayjs';
import { countsOf, lastFinished, listSongs, pendingVerdicts, stagesOf, totals } from '../repositories/songs.repo.mjs';
import { sumCostsSince, sumImageCostSince } from '../repositories/costs.repo.mjs';
import { currentOf, toRail } from './stages.service.mjs';
import { deriveTodo } from './todo.service.mjs';

const songCard = (song) => {
  const rail = toRail(stagesOf(song.id));
  return {
    id: song.id,
    slug: song.slug,
    title: song.title,
    dur: song.dur,
    bpm: song.bpm,
    musicKey: song.music_key,
    canvas: song.canvas,
    note: song.note,
    updatedAt: song.updated_at,
    stages: rail,
    current: currentOf(rail),
    counts: countsOf(song.id),
    lastTouch: lastFinished(song.id) ?? null,
  };
};

export function buildDashboard() {
  const songs = listSongs().map(songCard);
  const month = dayjs().format('YYYY-MM');
  const base = totals();

  return {
    songs,
    totals: {
      ...base,
      costsMonth: sumCostsSince(month) + sumImageCostSince(month),
    },
    todo: deriveTodo(songs, pendingVerdicts()),
  };
}
