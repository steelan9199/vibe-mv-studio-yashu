/** costs.service.mjs — 一条片子花了多少，钱花在哪。 */
import dayjs from 'dayjs';
import {
  byAsset, bySong, countImages, flow,
  sumCosts, sumCostsSince, sumImageCost, sumImageCostSince,
} from '../repositories/costs.repo.mjs';

export function buildCosts() {
  const month = dayjs().format('YYYY-MM');
  const imageCount = countImages();
  const imageTotal = sumImageCost();
  const otherTotal = sumCosts();

  return {
    totals: {
      all: imageTotal + otherTotal,
      image: imageTotal,
      other: otherTotal,
      month: sumCostsSince(month) + sumImageCostSince(month),
      imageCount,
      avg: imageCount ? imageTotal / imageCount : 0,
    },
    perSong: bySong(),
    perAsset: byAsset(),
    flow: flow(),
  };
}
