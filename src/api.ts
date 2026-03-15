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

/**
 * GROWI の URL 構造（v5 以降）:
 * - パーマリンク（ID形式）: https://example.com/:pageId （推奨・ページ名変更に不変）
 * - パス形式: https://example.com/:path （パスで開く場合）
 * @see https://docs.growi.org/ja/guide/features/copy_to_clipboard.html
 */
export function getCurrentPath(): string {
  if (typeof window === 'undefined') return '/';
  const el = document.querySelector('[data-page-path]') as HTMLElement | null;
  if (el?.dataset?.pagePath) return el.dataset.pagePath;
  const meta = document.querySelector('meta[property="growi:path"]') as HTMLMetaElement | null;
  if (meta?.content) return meta.content;
  // パス形式: /page/Path/To/Page
  const m = window.location.pathname.match(/^\/page\/(.+)$/);
  if (m) return '/' + m[1].split('/').map((s) => decodeURIComponent(s)).join('/');
  // ID形式: /:pageId（24文字の16進など）の場合は data-page-path 等に依存
  return '/';
}

/**
 * ページを開く URL を組み立てる。
 * pageId があればパーマリンク（ID形式）を返し、なければパス形式の URL を返す。
 */
export function buildPageUrl(path: string, pageId?: string): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  // GROWI v5 以降: パーマリンクは /:pageId（推奨）
  if (pageId && /^[0-9a-f]{24}$/i.test(pageId)) {
    return `${origin}/${pageId}`;
  }
  // パス形式: /Path/To/Page（ID がない場合・新規リンク等）
  const segments = path.split('/').filter((s) => s !== undefined && s !== '');
  const encoded = segments.map((s) => encodeURIComponent(s)).join('/');
  return `${origin}/${encoded}`;
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
