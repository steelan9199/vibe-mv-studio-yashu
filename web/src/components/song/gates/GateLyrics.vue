<script setup>
import { computed } from 'vue';
import KeyValue from '@/components/common/KeyValue.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { docsOfGate, EMPTY_HINT } from '@/domain/documents.js';
import { lyricsStats, parseLyrics, renderMarkdown } from '@/utils/content.js';
import { timecode } from '@/utils/format.js';

const props = defineProps({
  detail: { type: Object, required: true },
  stage: { type: Object, required: true },
});

const docs = computed(() => docsOfGate(props.detail.docs, 'G2'));
const lyrics = computed(() => parseLyrics(docs.value));
const stats = computed(() => lyricsStats(lyrics.value));
const source = computed(() => docs.value.find((item) => item.kind === 'source-lyrics') ?? null);

const rows = computed(() => (lyrics.value ? [
  { label: '句 / 字', value: `${stats.value.lines} 句 · ${stats.value.words} 字` },
  { label: '末字收', value: timecode(stats.value.lastEnd) },
] : []));
</script>

<template>
  <template v-if="lyrics">
    <KeyValue :rows="rows" />
    <p class="hint">逐字轴在左栏，点一句跳到那句。</p>
    <template v-if="source">
      <div class="section-label source">原始歌词</div>
      <div class="markdown" v-html="renderMarkdown(source.doc)" />
    </template>
  </template>
  <EmptyState v-else :text="EMPTY_HINT.G2" />
</template>

<style scoped>
.hint { font-size: 12px; color: var(--ink-2); margin: 6px 0 0; }
.source { margin-top: 14px; }
.markdown { font-size: 12px; }
.markdown :deep(p) { margin: 4px 0; }
.markdown :deep(h1), .markdown :deep(h2), .markdown :deep(h3) { font-size: 13px; margin: 10px 0 4px; }
</style>
