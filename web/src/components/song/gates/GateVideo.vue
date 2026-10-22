<script setup>
import { computed } from 'vue';
import MediaFrame from '@/components/media/MediaFrame.vue';
import KeyValue from '@/components/common/KeyValue.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { artifactsOfGate, EMPTY_HINT } from '@/domain/documents.js';
import { mediaUrl } from '@/api/studio.js';
import { fileSize } from '@/utils/format.js';

const props = defineProps({
  detail: { type: Object, required: true },
  stage: { type: Object, required: true },
});

const video = computed(() => artifactsOfGate(props.detail.artifacts, 'G5').find((item) => item.kind === 'video') ?? null);

const rows = computed(() => (video.value ? [
  { label: '文件', value: video.value.path },
  { label: '大小', value: fileSize(video.value.bytes) },
] : []));
</script>

<template>
  <div v-if="video">
    <MediaFrame kind="video" :src="mediaUrl('video', video.id)" />
    <KeyValue :rows="rows" />
  </div>
  <EmptyState v-else :text="EMPTY_HINT.G5" />
</template>
