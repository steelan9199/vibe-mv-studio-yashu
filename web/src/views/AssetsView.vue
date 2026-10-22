<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchAssets } from '@/api/studio.js';
import { useResource } from '@/composables/useResource.js';
import { usePageTitle } from '@/composables/usePageTitle.js';
import FilterBar from '@/components/assets/FilterBar.vue';
import AssetCard from '@/components/assets/AssetCard.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const route = useRoute();
const { setPageTitle } = usePageTitle();
setPageTitle('');

const filters = ref({
  song: route.query.song ?? '',
  cat: route.query.cat ?? '',
  channel: route.query.channel ?? '',
  status: route.query.status ?? '',
});

const { data, error, load } = useResource(() => fetchAssets(filters.value));

watch(filters, load, { deep: true });

const assets = computed(() => data.value?.assets ?? []);
</script>

<template>
  <main class="page page--wide">
    <p v-if="error" class="hint">读库失败：{{ error }}</p>

    <template v-if="data">
      <FilterBar
        v-model="filters"
        :options="data.options"
        :count="assets.length"
      />
      <div v-if="assets.length" class="wall">
        <AssetCard v-for="asset in assets" :key="asset.id" :asset="asset" />
      </div>
      <EmptyState
        v-else
        text="还没有资产记录。资产清单出来之后，让 AI 存一次就有了。"
        action-text="看首页待办"
        to="/"
      />
    </template>

    <p v-else-if="!error" class="hint">正在读库…</p>
  </main>
</template>

<style scoped>
.wall {
  display: grid; gap: 14px; margin-top: 16px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
.hint { color: var(--ink-2); font-size: 12px; padding-top: 24px; }
</style>
