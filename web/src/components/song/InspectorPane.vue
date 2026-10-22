<script setup>
import { computed } from 'vue';
import KeyValue from '@/components/common/KeyValue.vue';
import { mediaUrl } from '@/api/studio.js';
import { useInspectorStore } from '@/stores/inspector.js';
import { decimal, fileSize, money, text } from '@/utils/format.js';

const props = defineProps({
  song: { type: Object, required: true },
});

const inspector = useInspectorStore();
const image = computed(() => inspector.image);
const asset = computed(() => inspector.asset);

const songRows = computed(() => [
  { label: 'slug', value: text(props.song.slug) },
  { label: '时长', value: `${decimal(props.song.dur)} s` },
  { label: 'BPM', value: decimal(props.song.bpm, 2) },
  { label: '调性', value: text(props.song.music_key) },
  { label: '画布', value: text(props.song.canvas) },
  { label: '引擎', value: text(props.song.engine ?? '未定') },
]);

const assetRows = computed(() => {
  const current = asset.value;
  if (!current) return [];
  return [
    { label: '资产', value: `${current.asset_key} ${current.name}` },
    { label: '分类', value: text(current.cat) },
    { label: '视角', value: text(current.angle) },
    { label: '通道', value: text(current.channel) },
    { label: '图', value: `${current.img_total} / ${current.img_picked} / ${current.img_final}` },
    { label: 'SVG', value: current.svg_ok ? `${current.svg_ok} 版已审` : '—' },
  ];
});

const imageRows = computed(() => {
  const current = image.value;
  if (!current) return [];
  return [
    { label: '文件', value: text(current.path) },
    { label: '类型', value: `${current.kind}${current.picked ? ' · 已选' : ''}` },
    { label: '尺寸', value: current.w && current.h ? `${current.w}×${current.h}` : '—' },
    { label: '大小', value: fileSize(current.bytes) },
    { label: 'seed', value: text(current.seed) },
    { label: '工作流', value: text(current.workflow) },
    { label: '成本', value: money(current.cost) },
  ];
});
</script>

<template>
  <aside class="pane">
    <div class="section-label">检查器</div>

    <template v-if="image">
      <img v-if="image.id" class="preview" :src="mediaUrl('image', image.id)" :alt="image.path" />
      <KeyValue :rows="imageRows" />
      <div v-if="image.prompt" class="prompt">
        <div class="prompt__label">提示词</div>
        <p class="prompt__body">{{ image.prompt }}</p>
      </div>
    </template>

    <template v-else-if="asset">
      <KeyValue :rows="assetRows" />
      <p class="tip">在中间资产表点一行，这里换成那件资产；点图看提示词与 seed。</p>
    </template>

    <template v-else>
      <KeyValue :rows="songRows" />
      <p class="tip">点中间任何一张图或一件资产，这里显示提示词、seed 与成本。</p>
    </template>
  </aside>
</template>

<style scoped>
.pane {
  padding: 16px 20px 64px; min-height: 70vh;
  position: sticky; top: 56px; max-height: calc(100vh - 56px); overflow: auto;
}
.preview { width: 100%; background: #fff; border: 1px solid var(--rule); border-radius: var(--radius); margin-bottom: 8px; }
.prompt { border-top: 1px solid var(--rule); margin-top: 10px; padding-top: 8px; }
.prompt__label { font-size: 11px; letter-spacing: 0.08em; color: var(--ink-2); }
.prompt__body { font-size: 12px; color: var(--ink-2); margin: 4px 0 0; }
.tip { font-size: 12px; color: var(--ink-3); margin-top: 12px; }
</style>
