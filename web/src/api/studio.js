/** 后端接口清单，视图层只认这里的函数名。 */
import { http, withQuery } from './client.js';

export const fetchDashboard = () => http.get('/songs');

export const fetchSong = (slug) => http.get(`/song/${encodeURIComponent(slug)}`);

export const fetchAssets = (filters = {}) => http.get(withQuery('/assets', filters));

export const fetchSkills = () => http.get('/skills');

export const fetchRuns = (slug) => http.get(withQuery('/runs', { song: slug }));

export const fetchCosts = () => http.get('/costs');

export const reindex = () => http.post('/reindex');

/** 二进制字节流仍走后端中转：路径必须先由库查出来 */
export const mediaUrl = (kind, id) => (id == null ? '' : `/media/${kind}/${id}`);
