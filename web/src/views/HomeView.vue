<script setup>
import { computed, watch } from 'vue';
import { fetchDashboard } from '@/api/studio.js';
import { useResource } from '@/composables/useResource.js';
import { usePageTitle } from '@/composables/usePageTitle.js';
import TodoBanner from '@/components/common/TodoBanner.vue';
import StatBar from '@/components/common/StatBar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SongRow from '@/components/home/SongRow.vue';
import { int, money } from '@/utils/format.js';

const { setPageTitle } = usePageTitle();
const { data, error } = useResource(fetchDashboard);

watch(data, () => setPageTitle(''), { immediate: true });

const stats = computed(() => {
  if (!data.value) return [];
  const totals = data.value.totals;
  return [
    { label: '歌', value: int(totals.songs) },
    { label: '已出片', value: int(totals.videos) },
    { label: '资产 / 图', value: `${int(totals.assets)} / ${int(totals.images)}` },
    { label: '本月花费', value: money(totals.costsMonth) },
  ];
});
</script>

<template>
  <main class="page">
    <p v-if="error" class="hint">读库失败：{{ error }}</p>

    <template v-if="data">
      <TodoBanner :items="data.todo" />
      <StatBar :items="stats" />

      <section class="songs">
        <div class="section-label">歌 · {{ data.songs.length }}</div>
        <SongRow v-for="song in data.songs" :key="song.slug" :song="song" />
        <EmptyState
          v-if="!data.songs.length"
          text="还没有歌。在对话框里说「建一首新歌，叫 XXX」，我来建。"
          action-text="看技能台"
          to="/skills"
        />
      </section>
    </template>

    <p v-else-if="!error" class="hint">正在读库…</p>
  </main>
</template>

<style scoped>
.songs { margin-top: var(--gap); }
.hint { color: var(--ink-2); font-size: 12px; padding-top: 24px; }
</style>
