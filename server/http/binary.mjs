/**
 * binary.mjs — 把磁盘上的文件按 HTTP Range 返回。
 * 路径安全（必须落在文件库根下）由调用方在拿到库里的 path 后校验。
 */
import { createReadStream, statSync } from 'node:fs';
import { Readable } from 'node:stream';
import path from 'node:path';
import rangeParser from 'range-parser';

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

export const mimeOf = (file) => MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream';

/** 支持断点续播：音频/视频拖动进度条必须走 206 */
export function respondWithFile(c, file) {
  const stat = statSync(file);
  const type = mimeOf(file);
  const header = c.req.header('range');
  const ranges = header ? rangeParser(stat.size, header) : -1;

  if (ranges === -1 || ranges === -2 || !ranges.length) {
    return new Response(Readable.toWeb(createReadStream(file)), {
      status: 200,
      headers: { 'Content-Type': type, 'Content-Length': String(stat.size), 'Accept-Ranges': 'bytes' },
    });
  }

  const { start, end } = ranges[0];
  return new Response(Readable.toWeb(createReadStream(file, { start, end })), {
    status: 206,
    headers: {
      'Content-Type': type,
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
    },
  });
}
