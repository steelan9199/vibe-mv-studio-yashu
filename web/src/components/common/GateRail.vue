<script setup>
import { GATES, GATE_NAME } from '@/domain/gates.js';

const props = defineProps({
  stages: { type: Array, default: () => [] },
  current: { type: String, default: null },
});

const statusOf = (gate) => props.stages.find((stage) => stage.gate === gate)?.status ?? 'todo';
const classOf = (gate) => [
  'rail__item',
  `is-${statusOf(gate)}`,
  { 'is-current': gate === props.current },
];
const titleOf = (gate) => `${gate} ${GATE_NAME[gate]} · ${statusOf(gate)}`;
</script>

<template>
  <div class="rail">
    <div v-for="gate in GATES" :key="gate" :class="classOf(gate)" :title="titleOf(gate)">
      <span class="rail__dot" />
      <span class="rail__label">{{ gate }}</span>
    </div>
  </div>
</template>

<style scoped>
.rail { display: flex; align-items: flex-start; }
.rail__item {
  position: relative; min-width: 56px;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
}
.rail__item::before,
.rail__item::after {
  content: ''; position: absolute; top: 4px; border-top: 1px solid var(--rule);
}
.rail__item::before { left: 0; right: 50%; }
.rail__item::after { left: 50%; right: 0; }
.rail__item:first-child::before,
.rail__item:last-child::after { display: none; }

.rail__dot {
  position: relative; z-index: 1;
  width: 9px; height: 9px; border-radius: 50%;
  border: 1px solid var(--ink-3); background: var(--paper);
}
.rail__label { font-family: var(--font-mono); font-size: 10px; color: var(--ink-3); }

.is-done .rail__dot { background: var(--done); border-color: var(--done); }
.is-partial .rail__dot { background: var(--partial); border-color: var(--partial); }
.is-draft .rail__dot { background: var(--draft); border-color: var(--draft); }
.is-current .rail__dot { border: 1.5px solid var(--seal); background: var(--paper); }
.is-current .rail__label { color: var(--seal); }
</style>
