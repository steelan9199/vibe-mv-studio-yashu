<script setup>
import { computed } from 'vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import GateAudio from './gates/GateAudio.vue';
import GateMeasure from './gates/GateMeasure.vue';
import GateLyrics from './gates/GateLyrics.vue';
import GateContent from './gates/GateContent.vue';
import GateAssets from './gates/GateAssets.vue';
import GateAssembly from './gates/GateAssembly.vue';
import GateVideo from './gates/GateVideo.vue';
import { runsOfGate } from '@/domain/documents.js';
import { datetime } from '@/utils/format.js';

const BODIES = {
  G0: GateAudio,
  G1: GateMeasure,
  G2: GateLyrics,
  G3: GateContent,
  'G3.5': GateAssets,
  G4: GateAssembly,
  G5: GateVideo,
};

const props = defineProps({
  detail: { type: Object, required: true },
  stage: { type: Object, required: true },
});

const body = computed(() => BODIES[props.stage.gate]);
const runs = computed(() => runsOfGate(props.detail.runs, props.stage.gate));
const time = computed(() => {
  if (props.stage.finished_at) return `完成 ${datetime(props.stage.finished_at)}`;
  if (props.stage.started_at) return `开始 ${datetime(props.stage.started_at)}`;
  return '';
});
</script>

<template>
  <section class="block">
    <header class="block__head">
      <span class="mono dim3">{{ stage.gate }}</span>
      <span>{{ stage.name }}</span>
      <StatusBadge :status="stage.status" />
      <span class="block__time mono">{{ time }}</span>
    </header>

    <p v-if="stage.note" class="block__note">{{ stage.note }}</p>

    <component :is="body" :detail="detail" :stage="stage" />

    <ul v-if="runs.length" class="block__runs">
      <li v-for="run in runs" :key="run.id">
        <span class="mono">{{ run.skill }}</span>
        <span class="dim3">{{ run.note }}</span>
        <span class="dim3 mono">{{ run.ok ? '成功' : '失败' }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.block { padding: 14px 0 16px; border-bottom: 0.5px solid var(--rule); }
.block:last-child { border-bottom: 0; }
.block__head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
.block__time { margin-left: auto; font-size: 11px; color: var(--ink-3); }
.block__note { color: var(--ink-2); font-size: 12px; margin: 0 0 8px; }
.block__runs { list-style: none; margin: 10px 0 0; padding: 0; }
.block__runs li { display: flex; gap: 10px; font-size: 11px; padding: 2px 0; }
</style>
