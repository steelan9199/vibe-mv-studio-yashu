<script setup>
import { computed } from 'vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { docsOfGate, EMPTY_HINT } from '@/domain/documents.js';
import { renderMarkdown } from '@/utils/content.js';

const props = defineProps({
  detail: { type: Object, required: true },
  stage: { type: Object, required: true },
});

const STORYBOARD_KINDS = ['storyboard', 'brief', 'relay'];
const docs = computed(() => docsOfGate(props.detail.docs, 'G3').filter((doc) => STORYBOARD_KINDS.includes(doc.kind)));
</script>

<template>
  <div v-if="docs.length" class="docs">
    <article v-for="doc in docs" :key="doc.id">
      <div class="section-label">{{ doc.kind }} · v{{ doc.version }}</div>
      <div class="markdown" v-html="renderMarkdown(doc.doc)" />
    </article>
  </div>
  <EmptyState v-else :text="EMPTY_HINT.G3" />
</template>

<style scoped>
.docs article + article { margin-top: 18px; }
.markdown { font-size: 12px; }
.markdown :deep(p) { margin: 4px 0; }
.markdown :deep(h1), .markdown :deep(h2), .markdown :deep(h3) { font-size: 13px; margin: 10px 0 4px; }
.markdown :deep(ul) { margin: 4px 0; padding-left: 18px; }
.markdown :deep(table) { margin: 6px 0; }
.markdown :deep(pre) { white-space: pre-wrap; font-family: var(--font-mono); font-size: 11px; }
</style>
