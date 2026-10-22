<script setup>
defineProps({
  rows: { type: Array, required: true },
});
</script>

<template>
  <div class="kv">
    <template v-for="row in rows" :key="row.label">
      <span class="kv__key">{{ row.label }}</span>
      <span class="kv__value" :class="{ mono: row.mono !== false }">
        <a v-if="row.href" :href="row.href" class="kv__link">{{ row.value }}</a>
        <template v-else>{{ row.value }}</template>
      </span>
    </template>
  </div>
</template>

<style scoped>
.kv { display: grid; grid-template-columns: 88px 1fr; gap: 4px 12px; font-size: 12px; padding: 4px 0; }
.kv__key { color: var(--ink-2); font-size: 11px; }
.kv__value { word-break: break-all; }
.kv__link { border-bottom: 1px solid var(--rule); }
</style>
