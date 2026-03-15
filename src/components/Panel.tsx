import React from 'react';
import TicketList from './TicketList';
import GanttView from './GanttView';
import type { Ticket } from '../types';
import type { TicketMeta } from '../types';
import { TICKET_STATUSES } from '../types';
import { fetchPagesUnderPath, fetchPageByPath, updatePageBody } from '../api';
import { parseTicketMeta, setTicketMetaInBody } from '../ticketMeta';
import './Panel.css';

const DEFAULT_TICKETS_PATH = '/tickets';
const BAR_COLOR_PRESETS: { value: string; label: string }[] = [
  { value: '#4fc3f7', label: '水色' },
  { value: '#81c784', label: '緑' },
  { value: '#ffb74d', label: 'オレンジ' },
  { value: '#e57373', label: '赤' },
  { value: '#ba68c8', label: '紫' },
];

type TabId = 'tickets' | 'gantt';

export default function Panel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = React.useState<TabId>('tickets');
  const [ticketsPath] = React.useState(DEFAULT_TICKETS_PATH);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<string>('');
  const [filterProject, setFilterProject] = React.useState('');
  const [filterAssignee, setFilterAssignee] = React.useState('');
  const [filterDateFrom, setFilterDateFrom] = React.useState('');
  const [filterDateTo, setFilterDateTo] = React.useState('');
  const [chartDateFrom, setChartDateFrom] = React.useState('');
  const [chartDateTo, setChartDateTo] = React.useState('');
  const [barColor, setBarColor] = React.useState(BAR_COLOR_PRESETS[0].value);
  const [viewMode, setViewMode] = React.useState<'Day' | 'Week' | 'Month'>('Week');
  const [listViewMode, setListViewMode] = React.useState<'table' | 'cards'>('table');

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
          meta: meta ?? { status: 'New', project: '', assignee: '', startDate: '', dueDate: '', progress: 0 },
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

  const filteredTickets = React.useMemo(() => {
    return tickets.filter((t) => {
      if (filterStatus && t.meta.status !== filterStatus) return false;
      if (filterProject && !(t.meta.project || '').toLowerCase().includes(filterProject.toLowerCase())) return false;
      if (filterAssignee && !(t.meta.assignee || '').toLowerCase().includes(filterAssignee.toLowerCase())) return false;
      if (filterDateFrom && (t.meta.startDate || '') < filterDateFrom) return false;
      if (filterDateTo && (t.meta.dueDate || '') > filterDateTo) return false;
      return true;
    });
  }, [tickets, filterStatus, filterProject, filterAssignee, filterDateFrom, filterDateTo]);

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
        <div className="grw-gantt-filters">
          <span className="grw-gantt-filter-label">状態</span>
          <select
            className="grw-gantt-select grw-gantt-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">すべて</option>
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="grw-gantt-filter-label">Project</span>
          <input
            type="text"
            className="grw-gantt-filter-input"
            placeholder="プロジェクト名で絞り込み"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          />
          <span className="grw-gantt-filter-label">担当</span>
          <input
            type="text"
            className="grw-gantt-filter-input"
            placeholder="絞り込み"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          />
          <span className="grw-gantt-filter-label">開始日～</span>
          <input
            type="date"
            className="grw-gantt-filter-input"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
          <span className="grw-gantt-filter-label">～期日</span>
          <input
            type="date"
            className="grw-gantt-filter-input"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
          {tab === 'gantt' && (
            <>
              <span className="grw-gantt-filter-label">ビュー</span>
              <div className="grw-gantt-view-zoom">
                <button
                  type="button"
                  className="grw-gantt-btn grw-gantt-btn-sm grw-gantt-zoom-btn"
                  onClick={() => setViewMode((m) => (m === 'Month' ? 'Week' : 'Day'))}
                  title="ズームイン（細かく）"
                  aria-label="ズームイン"
                >
                  ＋
                </button>
                <select
                  className="grw-gantt-select grw-gantt-filter-select"
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'Day' | 'Week' | 'Month')}
                >
                  <option value="Day">日</option>
                  <option value="Week">週</option>
                  <option value="Month">月</option>
                </select>
                <button
                  type="button"
                  className="grw-gantt-btn grw-gantt-btn-sm grw-gantt-zoom-btn"
                  onClick={() => setViewMode((m) => (m === 'Day' ? 'Week' : 'Month'))}
                  title="ズームアウト（長期表示）"
                  aria-label="ズームアウト"
                >
                  −
                </button>
              </div>
              <span className="grw-gantt-filter-label">チャート範囲</span>
              <input
                type="date"
                className="grw-gantt-filter-input"
                value={chartDateFrom}
                onChange={(e) => setChartDateFrom(e.target.value)}
                title="表示開始日"
              />
              <span>～</span>
              <input
                type="date"
                className="grw-gantt-filter-input"
                value={chartDateTo}
                onChange={(e) => setChartDateTo(e.target.value)}
                title="表示終了日"
              />
              <span className="grw-gantt-filter-label">バー色</span>
              <select
                className="grw-gantt-select grw-gantt-filter-select"
                value={barColor}
                onChange={(e) => setBarColor(e.target.value)}
              >
                {BAR_COLOR_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </>
          )}
        </div>
        {loading && <div className="grw-gantt-loading">読み込み中...</div>}
        {error && <div className="grw-gantt-error">{error}</div>}
        {!loading && !error && tab === 'tickets' && (
          <>
            <div className="grw-gantt-list-view-toggle">
              <span className="grw-gantt-filter-label">表示</span>
              <button
                type="button"
                className={'grw-gantt-btn grw-gantt-btn-sm' + (listViewMode === 'table' ? ' is-active' : '')}
                onClick={() => setListViewMode('table')}
              >
                表
              </button>
              <button
                type="button"
                className={'grw-gantt-btn grw-gantt-btn-sm' + (listViewMode === 'cards' ? ' is-active' : '')}
                onClick={() => setListViewMode('cards')}
              >
                カード
              </button>
            </div>
            <TicketList
              tickets={filteredTickets}
              onMetaChange={handleMetaChange}
              ticketsPath={ticketsPath}
              listViewMode={listViewMode}
            />
          </>
        )}
        {!loading && !error && tab === 'gantt' && (
          <GanttView
            tickets={filteredTickets}
            chartDateFrom={chartDateFrom || undefined}
            barColor={barColor}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
}
