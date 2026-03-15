/**
 * Minimal YAML parse for ticket-meta (key: value lines).
 * Supports: key: value, key: "quoted", key: 'quoted'
 */
export function parseSimpleYaml(text: string): Record<string, unknown> | null {
  const out: Record<string, unknown> = {};
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx <= 0) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    let val = trimmed.slice(colonIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1).replace(/\\"/g, '"');
    }
    if (key) out[key] = val;
  }
  return Object.keys(out).length ? out : null;
}

/** Serialize meta to YAML string for ticket-meta block */
export function dumpTicketMetaYaml(meta: Record<string, unknown>): string {
  const keys = ['status', 'project', 'assignee', 'startDate', 'dueDate', 'progress'];
  const lines = keys.map((k) => {
    const v = meta[k];
    const s = v === undefined || v === null ? '' : String(v);
    return `${k}: ${s.indexOf(':') >= 0 || s.includes('\n') ? JSON.stringify(s) : s}`;
  });
  return lines.join('\n');
}
