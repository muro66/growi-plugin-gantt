import type { GrowiPage, PagesListResponse } from './types';

const BASE = typeof window !== 'undefined' ? window.location.origin : '';

export async function fetchPagesUnderPath(path: string): Promise<PagesListResponse> {
  const normalized = path.replace(/^\//, '') || '';
  const query = new URLSearchParams({ path: '/' + normalized });
  const res = await fetch(`${BASE}/_api/v3/pages/list?${query}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return { pages: data.pages ?? [], totalCount: data.totalCount };
}

export function getCurrentPath(): string {
  if (typeof window === 'undefined') return '/';
  const el = document.querySelector('[data-page-path]') as HTMLElement | null;
  if (el?.dataset?.pagePath) return el.dataset.pagePath;
  const meta = document.querySelector('meta[property="growi:path"]') as HTMLMetaElement | null;
  if (meta?.content) return meta.content;
  const m = window.location.pathname.match(/^\/page\/(.+)$/);
  if (m) return '/' + m[1].split('/').map((s) => decodeURIComponent(s)).join('/');
  return '/';
}

export function buildPageUrl(path: string): string {
  if (typeof window === 'undefined') return '';
  const segments = path.split('/').filter((s) => s !== undefined);
  const encoded = segments.map((s) => encodeURIComponent(s)).join('/');
  return `${window.location.origin}/page/${encoded}`;
}

export async function fetchPageByPath(path: string): Promise<GrowiPage | null> {
  const normalized = path.replace(/^\//, '') || '';
  const query = new URLSearchParams({ path: '/' + normalized });
  const res = await fetch(`${BASE}/_api/v3/page?${query}`, { credentials: 'include' });
  if (!res.ok) return null;
  const data = await res.json();
  const page = data.page ?? data;
  return page ?? null;
}

export async function updatePageBody(pageId: string, revisionId: string, body: string): Promise<boolean> {
  const res = await fetch(`${BASE}/_api/v3/pages/${pageId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ revisionId, body }),
  });
  return res.ok;
}
