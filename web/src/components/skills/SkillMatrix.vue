<script setup>
const props = defineProps({
  songs: { type: Array, required: true },
  matrix: { type: Array, required: true },
  selection: { type: Object, default: null },
});

const emit = defineEmits(['select']);

const isOn = (row, index) => props.selection
  && props.selection.skillId === row.id
  && props.selection.songId === props.songs[index]?.id;

const pick = (row, index) => {
  const song = props.songs[index];
  const hits = row.cells[index] ?? 0;
  if (!hits) return;
  emit('select', { skillId: row.id, skill: row.name, songId: song.id, song: song.title });
};
</script>

<template>
  <table class="matrix">
    <thead>
      <tr>
        <th>技能</th>
        <th v-for="song in songs" :key="song.id" class="n">{{ song.title }}</th>
        <th class="n">合计</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in matrix" :key="row.id">
        <td>
          <span class="mono">{{ row.name }}</span>
          <span class="dim3 role">{{ row.role || '—' }}</span>
        </td>
        <td
          v-for="(count, index) in row.cells"
          :key="index"
          class="cell"
          :class="{ hit: count > 0, on: isOn(row, index) }"
          @click="pick(row, index)"
        >{{ count || '·' }}</td>
        <td class="n">{{ row.runs }}</td>
      </tr>
    </tbody>
  </table>
  <p v-if="!matrix.length" class="hint">技能表是空的。点顶部「刷新索引」，我从技能目录里扫一遍。</p>
</template>

<style scoped>
.role { font-size: 11px; margin-left: 8px; }
.cell { text-align: center; font-family: var(--font-mono); color: var(--ink-3); }
.cell.hit { color: var(--ink); cursor: pointer; }
.cell.hit:hover { background: var(--paper-hi); color: var(--seal); }
.cell.on { color: var(--seal); }
tbody tr:hover td { background: var(--paper-hi); }
.hint { color: var(--ink-2); font-size: 12px; padding-top: 12px; }
</style>
