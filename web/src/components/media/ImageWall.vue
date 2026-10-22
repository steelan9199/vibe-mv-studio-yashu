<script setup>
import ImageTile from './ImageTile.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { mediaUrl } from '@/api/studio.js';

defineProps({
  images: { type: Array, default: () => [] },
  selectedId: { type: Number, default: null },
  emptyText: { type: String, default: '还没有图。' },
});

const emit = defineEmits(['select']);
</script>

<template>
  <div v-if="images.length" class="wall">
    <ImageTile
      v-for="image in images"
      :key="image.id"
      :image="image"
      :src="mediaUrl('image', image.id)"
      :active="image.id === selectedId"
      @select="emit('select', $event)"
    />
  </div>
  <EmptyState v-else :text="emptyText" />
</template>

<style scoped>
.wall {
  display: grid; gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}
</style>
