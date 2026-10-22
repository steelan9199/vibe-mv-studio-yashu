<script setup>
import { computed } from 'vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { mediaUrl } from '@/api/studio.js';
import { money, text } from '@/utils/format.js';

const props = defineProps({
  asset: { type: Object, required: true },
});

const thumb = computed(() => mediaUrl('image', props.asset.mainImageId));
const counters = computed(() => {
  const asset = props.asset;
  return `${asset.img_total} 图 · 定稿 ${asset.img_final} · SVG ${asset.svg_ok}`;
});
</script>

<template>
  <RouterLink class="card" :to="`/song/${asset.slug}`">
    <span class="card__stage">
      <img v-if="asset.mainImageId" :src="thumb" :alt="asset.asset_key" loading="lazy" />
      <span v-else class="card__placeholder mono">无图</span>
    </span>
    <span class="card__body">
      <span class="card__name">{{ asset.name }}</span>
      <span class="card__meta mono">{{ asset.asset_key }} · {{ text(asset.cat) }} · {{ text(asset.channel) }}</span>
      <span class="card__counters mono">{{ counters }}</span>
      <span class="card__foot">
        <StatusBadge :status="asset.status" />
        <span class="mono dim3">{{ money(asset.cost) }}</span>
      </span>
    </span>
  </RouterLink>
</template>

<style scoped>
.card {
  display: block; border: 1px solid var(--rule); border-radius: var(--radius);
  background: var(--paper-hi); overflow: hidden;
  transition: border-color 0.12s;
}
.card:hover { border-color: var(--ink-3); color: inherit; }
.card__stage {
  display: flex; align-items: center; justify-content: center;
  aspect-ratio: 4 / 3; background: #fff; overflow: hidden;
}
.card__stage img { max-width: 100%; max-height: 100%; object-fit: contain; }
.card__placeholder { font-size: 11px; color: var(--ink-3); }
.card__body { display: block; padding: 8px 10px; border-top: 1px solid var(--rule); }
.card__name { display: block; font-size: 12px; }
.card__meta { display: block; font-size: 11px; color: var(--ink-2); }
.card__counters { display: block; font-size: 11px; color: var(--ink-3); }
.card__foot { display: flex; justify-content: space-between; margin-top: 4px; }
</style>
