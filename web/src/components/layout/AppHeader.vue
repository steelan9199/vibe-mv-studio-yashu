<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { reindex } from '@/api/studio.js';
import { usePageTitle } from '@/composables/usePageTitle.js';

const route = useRoute();
const { pageTitle } = usePageTitle();

const NAV = [
  { path: '/', label: '首页' },
  { path: '/assets', label: '资产库' },
  { path: '/skills', label: '技能' },
  { path: '/costs', label: '成本' },
];

const flash = ref('127.0.0.1:8791');
const busy = ref(false);

const isActive = (path) => (path === '/' ? route.path === '/' : route.path.startsWith(path));
const title = computed(() => pageTitle.value);

async function refresh() {
  busy.value = true;
  flash.value = '正在重扫技能与文件库…';
  try {
    const result = await reindex();
    flash.value = `技能 ${result.skills}（新增 ${result.skillsNew}）· 补尺寸 ${result.dims} · 缺文件 ${result.missing.length}`;
    setTimeout(() => window.location.reload(), 900);
  } catch (error) {
    flash.value = `刷新失败：${error.message}`;
    busy.value = false;
  }
}
</script>

<template>
  <header class="top">
    <div class="top__brand">工作室<template v-if="title"><span class="top__sep">·</span>{{ title }}</template></div>
    <nav class="top__nav">
      <RouterLink
        v-for="item in NAV"
        :key="item.path"
        :to="item.path"
        :class="{ 'is-on': isActive(item.path) }"
      >{{ item.label }}</RouterLink>
    </nav>
    <div class="top__right">
      <span class="top__flash mono">{{ flash }}</span>
      <button class="btn" type="button" :disabled="busy" @click="refresh">刷新索引</button>
    </div>
  </header>
</template>

<style scoped>
.top {
  height: 56px; display: flex; align-items: center; gap: 24px;
  padding: 0 24px; background: var(--paper-hi);
  border-bottom: 1px solid var(--rule);
  position: sticky; top: 0; z-index: 10;
}
.top__brand { font-size: 15px; white-space: nowrap; }
.top__sep { color: var(--ink-3); margin: 0 6px; }
.top__nav { display: flex; gap: 18px; }
.top__nav a {
  font-size: 13px; color: var(--ink-2); padding: 3px 0 2px;
  border-bottom: 2px solid transparent;
  transition: color 0.12s, border-color 0.12s;
}
.top__nav a:hover { color: var(--ink); }
.top__nav a.is-on { color: var(--ink); border-bottom-color: var(--ink); }
.top__right { margin-left: auto; display: flex; align-items: center; gap: 14px; }
.top__flash { font-size: 11px; color: var(--ink-3); max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
