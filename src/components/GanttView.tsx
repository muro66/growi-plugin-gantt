import React from 'react';
import Gantt from 'frappe-gantt';
// frappe-gantt の exports に CSS パスがないため相対パスで読み込む
import '../../node_modules/frappe-gantt/dist/frappe-gantt.css';
import type { Ticket } from '../types';
import { buildPageUrl } from '../api';
import './GanttView.css';

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
}

interface GanttViewProps {
  tickets: Ticket[];
  chartDateFrom?: string;
  barColor?: string;
  viewMode?: 'Day' | 'Week' | 'Month';
}

export default function GanttView({ tickets, chartDateFrom, barColor = '#4fc3f7', viewMode = 'Week' }: GanttViewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const ganttRef = React.useRef<InstanceType<typeof Gantt> | null>(null);

  React.useEffect(() => {
    if (wrapperRef.current) wrapperRef.current.style.setProperty('--grw-gantt-bar-fill', barColor);
  }, [barColor]);

  const tasks: GanttTask[] = React.useMemo(() => {
    return tickets
      .filter((t) => t.meta.startDate && t.meta.dueDate && t.meta.startDate <= t.meta.dueDate)
      .map((t) => ({
        id: t.path,
        name: t.title || t.path.split('/').pop() || '',
        start: t.meta.startDate,
        end: t.meta.dueDate,
        progress: t.meta.progress || 0,
      }));
  }, [tickets]);

  React.useEffect(() => {
    if (!containerRef.current || tasks.length === 0) return;
    const el = containerRef.current;
    el.innerHTML = '';
    try {
      ganttRef.current = new Gantt('#grw-gantt-chart', tasks, {
        view_mode: viewMode,
        bar_height: 24,
        bar_corner_radius: 3,
        date_format: 'YYYY-MM-DD',
        language: 'ja',
        popup_on: 'click',
        scroll_to: chartDateFrom || 'today',
        popup: (ctx) => {
          ctx.set_title(ctx.task.name);
          ctx.set_subtitle(`${ctx.task.start} ～ ${ctx.task.end}`);
          ctx.set_details(`進捗: ${ctx.task.progress}%`);
          ctx.add_action('ページを開く', () => {
            const ticket = tickets.find((x) => x.path === ctx.task.id);
            window.open(buildPageUrl(ctx.task.id, ticket?.pageId), '_blank');
          });
        },
      });
    } catch (e) {
      el.innerHTML = '<p class="grw-gantt-error">ガントの描画に失敗しました。</p>';
    }
    return () => {
      ganttRef.current = null;
    };
  }, [tasks, chartDateFrom, viewMode]);

  if (tasks.length === 0) {
    return (
      <div className="grw-gantt-view">
        <p className="grw-gantt-empty">
          開始日・期日が両方設定されているチケットがありません。チケット一覧でメタを編集するか、ページ本文の ticket-meta ブロックに startDate / dueDate を追加してください。
        </p>
      </div>
    );
  }

  return (
    <div className="grw-gantt-view grw-gantt-view-custom-color" ref={wrapperRef}>
      <div id="grw-gantt-chart" ref={containerRef} />
    </div>
  );
}
