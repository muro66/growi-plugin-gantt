import type { TicketMeta } from './types';
import { DEFAULT_META } from './types';

const BLOCK_REGEX = /^```ticket-meta\s*\n([\s\S]*?)\n```/m;

export function parseTicketMeta(body: string | undefined): TicketMeta | null {
  if (!body) return null;
  const m = body.match(BLOCK_REGEX);
  if (!m) return null;
  try {
    const o = JSON.parse(m[1].trim()) as Partial<TicketMeta>;
    return {
      status: o.status ?? DEFAULT_META.status,
      project: o.project ?? DEFAULT_META.project,
      assignee: o.assignee ?? DEFAULT_META.assignee,
      startDate: o.startDate ?? DEFAULT_META.startDate,
      dueDate: o.dueDate ?? DEFAULT_META.dueDate,
      progress: typeof o.progress === 'number' ? o.progress : DEFAULT_META.progress,
    };
  } catch {
    return null;
  }
}

export function serializeTicketMeta(meta: TicketMeta): string {
  return JSON.stringify(meta, null, 0);
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
