/**
 * media.route.mjs — /media/<kind>/<id>
 * id 必须是库里的整数主键；路径先查库，再拼文件库根，最后校验前缀。
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';
import { config } from '../config.mjs';
import { locate } from '../repositories/media.repo.mjs';
import { respondWithFile } from '../http/binary.mjs';

export const mediaRoute = new Hono();

mediaRoute.get('/:kind/:id', (c) => {
  const { kind, id } = c.req.param();
  if (!/^\d+$/.test(id)) return c.text('id 必须是库里的整数主键', 400);

  const located = locate(kind, Number(id));
  if (!located) return c.text('记录不存在', 404);

  const file = path.resolve(config.libRoot, located.slug, located.rel);
  const inside = file === config.libRoot || file.startsWith(config.libRoot + path.sep);
  if (!inside) return c.text('forbidden', 403);
  if (!existsSync(file)) return c.text(`文件不在盘上：${located.rel}`, 404);

  return respondWithFile(c, file);
});
