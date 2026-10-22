/**
 * stages.service.mjs — 把关卡从稀疏行补成七格轨，并算出"当前关"。
 * 纯函数，不碰数据库。
 */
import { GATES, GATE_NAME } from '../domain/gates.mjs';

export function toRail(stageRows = []) {
  const byGate = new Map(stageRows.map((row) => [row.gate, row]));
  return GATES.map((gate) => ({
    gate,
    name: GATE_NAME[gate],
    status: byGate.get(gate)?.status ?? 'todo',
    note: byGate.get(gate)?.note ?? '',
    started_at: byGate.get(gate)?.started_at ?? null,
    finished_at: byGate.get(gate)?.finished_at ?? null,
  }));
}

export const currentOf = (rail) => rail.find((stage) => stage.status !== 'done') ?? null;

export const isAllDone = (rail) => rail.every((stage) => stage.status === 'done');
