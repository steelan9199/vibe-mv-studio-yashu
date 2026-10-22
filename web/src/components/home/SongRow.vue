<script setup>
import { computed } from 'vue';
import GateRail from '@/components/common/GateRail.vue';
import { GATE_NAME } from '@/domain/gates.js';
import { datetime, decimal, int } from '@/utils/format.js';

const props = defineProps({
  song: { type: Object, required: true },
});

const currentText = computed(() => {
  const current = props.song.current;
  if (!current) return '全部过闸';
  const note = current.note || '未填备注';
  return `当前 ${current.gate} ${GATE_NAME[current.gate] ?? ''} · ${note}`;
});

const metaText = computed(() => {
  const song = props.song;
  return [
    song.slug,
    song.dur ? `${decimal(song.dur)}s` : null,
    song.bpm ? `${decimal(song.bpm, 2)} BPM` : null,
    song.musicKey,
  ].filter(Boolean).join(' · ');
});

const counters = computed(() => {
  const counts = props.song.counts;
  return `文档 ${int(counts.docs)} · 资产 ${int(counts.assets)} · 图 ${int(counts.images)} · 调用 ${int(counts.runs)}`;
});
</script>

<template>
  <RouterLink class="row" :to="`/song/${song.slug}`">
    <div class="row__title">
      <div class="row__name">{{ song.title }}</div>
      <div class="row__meta mono">{{ metaText }}</div>
    </div>
    <div>
      <GateRail :stages="song.stages" :current="song.current?.gate ?? null" />
      <div class="row__now">{{ currentText }}</div>
    </div>
    <div class="row__counts mono">
      {{ counters }}<br />
      最后动作 {{ datetime(song.lastTouch?.finished_at ?? song.updatedAt) }}
    </div>
  </RouterLink>
</template>

<style scoped>
.row {
  display: grid; grid-template-columns: 300px 1fr 260px; gap: 24px;
  align-items: center; padding: 14px 4px;
  border-bottom: 0.5px solid var(--rule);
  transition: background 0.12s;
}
.row:hover { background: var(--paper-hi); color: inherit; }
.row__name { font-size: 14px; }
.row__meta { font-size: 11px; color: var(--ink-2); }
.row__now { font-size: 12px; color: var(--ink-2); margin-top: 8px; }
.row__counts { font-size: 11px; color: var(--ink-3); text-align: right; }
</style>
