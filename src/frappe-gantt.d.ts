declare module 'frappe-gantt' {
  interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    custom_class?: string;
  }

  interface GanttPopupContext {
    task: GanttTask & { _start?: Date; _end?: Date; actual_duration?: number; ignored_duration?: number };
    chart: unknown;
    set_title: (html: string) => void;
    set_subtitle: (html: string) => void;
    set_details: (html: string) => void;
    add_action: (label: string | (() => string), callback: () => void) => void;
  }

  interface GanttOptions {
    view_mode?: string;
    bar_height?: number;
    bar_corner_radius?: number;
    date_format?: string;
    language?: string;
    popup_on?: 'click' | 'hover';
    popup?: (ctx: GanttPopupContext) => void | false;
    scroll_to?: string;
  }

  export default class Gantt {
    constructor(wrapper: string | HTMLElement, tasks: GanttTask[], options?: GanttOptions);
  }
}
