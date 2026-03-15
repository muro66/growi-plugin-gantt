import React from 'react';
import type { Ticket } from '../types';
import { buildPageUrl } from '../api';
import { TICKET_STATUSES } from '../types';
import './TicketCards.css';

interface TicketCardsProps {
  tickets: Ticket[];
  onMetaChange: (path: string, meta: Ticket['meta']) => void;
  ticketsPath: string;
}

function groupByProject(tickets: Ticket[]): { project: string; tickets: Ticket[] }[] {
  const map = new Map<string, Ticket[]>();
  for (const t of tickets) {
    const p = (t.meta.project || '').trim() || '(未設定)';
    if (!map.has(p)) map.set(p, []);
    map.get(p)!.push(t);
  }
  return Array.from(map.entries()).map(([project, list]) => ({ project, tickets: list }));
}

export default function TicketCards({ tickets, onMetaChange, ticketsPath }: TicketCardsProps) {
  const groups = React.useMemo(() => groupByProject(tickets), [tickets]);
  const [expandedProject, setExpandedProject] = React.useState<string | null>(null);
  const [draggedPath, setDraggedPath] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<{ project: string } | null>(null);

  const handleStatusChange = (path: string, meta: Ticket['meta'], newStatus: string) => {
    onMetaChange(path, { ...meta, status: newStatus });
  };

  const handleDragStart = (e: React.DragEvent, path: string) => {
    setDraggedPath(path);
    e.dataTransfer.setData('text/plain', path);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedPath(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, project: string) => {
    e.preventDefault();
    if (draggedPath) setDropTarget({ project });
  };

  const handleDragLeave = () => setDropTarget(null);

  const handleDrop = (e: React.DragEvent, targetProject: string) => {
    e.preventDefault();
    setDropTarget(null);
    const path = e.dataTransfer.getData('text/plain');
    if (!path) return;
    const t = tickets.find((x) => x.path === path);
    if (!t) return;
    const resolved = targetProject === '(未設定)' ? '' : targetProject;
    if ((t.meta.project || '').trim() === resolved) return;
    onMetaChange(path, { ...t.meta, project: resolved });
    setDraggedPath(null);
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
        <span className="grw-gantt-ticket-hint">※ カードをドラッグして別の Project に移動できます</span>
      </div>
      {tickets.length === 0 ? (
        <p className="grw-gantt-empty">チケットがありません。</p>
      ) : (
        <div className="grw-gantt-cards-grid">
          {groups.map(({ project, tickets: list }) => (
            <div
              key={project}
              className={`grw-gantt-cards-group ${expandedProject === project ? 'is-expanded' : ''} ${dropTarget?.project === project ? 'is-drop-target' : ''}`}
              onMouseEnter={() => setExpandedProject(project)}
              onMouseLeave={() => setExpandedProject(null)}
              onDragOver={(e) => handleDragOver(e, project)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, project)}
            >
              <div className="grw-gantt-cards-group-label">{project}</div>
              <div className="grw-gantt-cards-stack">
                {list.map((t, i) => (
                  <div
                    key={t.path}
                    className={`grw-gantt-card ${draggedPath === t.path ? 'is-dragging' : ''}`}
                    style={{ '--stack-i': i } as React.CSSProperties}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t.path)}
                    onDragEnd={handleDragEnd}
                  >
                    <a
                      href={buildPageUrl(t.path, t.pageId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grw-gantt-card-title"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t.title || t.path}
                    </a>
                    <div className="grw-gantt-card-meta">
                      <select
                        value={t.meta.status}
                        onChange={(e) => handleStatusChange(t.path, t.meta, e.target.value)}
                        className="grw-gantt-select grw-gantt-card-select"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {TICKET_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <span>{t.meta.assignee || '–'}</span>
                      <span>{t.meta.startDate || '–'} ～ {t.meta.dueDate || '–'}</span>
                      <span>{t.meta.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
