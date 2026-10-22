<script setup>
import { computed, ref, watch } from 'vue';
import MediaFrame from '@/components/media/MediaFrame.vue';
import KeyValue from '@/components/common/KeyValue.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { mediaUrl } from '@/api/studio.js';
import { artifactsOfGate, EMPTY_HINT } from '@/domain/documents.js';
import { usePlaybackStore } from '@/stores/playback.js';
import { decimal, fileSize } from '@/utils/format.js';

const props = defineProps({
  detail: { type: Object, required: true },
  stage: { type: Object, required: true },
});

const playback = usePlaybackStore();
const frame = ref(null);

const audio = computed(() => {
  const items = artifactsOfGate(props.detail.artifacts, 'G0');
  return items.find((item) => item.kind === 'audio') ?? items[0] ?? null;
});

const rows = computed(() => (audio.value ? [
  { label: '文件', value: audio.value.path },
  { label: '大小', value: fileSize(audio.value.bytes) },
  { label: '时长', value: `${decimal(props.detail.song.dur)} s` },
] : []));

watch(() => playback.seek, (request) => {
  if (request) frame.value?.seek(request.time);
});
</script>

<template>
  <div v-if="audio">
    <MediaFrame
      ref="frame"
      kind="audio"
      :src="mediaUrl('audio', audio.id)"
      :caption="audio.path"
      @timeupdate="playback.update"
      @loaded="playback.setDuration"
    />
    <KeyValue :rows="rows" />
  </div>
  <EmptyState v-else :text="EMPTY_HINT.G0" />
</template>
