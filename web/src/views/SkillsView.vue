<script setup>
import { computed, ref } from 'vue';
import { fetchSkills } from '@/api/studio.js';
import { useResource } from '@/composables/useResource.js';
import { usePageTitle } from '@/composables/usePageTitle.js';
import SkillMatrix from '@/components/skills/SkillMatrix.vue';
import RunList from '@/components/skills/RunList.vue';
import { int } from '@/utils/format.js';

const { setPageTitle } = usePageTitle();
setPageTitle('');

const { data, error } = useResource(fetchSkills);
const selection = ref(null);

const selectedSlug = computed(() => {
  if (!selection.value || !data.value) return null;
  return data.value.songs.find((song) => song.id === selection.value.songId)?.slug ?? null;
});

const detailRuns = computed(() => {
  if (!data.value) return [];
  if (!selection.value) return data.value.runs.slice(0, 10);
  return data.value.runs.filter((run) => run.skill_id === selection.value.skillId && run.slug === selectedSlug.value);
});

const detailTitle = computed(() => {
  if (!selection.value) return `最近调用 · 共 ${int(data.value?.totalRuns ?? 0)} 次`;
  return `${selection.value.skill} × ${selection.value.song} · ${detailRuns.value.length} 次`;
});

const skillCards = computed(() => data.value?.skills ?? []);
</script>

<template>
  <main class="page">
    <p v-if="error" class="hint">读库失败：{{ error }}</p>

    <template v-if="data">
      <section>
        <div class="section-label">调用矩阵 · 行=技能 列=歌（格子里能点）</div>
        <SkillMatrix
          :songs="data.songs"
          :matrix="data.matrix"
          :selection="selection"
          @select="(payload) => (selection = payload)"
        />
      </section>

      <section class="detail">
        <RunList :runs="detailRuns" :title="detailTitle" />
      </section>

      <section class="detail">
        <div class="section-label">技能 · {{ skillCards.length }}</div>
        <div class="cards">
          <div v-for="skill in skillCards" :key="skill.id" class="skill">
            <div class="skill__name mono">{{ skill.name }}</div>
            <div class="skill__role">{{ skill.role || '职责未同步（点顶部刷新索引）' }}</div>
            <div class="skill__meta mono">{{ skill.layer || '未分层' }} · {{ skill.version || '?' }} · {{ skill.runs }} 次</div>
          </div>
        </div>
        <p v-if="data.unsynced" class="hint">{{ data.unsynced }} 条技能缺 layer / doc_path，点顶部「刷新索引」补。</p>
      </section>
    </template>

    <p v-else-if="!error" class="hint">正在读库…</p>
  </main>
</template>

<style scoped>
.detail { margin-top: var(--gap); }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0 24px; }
.skill { padding: 10px 0; border-bottom: 0.5px solid var(--rule); }
.skill__name { font-size: 12px; }
.skill__role { font-size: 12px; color: var(--ink-2); }
.skill__meta { font-size: 11px; color: var(--ink-3); }
.hint { color: var(--ink-2); font-size: 12px; padding-top: 12px; }
</style>
