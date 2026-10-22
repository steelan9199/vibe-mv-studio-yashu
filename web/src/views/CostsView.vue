<script setup>
import { computed } from 'vue';
import { fetchCosts } from '@/api/studio.js';
import { useResource } from '@/composables/useResource.js';
import { usePageTitle } from '@/composables/usePageTitle.js';
import StatBar from '@/components/common/StatBar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { datetime, int, money } from '@/utils/format.js';

const { setPageTitle } = usePageTitle();
setPageTitle('');

const { data, error } = useResource(fetchCosts);

const stats = computed(() => {
  if (!data.value) return [];
  const totals = data.value.totals;
  return [
    { label: '全部花费', value: money(totals.all) },
    { label: '本月', value: money(totals.month) },
    { label: '图数', value: int(totals.imageCount) },
    { label: '单张均价', value: money(totals.avg) },
  ];
});
</script>

<template>
  <main class="page">
    <p v-if="error" class="hint">读库失败：{{ error }}</p>

    <template v-if="data">
      <StatBar :items="stats" />

      <section class="block">
        <div class="section-label">按歌</div>
        <table>
          <thead>
            <tr><th>歌</th><th class="n">图数</th><th class="n">出图花费</th><th class="n">其他</th><th class="n">合计</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in data.perSong" :key="row.id">
              <td>{{ row.title }} <span class="mono dim3">{{ row.slug }}</span></td>
              <td class="n">{{ row.img }}</td>
              <td class="n">{{ money(row.img_cost) }}</td>
              <td class="n">{{ money(row.other) }}</td>
              <td class="n">{{ money(row.img_cost + row.other) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="block">
        <div class="section-label">按资产（最烧钱的 20 件）</div>
        <table v-if="data.perAsset.length">
          <thead>
            <tr><th>资产</th><th>分类</th><th>歌</th><th class="n">图数</th><th class="n">花费</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in data.perAsset" :key="row.id">
              <td><span class="mono">{{ row.asset_key }}</span> <span class="dim">{{ row.name }}</span></td>
              <td class="dim">{{ row.cat }}</td>
              <td class="dim">{{ row.title }}</td>
              <td class="n">{{ row.img }}</td>
              <td class="n">{{ money(row.cost) }}</td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-else text="还没有资产记录，所以没有可分摊的花费。" />
      </section>

      <section class="block">
        <div class="section-label">流水 · 最近 {{ data.flow.length }} 条</div>
        <table v-if="data.flow.length">
          <thead>
            <tr><th>时间</th><th>类型</th><th>对象</th><th>歌</th><th class="n">金额</th></tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in data.flow" :key="index">
              <td class="mono dim3">{{ datetime(row.at) }}</td>
              <td class="mono">{{ row.kind }}</td>
              <td class="mono dim">{{ row.ref || '—' }}</td>
              <td class="dim">{{ row.title || '—' }}</td>
              <td class="n">{{ money(row.amount) }}</td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-else text="还没有成本记录。生图之后让 AI 一起存进来。" />
      </section>
    </template>

    <p v-else-if="!error" class="hint">正在读库…</p>
  </main>
</template>

<style scoped>
.block { margin-top: var(--gap); }
.hint { color: var(--ink-2); font-size: 12px; padding-top: 24px; }
</style>
