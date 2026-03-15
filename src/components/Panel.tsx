import React from 'react';
import TicketList from './TicketList';
import GanttView from './GanttView';
import type { Ticket } from '../types';
import type { TicketMeta } from '../types';
import { fetchPagesUnderPath, fetchPageByPath, updatePageBody } from '../api';
import { parseTicketMeta, setTicketMetaInBody } from '../ticketMeta';
import './Panel.css';

const DEFAULT_TICKETS_PATH = '/tickets';

type TabId = 'tickets' | 'gantt';

export default function Panel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = React.useState<TabId>('tickets');
  const [ticketsPath] = React.useState(DEFAULT_TICKETS_PATH);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadTickets = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPagesUnderPath(ticketsPath);
      const pages = res.pages || [];
      const list: Ticket[] = [];
      for (const p of pages) {
        const path = p.path || '';
        if (path === ticketsPath) continue;
        const full = await fetchPageByPath(path);
        const body = full?.revision?.body ?? full?.body ?? '';
        const meta = parseTicketMeta(body);
        list.push({
          id: path,
          path,
          title: full?.title ?? p.title ?? path.split('/').pop() ?? '',
          meta: meta ?? { status: 'New', assignee: '', startDate: '', dueDate: '', progress: 0 },
          body: body,
          pageId: full?.id,
          revisionId: full?.revision?.id,
        });
      }
      setTickets(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [ticketsPath]);

  React.useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleMetaChange = React.useCallback(
    async (path: string, meta: TicketMeta) => {
      const t = tickets.find((x) => x.path === path);
      if (!t?.body || !t.pageId || !t.revisionId) return;
      const newBody = setTicketMetaInBody(t.body, meta);
      const ok = await updatePageBody(t.pageId, t.revisionId, newBody);
      if (ok) {
        setTickets((prev) =>
          prev.map((x) => (x.path === path ? { ...x, meta, body: newBody } : x))
        );
      }
    },
    [tickets]
  );

  return (
    <div className="grw-gantt-panel" role="dialog" aria-label="チケット・ガント">
      <header className="grw-gantt-panel-header">
        <div className="grw-gantt-panel-tabs">
          <button
            type="button"
            className={'grw-gantt-tab' + (tab === 'tickets' ? ' is-active' : '')}
            onClick={() => setTab('tickets')}
          >
            🎫 チケット
          </button>
          <button
            type="button"
            className={'grw-gantt-tab' + (tab === 'gantt' ? ' is-active' : '')}
            onClick={() => setTab('gantt')}
          >
            📊 ガント
          </button>
        </div>
        <div className="grw-gantt-panel-actions">
          <button type="button" className="grw-gantt-btn" onClick={onClose}>
            閉じる
          </button>
        </div>
      </header>
      <div className="grw-gantt-panel-body">
        {loading && <div className="grw-gantt-loading">読み込み中...</div>}
        {error && <div className="grw-gantt-error">{error}</div>}
        {!loading && !error && tab === 'tickets' && (
          <TicketList
            tickets={tickets}
            onMetaChange={handleMetaChange}
            ticketsPath={ticketsPath}
          />
        )}
        {!loading && !error && tab === 'gantt' && <GanttView tickets={tickets} />}
      </div>
    </div>
  );
}
