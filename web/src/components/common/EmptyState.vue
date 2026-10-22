<script setup>
defineProps({
  text: { type: String, required: true },
  actionText: { type: String, default: '' },
  to: { type: String, default: '' },
});
</script>

<template>
  <div class="empty">
    <span>{{ text }}</span>
    <RouterLink v-if="actionText && to" class="empty__act" :to="to">{{ actionText }}</RouterLink>
    <span v-else-if="actionText" class="empty__act">{{ actionText }}</span>
  </div>
</template>

<style scoped>
.empty { color: var(--ink-2); font-size: 12px; padding: 8px 0; display: flex; gap: 10px; flex-wrap: wrap; }
.empty__act { color: var(--ink); border-bottom: 1px solid var(--rule); }
.empty__act:hover { color: var(--seal); border-color: var(--seal); }
</style>
