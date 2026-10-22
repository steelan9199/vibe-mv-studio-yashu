/**
 * probe.mjs — 探活：给一个地址，问它是不是已经有人应答。
 * 用于启动前判断「8791 上是不是已经跑着一个工作室」，避免重复起服务直接崩。
 */
export async function probe(url, timeoutMs = 800) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    return res.ok;
  } catch {
    return false;
  }
}
