<script setup>
const props = defineProps({
  options: { type: Object, default: () => ({ songs: [], cats: [], channels: [], statuses: [] }) },
  modelValue: { type: Object, required: true },
  count: { type: Number, default: 0 },
});

const emit = defineEmits(['update:modelValue']);

const FIELDS = [
  { key: 'song', label: '歌', options: 'songs' },
  { key: 'cat', label: '分类', options: 'cats' },
  { key: 'channel', label: '通道', options: 'channels' },
  { key: 'status', label: '状态', options: 'statuses' },
];

const change = (key, event) => emit('update:modelValue', { ...props.modelValue, [key]: event.target.value });

const valuesOf = (field) => props.options[field.options] ?? [];
const labelOf = (field, option) => (field.key === 'song' ? `${option.title}（${option.slug}）` : option);
const valueOf = (field, option) => (field.key === 'song' ? option.slug : option);
</script>

<template>
  <div class="filters">
    <span v-for="field in FIELDS" :key="field.key">
      <label>{{ field.label }}</label>
      <select :value="modelValue[field.key] ?? ''" @change="change(field.key, $event)">
        <option value="">全部</option>
        <option v-for="option in valuesOf(field)" :key="valueOf(field, option)" :value="valueOf(field, option)">
          {{ labelOf(field, option) }}
        </option>
      </select>
    </span>
    <span class="filters__count">{{ count }} 件资产</span>
  </div>
</template>

<style scoped>
.filters {
  display: flex; align-items: center; gap: 18px;
  padding: 12px 0; border-bottom: 1px solid var(--rule);
}
.filters label { font-size: 11px; color: var(--ink-2); letter-spacing: 0.04em; margin-right: 6px; }
select {
  font: inherit; font-size: 12px; color: var(--ink);
  background: var(--paper-hi); border: 1px solid var(--rule);
  border-radius: var(--radius); padding: 3px 8px; cursor: pointer;
}
select:hover { border-color: var(--ink-3); }
.filters__count { margin-left: auto; font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); }
</style>
