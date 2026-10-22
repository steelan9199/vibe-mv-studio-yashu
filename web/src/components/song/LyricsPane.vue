<script setup>
import { computed } from 'vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { usePlaybackStore } from '@/stores/playback.js';
import { shortDate, timecode, text } from '@/utils/format.js';

const props = defineProps({
  lyrics: { type: Object, default: null },
  decisions: { type: Array, default: () => [] },
});

const playback = usePlaybackStore();

const lines = computed(() => props.lyrics?.lyrics ?? []);

const activeLine = computed(() => {
  const time = playback.currentTime;
  return lines.value.findIndex((line) => time >= line.start && time < line.end);
});

const activeWord = (line) => {
  if (!line.words) return -1;
  const time = playback.currentTime;
  return line.words.findIndex((word, index) => {
    const end = word.e ?? line.words[index + 1]?.t ?? line.end;
    return time >= word.t && time < end;
  });
};

const seek = (time) => playback.requestSeek(time);
</script>

<template>
  <aside class="pane">
    <div class="section-label">歌词轴{{ lyrics ? ` · ${lines.length} 句` : '' }}</div>

    <div v-if="lines.length" class="lyrics">
      <div
        v-for="(line, index) in lines"
        :key="index"
        class="line"
        :class="{ 'is-on': index === activeLine }"
        @click="seek(line.start)"
      >
        <span class="line__time mono">{{ timecode(line.start) }}</span>
        <span class="line__text">
          <template v-if="line.words?.length">
            <span
              v-for="(word, w) in line.words"
              :key="w"
              class="word"
              :class="{ 'is-on': index === activeLine && w === activeWord(line) }"
            >{{ word.w === ' ' ? ' ' : word.w }}</span>
          </template>
          <template v-else>{{ line.text }}</template>
        </span>
      </div>
    </div>

    <EmptyState v-else text="还没有逐字轴。在对话框里说「打开打轴页」，我帮你起。" />

    <div class="section-label decisions">你的决定 · {{ decisions.length }}</div>
    <div v-if="decisions.length" class="decisions">
      <div v-for="decision in decisions" :key="decision.id" class="decision">
        <span class="mono dim3">{{ shortDate(decision.at) }}</span>
        <span>{{ text(decision.scope) }}/{{ text(decision.target) }} → {{ text(decision.verdict) }}</span>
        <span v-if="decision.note" class="dim">{{ decision.note }}</span>
      </div>
    </div>
    <EmptyState v-else text="还没有记录。" />
  </aside>
</template>

<style scoped>
.pane { padding: 16px 20px 64px; min-height: 70vh; }
.lyrics { display: flex; flex-direction: column; }
.line {
  display: grid; grid-template-columns: 46px 1fr; gap: 8px;
  padding: 4px 0; cursor: pointer;
}
.line__time { font-size: 11px; color: var(--ink-3); }
.line__text { color: var(--ink-3); }
.line:hover .line__text { color: var(--ink-2); }
.line.is-on .line__text { color: var(--ink); }
.word.is-on { color: var(--seal); }
.decisions { margin-top: 20px; }
.decision { display: flex; flex-direction: column; gap: 1px; padding: 4px 0; font-size: 12px; }
</style>
