/** 单歌页右侧检查器选中的对象（资产 / 图），跨栏共享。 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useInspectorStore = defineStore('inspector', () => {
  const asset = ref(null);
  const image = ref(null);

  const selectAsset = (nextAsset, nextImage = null) => {
    asset.value = nextAsset;
    image.value = nextImage;
  };

  const selectImage = (nextImage, nextAsset = null) => {
    image.value = nextImage;
    if (nextAsset) asset.value = nextAsset;
  };

  const clear = () => {
    asset.value = null;
    image.value = null;
  };

  return { asset, image, selectAsset, selectImage, clear };
});
