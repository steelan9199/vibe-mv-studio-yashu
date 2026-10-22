<script setup>
import GateBlock from './GateBlock.vue';

defineProps({
  detail: { type: Object, required: true },
});
</script>

<template>
  <div class="stack">
    <GateBlock v-for="stage in detail.stages" :key="stage.gate" :detail="detail" :stage="stage" />
  </div>
</template>

<style scoped>
.stack { padding: 0 20px 64px; min-height: 70vh; }
</style>
