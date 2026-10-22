/** 唯一 fetch 出口：统一拼前缀、统一抛错。 */
const PREFIX = '/api';

const parseError = async (response) => {
  try {
    const body = await response.json();
    return body.error ?? `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

async function request(path, options = {}) {
  const response = await fetch(PREFIX + path, { headers: { Accept: 'application/json' }, ...options });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export const http = {
  get: (path) => request(path),
  post: (path) => request(path, { method: 'POST' }),
};

export const withQuery = (path, params = {}) => {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null && value !== ''),
  ).toString();
  return search ? `${path}?${search}` : path;
};
