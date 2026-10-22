/** 播放进度与跳转请求：歌词栏与音频栏共享同一条时间轴。 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const usePlaybackStore = defineStore('playback', () => {
  const currentTime = ref(0);
  const duration = ref(0);
  const playing = ref(false);

  /* 跳转用"票据"传递：{ time, token }，音频组件监听 token 变化再改 currentTime */
  const seek = ref(null);
  let token = 0;

  const progress = computed(() => (duration.value ? currentTime.value / duration.value : 0));

  const update = (time) => { currentTime.value = time ?? 0; };
  const setDuration = (value) => { duration.value = value ?? 0; };
  const setPlaying = (value) => { playing.value = Boolean(value); };
  const requestSeek = (time) => { seek.value = { time: time ?? 0, token: ++token }; };
  const reset = () => { currentTime.value = 0; playing.value = false; seek.value = null; };

  return { currentTime, duration, playing, progress, seek, update, setDuration, setPlaying, requestSeek, reset };
});
