<script setup>
defineProps({
  items: { type: Array, required: true },
});
</script>

<template>
  <div class="stats">
    <div v-for="item in items" :key="item.label" class="stats__item">
      <div class="stats__key">{{ item.label }}</div>
      <div class="stats__value">{{ item.value }}</div>
    </div>
  </div>
</template>

<style scoped>
.stats { display: flex; gap: 56px; padding: 16px 0; border-bottom: 1px solid var(--rule); }
.stats__key { font-size: 11px; letter-spacing: 0.08em; color: var(--ink-2); }
.stats__value {
  font-family: var(--font-mono); font-variant-numeric: tabular-nums;
  font-size: 20px; line-height: 1.35;
}
</style>
