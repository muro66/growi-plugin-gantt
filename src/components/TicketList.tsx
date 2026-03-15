import type { Ticket } from '../types';
import { buildPageUrl } from '../api';
import { TICKET_STATUSES } from '../types';
import TicketCards from './TicketCards';
import './TicketList.css';

interface TicketListProps {
  tickets: Ticket[];
  onMetaChange: (path: string, meta: Ticket['meta']) => void;
  ticketsPath: string;
  listViewMode?: 'table' | 'cards';
}

export default function TicketList({ tickets, onMetaChange, ticketsPath, listViewMode = 'table' }: TicketListProps) {
  const handleStatusChange = (path: string, meta: Ticket['meta'], newStatus: string) => {
    onMetaChange(path, { ...meta, status: newStatus });
  };

  return (
    <div className="grw-gantt-ticket-list">
      <div className="grw-gantt-ticket-actions">
        <a
          href={buildPageUrl(ticketsPath + '/new')}
          target="_blank"
          rel="noopener noreferrer"
          className="grw-gantt-btn grw-gantt-btn-primary"
        >
          ＋ 新規チケット
        </a>
        <span className="grw-gantt-ticket-hint">※ リンク先でページを作成し、本文に ticket-meta ブロックを追加すると一覧に表示されます</span>
      </div>
      {tickets.length === 0 ? (
        <p className="grw-gantt-empty">チケットがありません。上記リンクから /tickets 配下にページを作成してください。</p>
      ) : listViewMode === 'cards' ? (
        <TicketCards tickets={tickets} onMetaChange={onMetaChange} ticketsPath={ticketsPath} />
      ) : (
        <table className="grw-gantt-table">
          <thead>
            <tr>
              <th>タイトル</th>
              <th>Project</th>
              <th>状態</th>
              <th>担当</th>
              <th>開始日</th>
              <th>期日</th>
              <th>進捗</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.path}>
                <td>
                  <a href={buildPageUrl(t.path, t.pageId)} target="_blank" rel="noopener noreferrer">
                    {t.title || t.path}
                  </a>
                </td>
                <td>{t.meta.project || '–'}</td>
                <td>
                  <select
                    value={t.meta.status}
                    onChange={(e) => handleStatusChange(t.path, t.meta, e.target.value)}
                    className="grw-gantt-select"
                  >
                    {TICKET_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>{t.meta.assignee || '–'}</td>
                <td>{t.meta.startDate || '–'}</td>
                <td>{t.meta.dueDate || '–'}</td>
                <td>{t.meta.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

