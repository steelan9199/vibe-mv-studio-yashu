/** assets.service.mjs — 跨歌资产库：筛选、主图、单件明细。 */
import { filterOptions, findById, findFiltered, mainImageId } from '../repositories/assets.repo.mjs';
import { ofAsset as imagesOfAsset, svgsOfAsset } from '../repositories/images.repo.mjs';

export function buildAssetList(filters = {}) {
  const assets = findFiltered(filters).map((asset) => ({
    ...asset,
    mainImageId: mainImageId(asset.id),
  }));
  return { assets, options: filterOptions(), filters };
}

export function buildAssetDetail(id) {
  const asset = findById(id);
  if (!asset) return null;
  return {
    asset,
    images: imagesOfAsset(id),
    svgs: svgsOfAsset(id),
  };
}
