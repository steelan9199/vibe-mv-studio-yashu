<script setup>
const props = defineProps({
  status: { type: String, default: 'todo' },
  label: { type: String, default: '' },
});

const TEXT = {
  done: '已过闸',
  todo: '未开始',
  partial: '有产出不完整',
  draft: '完整待点头',
};

const text = () => props.label || TEXT[props.status] || props.status;
</script>

<template>
  <span class="badge" :class="`is-${status}`"><i />{{ text() }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-2);
}
.badge i { width: 6px; height: 6px; border-radius: 50%; border: 1px solid var(--ink-3); }
.is-done i { background: var(--done); border-color: var(--done); }
.is-draft i { background: var(--draft); border-color: var(--draft); }
.is-partial i { background: var(--partial); border-color: var(--partial); }
</style>
