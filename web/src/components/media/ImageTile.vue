<script setup>
defineProps({
  image: { type: Object, required: true },
  src: { type: String, default: '' },
  active: { type: Boolean, default: false },
  caption: { type: String, default: '' },
});

defineEmits(['select']);
</script>

<template>
  <button class="tile" :class="{ 'is-active': active }" type="button" @click="$emit('select', image)">
    <span class="tile__stage">
      <img v-if="src" :src="src" :alt="image.path" loading="lazy" />
      <span v-else class="tile__placeholder">无图</span>
    </span>
    <span class="tile__caption mono">
      <span>{{ caption || image.path }}</span>
      <span v-if="image.kind === 'final'" class="tile__flag">定稿</span>
      <span v-else-if="image.picked" class="tile__flag">已选</span>
    </span>
  </button>
</template>

<style scoped>
.tile {
  display: block; padding: 0; text-align: left; cursor: pointer;
  border: 1px solid var(--rule); border-radius: var(--radius);
  background: var(--paper-hi); overflow: hidden; font: inherit; color: inherit;
  transition: border-color 0.12s;
}
.tile:hover { border-color: var(--ink-3); }
.tile.is-active { border-color: var(--seal); }
.tile__stage {
  aspect-ratio: 4 / 3; background: #fff;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.tile__stage img { max-width: 100%; max-height: 100%; object-fit: contain; }
.tile__placeholder { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); }
.tile__caption {
  display: flex; justify-content: space-between; gap: 6px;
  padding: 5px 8px; border-top: 1px solid var(--rule);
  font-size: 11px; color: var(--ink-2);
}
.tile__flag { color: var(--seal); }
</style>
