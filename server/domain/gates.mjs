/**
 * gates.mjs — 六关这个领域概念的唯一定义处。
 * 前端另有副本（web/src/domain/gates.js），两者必须一致。
 */

export const GATES = ['G0', 'G1', 'G2', 'G3', 'G3.5', 'G4', 'G5'];

export const GATE_NAME = {
  G0: '收料',
  G1: '测量',
  G2: '打轴',
  G3: '内容',
  'G3.5': '资产',
  G4: '装配',
  G5: '出片',
};

/** 文档 kind → 它属于哪一关 */
export const DOC_GATE = {
  lyrics: 'G2',
  'source-lyrics': 'G2',
  music: 'G1',
  storyboard: 'G3',
  brief: 'G3',
  relay: 'G3',
  story: 'G4',
};

export const gateOfDoc = (kind) => DOC_GATE[kind] ?? 'G3';
