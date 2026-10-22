<script setup>
import GateRail from '@/components/common/GateRail.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { GATE_NAME } from '@/domain/gates.js';

defineProps({
  song: { type: Object, required: true },
  stages: { type: Array, required: true },
  current: { type: Object, default: null },
});
</script>

<template>
  <header class="head">
    <div class="head__title">{{ song.title }}</div>
    <div class="head__slug mono">{{ song.slug }}</div>
    <StatusBadge
      v-if="current"
      :status="current.status"
      :label="`当前 ${current.gate} ${GATE_NAME[current.gate]}`"
      class="head__badge"
    />
    <StatusBadge v-else status="done" label="全部过闸" />
    <div class="head__rail">
      <GateRail :stages="stages" :current="current?.gate ?? null" />
    </div>
  </header>
</template>

<style scoped>
.head {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 0; border-bottom: 1px solid var(--rule);
}
.head__title { font-size: 15px; }
.head__slug { font-size: 11px; color: var(--ink-3); }
.head__badge { color: var(--seal); }
.head__rail { margin-left: auto; }
</style>
