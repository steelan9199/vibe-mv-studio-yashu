/**
 * todo.service.mjs — 「该我做的」推导规则表。
 * 规则与 scripts/status.mjs 一致，改这边必须同步改那边（否则自检说谎）。
 */
import { GATE_NAME } from '../domain/gates.mjs';

const RULES = [
  {
    match: ({ counts }) => !(counts.doc_kinds ?? '').split(',').includes('lyrics'),
    build: (song) => ({ pri: 1, text: `${song.title}：G2 逐字轴还没入库`, why: '单歌页左栏会空' }),
  },
  {
    match: ({ counts }) => counts.assets === 0,
    build: (song) => ({ pri: 3, text: `${song.title}：G3.5 资产清单还没入库（0 件）`, why: '图墙与资产库页无从显示' }),
  },
  {
    match: ({ counts }) => counts.assets > 0 && counts.images === 0,
    build: (song, counts) => ({ pri: 2, text: `${song.title}：${counts.assets} 件资产一张图都没入库`, why: 'assets 有行、images 为 0' }),
  },
  {
    match: ({ counts }) => counts.images > 0 && counts.picked === 0 && counts.svgs === 0,
    build: (song) => ({ pri: 4, text: `${song.title}：资产还在待选（无定稿图、无 SVG）`, why: '等老板选图' }),
  },
];

export function deriveTodo(songs, pendingVerdicts = []) {
  const items = [];

  for (const song of songs) {
    for (const rule of RULES) {
      if (rule.match(song)) {
        items.push({ ...rule.build(song, song.counts), href: `/song/${song.slug}` });
      }
    }
  }

  for (const verdict of pendingVerdicts) {
    items.push({
      pri: 2,
      text: `${verdict.title}：${verdict.gate} ${GATE_NAME[verdict.gate] ?? ''} 有产出，等你点头`,
      why: '状态 draft / partial',
      href: `/song/${verdict.slug}`,
    });
  }

  return items.sort((a, b) => a.pri - b.pri);
}
