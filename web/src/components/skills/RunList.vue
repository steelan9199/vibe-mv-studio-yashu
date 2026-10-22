<script setup>
import EmptyState from '@/components/common/EmptyState.vue';
import { datetime } from '@/utils/format.js';

defineProps({
  runs: { type: Array, default: () => [] },
  title: { type: String, default: '' },
});
</script>

<template>
  <div>
    <div class="section-label">{{ title }}</div>
    <table v-if="runs.length">
      <thead>
        <tr><th>技能</th><th>关卡</th><th>歌</th><th>时间</th><th>结果</th><th>备注</th></tr>
      </thead>
      <tbody>
        <tr v-for="run in runs" :key="run.id">
          <td class="mono">{{ run.skill }}</td>
          <td class="mono dim">{{ run.gate || '—' }}</td>
          <td class="dim">{{ run.title || '—' }}</td>
          <td class="mono dim3">{{ datetime(run.started_at) }}</td>
          <td class="mono">{{ run.ok ? '成功' : '失败' }}</td>
          <td class="dim3">{{ run.note || '—' }}</td>
        </tr>
      </tbody>
    </table>
    <EmptyState v-else text="还没有调用记录。技能跑一次、存一次之后就有了。" />
  </div>
</template>
