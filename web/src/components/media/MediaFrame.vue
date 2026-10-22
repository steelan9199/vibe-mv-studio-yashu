<script setup>
import { ref } from 'vue';

defineProps({
  src: { type: String, required: true },
  kind: { type: String, default: 'audio' },
  caption: { type: String, default: '' },
});

const emit = defineEmits(['timeupdate', 'loaded']);

const audioEl = ref(null);
const videoEl = ref(null);

const seek = (time) => {
  const el = audioEl.value ?? videoEl.value;
  if (el) el.currentTime = time;
};

defineExpose({ seek });
</script>

<template>
  <figure class="frame">
    <div class="frame__stage">
      <audio
        v-if="kind === 'audio'"
        ref="audioEl"
        class="frame__audio"
        controls
        preload="metadata"
        :src="src"
        @timeupdate="emit('timeupdate', $event.target.currentTime)"
        @loadedmetadata="emit('loaded', $event.target.duration)"
      />
      <video
        v-else
        ref="videoEl"
        class="frame__video"
        controls
        preload="metadata"
        :src="src"
        @timeupdate="emit('timeupdate', $event.target.currentTime)"
        @loadedmetadata="emit('loaded', $event.target.duration)"
      />
    </div>
    <figcaption v-if="caption" class="frame__caption mono">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.frame { margin: 0; }
.frame__stage {
  aspect-ratio: 16 / 9; background: #141412;
  display: flex; align-items: center; justify-content: center;
}
.frame__audio { width: 100%; padding: 0 12px; filter: invert(0.92) hue-rotate(180deg); }
.frame__video { width: 100%; height: 100%; object-fit: contain; }
.frame__caption { font-size: 11px; color: var(--ink-3); padding-top: 5px; }
</style>
