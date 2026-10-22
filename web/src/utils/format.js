/** 显示层格式化。数字一律等宽、不带多余小数。 */
import dayjs from 'dayjs';

export const EMPTY = '—';

export const text = (value) => (value == null || value === '' ? EMPTY : String(value));

export const int = (value) => (value == null ? EMPTY : Number(value).toLocaleString('zh-CN'));

export const decimal = (value, digits = 3) => {
  if (value == null) return EMPTY;
  return Number(value).toFixed(digits).replace(/\.?0+$/, '');
};

export const money = (value) => `¥${Number(value ?? 0) === 0 ? '0' : Number(value).toFixed(2)}`;

export const fileSize = (bytes) => {
  if (bytes == null) return EMPTY;
  if (bytes > 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes > 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};

/** 秒 → mm:ss.SS */
export const timecode = (seconds) => {
  if (seconds == null) return EMPTY;
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
};

export const datetime = (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : EMPTY);

export const shortDate = (value) => (value ? dayjs(value).format('MM-DD HH:mm') : EMPTY);

export const duration = (seconds) => {
  const total = Math.max(0, Math.floor(seconds || 0));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
