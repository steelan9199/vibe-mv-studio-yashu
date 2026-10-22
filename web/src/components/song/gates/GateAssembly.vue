<script setup>
import { computed } from 'vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { docsOfGate, EMPTY_HINT } from '@/domain/documents.js';

const props = defineProps({
  detail: { type: Object, required: true },
  stage: { type: Object, required: true },
});

const story = computed(() => docsOfGate(props.detail.docs, 'G4').find((doc) => doc.kind === 'story') ?? null);
const preview = computed(() => (story.value ? story.value.doc.slice(0, 4000) : ''));
</script>

<template>
  <details v-if="story" class="more">
    <summary class="dim">story 全文 · {{ story.doc.length }} 字符</summary>
    <pre class="more__body mono">{{ preview }}</pre>
  </details>
  <EmptyState v-else :text="EMPTY_HINT.G4" />
</template>

<style scoped>
.more summary { font-size: 12px; cursor: pointer; }
.more__body {
  font-size: 11px; color: var(--ink-2); white-space: pre-wrap;
  max-height: 240px; overflow: auto; margin: 6px 0 0;
}
</style>
