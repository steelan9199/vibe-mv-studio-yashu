<script setup>
import { computed } from 'vue';
import EmptyState from '@/components/common/EmptyState.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import ImageWall from '@/components/media/ImageWall.vue';
import { EMPTY_HINT } from '@/domain/documents.js';
import { useInspectorStore } from '@/stores/inspector.js';
import { text } from '@/utils/format.js';

const props = defineProps({
  detail: { type: Object, required: true },
  stage: { type: Object, required: true },
});

const inspector = useInspectorStore();

const selectedKey = computed(() => inspector.asset?.asset_key ?? null);

const imagesOfSelected = computed(() => {
  if (!inspector.asset) return [];
  return props.detail.images.filter((image) => image.asset_id === inspector.asset.asset_id);
});

const pick = (asset) => inspector.selectAsset(asset, null);
</script>

<template>
  <template v-if="detail.assets.length">
    <table>
      <thead>
        <tr>
          <th>资产</th><th>分类</th><th>视角</th><th>通道</th>
          <th class="n">图 总/选/定</th><th class="n">SVG</th><th>状态</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="asset in detail.assets"
          :key="asset.asset_id"
          class="row"
          :class="{ 'is-on': asset.asset_key === selectedKey }"
          @click="pick(asset)"
        >
          <td><span class="mono">{{ asset.asset_key }}</span> <span class="dim">{{ asset.name }}</span></td>
          <td class="dim">{{ text(asset.cat) }}</td>
          <td class="dim">{{ text(asset.angle) }}</td>
          <td class="dim mono">{{ text(asset.channel) }}</td>
          <td class="n">{{ asset.img_total }} / {{ asset.img_picked }} / {{ asset.img_final }}</td>
          <td class="n">{{ asset.svg_ok || '—' }}</td>
          <td><StatusBadge :status="asset.status" /></td>
        </tr>
      </tbody>
    </table>

    <div v-if="imagesOfSelected.length" class="thumbs">
      <div class="section-label">{{ inspector.asset.asset_key }} 的图 · {{ imagesOfSelected.length }}</div>
      <ImageWall
        :images="imagesOfSelected"
        :selected-id="inspector.image?.id ?? null"
        empty-text="这件资产还没有图。"
        @select="(image) => inspector.selectImage(image, inspector.asset)"
      />
    </div>
  </template>
  <EmptyState v-else :text="EMPTY_HINT['G3.5']" action-text="去资产库" to="/assets" />
</template>

<style scoped>
.row { cursor: pointer; }
.row:hover td { background: var(--paper-hi); }
.row.is-on td { background: var(--paper-hi); }
.thumbs { margin-top: 16px; }
</style>
