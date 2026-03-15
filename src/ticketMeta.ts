import type { TicketMeta } from './types';
import { DEFAULT_META } from './types';
import { parseSimpleYaml, dumpTicketMetaYaml } from './yaml';

const BLOCK_REGEX = /^```ticket-meta\s*\n([\s\S]*?)\n```/m;

function metaFromObject(o: Record<string, unknown> | null): TicketMeta | null {
  if (!o || typeof o !== 'object') return null;
  const progress = o.progress;
  const numProgress = typeof progress === 'number' ? progress : Number(progress);
  return {
    status: String(o.status ?? DEFAULT_META.status),
    project: String(o.project ?? DEFAULT_META.project ?? ''),
    assignee: String(o.assignee ?? DEFAULT_META.assignee),
    startDate: String(o.startDate ?? DEFAULT_META.startDate),
    dueDate: String(o.dueDate ?? DEFAULT_META.dueDate),
    progress: Number.isFinite(numProgress) ? numProgress : DEFAULT_META.progress,
  };
}

export function parseTicketMeta(body: string | undefined): TicketMeta | null {
  if (!body) return null;
  const m = body.match(BLOCK_REGEX);
  if (!m) return null;
  const raw = m[1].trim();
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    return metaFromObject(o);
  } catch {
    const o = parseSimpleYaml(raw);
    return metaFromObject(o);
  }
}

export function serializeTicketMeta(meta: TicketMeta): string {
  return dumpTicketMetaYaml(meta as unknown as Record<string, unknown>);
}

export function setTicketMetaInBody(body: string, meta: TicketMeta): string {
  const block = '```ticket-meta\n' + serializeTicketMeta(meta) + '\n```';
  if (BLOCK_REGEX.test(body)) {
    return body.replace(BLOCK_REGEX, block);
  }
  return block + '\n\n' + body.trim();
}

export function bodyWithoutMetaBlock(body: string): string {
  return body.replace(BLOCK_REGEX, '').trim();
}
