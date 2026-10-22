<script setup>
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchSong } from '@/api/studio.js';
import { useResource } from '@/composables/useResource.js';
import { usePageTitle } from '@/composables/usePageTitle.js';
import SongHeader from '@/components/song/SongHeader.vue';
import LyricsPane from '@/components/song/LyricsPane.vue';
import GateStack from '@/components/song/GateStack.vue';
import InspectorPane from '@/components/song/InspectorPane.vue';
import { parseLyrics } from '@/utils/content.js';
import { useInspectorStore } from '@/stores/inspector.js';
import { usePlaybackStore } from '@/stores/playback.js';

const route = useRoute();
const inspector = useInspectorStore();
const playback = usePlaybackStore();
const { setPageTitle } = usePageTitle();

const { data, error, load } = useResource(() => fetchSong(route.params.slug));

const lyrics = computed(() => parseLyrics(data.value?.docs ?? []));

watch(() => data.value?.song?.title, (title) => setPageTitle(title ?? ''), { immediate: true });

watch(() => route.params.slug, () => {
  inspector.clear();
  playback.reset();
  load();
});
</script>

<template>
  <main class="page page--wide">
    <p v-if="error" class="hint">读库失败：{{ error }}</p>

    <template v-if="data">
      <SongHeader :song="data.song" :stages="data.stages" :current="data.current" />
      <p v-if="data.song.note" class="note">{{ data.song.note }}</p>

      <div class="grid">
        <LyricsPane :lyrics="lyrics" :decisions="data.decisions" />
        <GateStack :detail="data" />
        <InspectorPane :song="data.song" />
      </div>
    </template>

    <p v-else-if="!error" class="hint">正在读库…</p>
  </main>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 260px 1fr 320px;
  align-items: start;
  border-top: 0;
}
.grid > * + * { border-left: 1px solid var(--rule); }
.note { font-size: 12px; color: var(--ink-2); margin: 10px 0 0; }
.hint { color: var(--ink-2); font-size: 12px; padding-top: 24px; }
</style>
