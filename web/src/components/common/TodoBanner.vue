<script setup>
defineProps({
  items: { type: Array, required: true },
});
</script>

<template>
  <section v-if="items.length" class="todo">
    <div class="todo__label">该我做的 · {{ items.length }}</div>
    <div v-for="(item, index) in items.slice(0, 5)" :key="index" class="todo__row">
      <span>{{ item.text }}</span>
      <span class="todo__why">{{ item.why }}</span>
      <RouterLink class="todo__go" :to="item.href">去看</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.todo {
  border-left: 2px solid var(--seal);
  background: var(--paper-hi);
  padding: 12px 16px;
  margin-top: 24px;
}
.todo__label { font-size: 11px; letter-spacing: 0.08em; color: var(--seal); margin-bottom: 4px; }
.todo__row { display: flex; align-items: center; gap: 14px; padding: 3px 0; }
.todo__why { color: var(--ink-3); font-size: 11px; }
.todo__go {
  margin-left: auto; background: var(--seal); color: #fff;
  font-size: 12px; padding: 3px 12px; white-space: nowrap;
}
.todo__go:hover { color: #fff; opacity: 0.88; }
</style>
