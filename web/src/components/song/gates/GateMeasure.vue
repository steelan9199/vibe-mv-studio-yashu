<script setup>
import { computed } from 'vue';
import KeyValue from '@/components/common/KeyValue.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { artifactsOfGate, docsOfGate, EMPTY_HINT } from '@/domain/documents.js';
import { decimal, fileSize, text } from '@/utils/format.js';

const props = defineProps({
  detail: { type: Object, required: true },
  stage: { type: Object, required: true },
});

const doc = computed(() => docsOfGate(props.detail.docs, 'G1').find((item) => item.kind === 'music') ?? null);
const artifacts = computed(() => artifactsOfGate(props.detail.artifacts, 'G1'));

const rows = computed(() => [
  { label: 'BPM', value: decimal(props.detail.song.bpm, 2) },
  { label: '调性', value: text(props.detail.song.music_key) },
  { label: '时长', value: `${decimal(props.detail.song.dur)} s` },
  ...artifacts.value.map((item) => ({ label: '档案', value: `${item.path} · ${fileSize(item.bytes)}` })),
]);

const preview = computed(() => (doc.value ? doc.value.doc.slice(0, 4000) : ''));
</script>

<template>
  <template v-if="doc || artifacts.length">
    <KeyValue :rows="rows" />
    <details v-if="doc" class="more">
      <summary class="dim">音乐档案全文 · {{ doc.doc.length }} 字符</summary>
      <pre class="more__body mono">{{ preview }}</pre>
    </details>
  </template>
  <EmptyState v-else :text="EMPTY_HINT.G1" />
</template>

<style scoped>
.more { margin-top: 8px; }
.more summary { font-size: 12px; cursor: pointer; }
.more__body {
  font-size: 11px; color: var(--ink-2); white-space: pre-wrap;
  max-height: 220px; overflow: auto; margin: 6px 0 0;
}
</style>
