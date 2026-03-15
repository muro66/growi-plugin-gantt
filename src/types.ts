export interface TicketMeta {
  status: string;
  project?: string;
  assignee: string;
  startDate: string;
  dueDate: string;
  progress: number;
}

export interface Ticket {
  id: string;
  path: string;
  title: string;
  meta: TicketMeta;
  body?: string;
  pageId?: string;
  revisionId?: string;
}

export interface GrowiPage {
  id: string;
  path: string;
  title?: string;
  body?: string;
  revision?: { id?: string; body?: string };
}

export interface PagesListResponse {
  pages: GrowiPage[];
  totalCount?: number;
}

export const TICKET_STATUSES = ['New', 'In Progress', 'Done'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const DEFAULT_META: TicketMeta = {
  status: 'New',
  project: '',
  assignee: '',
  startDate: '',
  dueDate: '',
  progress: 0,
};
