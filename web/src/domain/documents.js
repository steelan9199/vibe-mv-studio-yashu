/** 文档与产物按关分派的纯函数。 */
import { gateOfDoc } from './gates.js';

export const docsOfGate = (docs = [], gate) => docs.filter((doc) => gateOfDoc(doc.kind) === gate);

export const artifactsOfGate = (artifacts = [], gate) => artifacts.filter((item) => item.gate === gate);

export const runsOfGate = (runs = [], gate) => runs.filter((run) => run.gate === gate);

/** 每关的空状态文案：说清缺什么 + 下一步在对话框里怎么说 */
export const EMPTY_HINT = {
  G0: '还没有音频。在对话框里说「这首歌的音频收一下」，我把 mp3 入库。',
  G1: '还没有测量档案。在对话框里说「分析这首歌」，我跑一次测量。',
  G2: '还没有逐字轴。在对话框里说「打开打轴页」，我帮你起。',
  G3: '还没有分镜稿。在对话框里说「写分镜」，我把口述落成分镜表。',
  'G3.5': '资产清单还没入库（0 件）。清单出来之后让 AI 存一次就有了。',
  G4: '还没有装配稿。资产与分镜齐了才能拼 story。',
  G5: '还没有成片。G4 装配完成后在对话框里说「渲一版」，我调引擎出 mp4。',
};
