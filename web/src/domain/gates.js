/** 六关与文档归属。与 server/domain/gates.mjs 保持一字不差。 */

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

const DOC_GATE = {
  lyrics: 'G2',
  'source-lyrics': 'G2',
  music: 'G1',
  storyboard: 'G3',
  brief: 'G3',
  relay: 'G3',
  story: 'G4',
};

export const gateOfDoc = (kind) => DOC_GATE[kind] ?? 'G3';

/** 单歌页每一关用哪个组件渲染 */
export const GATE_COMPONENT = {
  G0: 'GateAudio',
  G1: 'GateMeasure',
  G2: 'GateLyrics',
  G3: 'GateContent',
  'G3.5': 'GateAssets',
  G4: 'GateAssembly',
  G5: 'GateVideo',
};
