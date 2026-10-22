/** Markdown 渲染交给 marked，不自己写解析器。 */
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: true });

export const renderMarkdown = (source) => marked.parse(String(source ?? ''));

/** 歌词轴 JSON 解析（docs.kind='lyrics' 的 doc 是一段 JSON 文本） */
export function parseLyrics(docs = []) {
  const doc = docs.find((item) => item.kind === 'lyrics');
  if (!doc) return null;
  try {
    const parsed = JSON.parse(doc.doc);
    return Array.isArray(parsed.lyrics) ? parsed : null;
  } catch {
    return null;
  }
}

export const lyricsStats = (lyrics) => {
  if (!lyrics) return { lines: 0, words: 0, lastEnd: null };
  const lines = lyrics.lyrics.length;
  const words = lyrics.lyrics.reduce((sum, line) => sum + (line.words?.length ?? line.text.length), 0);
  const lastEnd = lyrics.lyrics.at(-1)?.end ?? null;
  return { lines, words, lastEnd };
};
