import { Widget } from '../types';
import { Widgets } from '../constants';

export const getAvailableWidgets = (query: Record<string, any>): Widget[] => {
  if (query) {
    if (query.analysis_type === 'extraction') {
      return [Widgets.table];
    }

    if (query.analysis_type === Widgets.funnel) {
      return [
        Widgets.bar,
        Widgets.area,
        Widgets.line,
        Widgets.funnel,
        Widgets.table,
      ];
    }

    if (query.group_by && !query.interval) {
      return [
        Widgets.bar,
        Widgets.pie,
        Widgets.donut,
        Widgets.heatmap,
        Widgets.choropleth,
        Widgets.table,
      ];
    }

    if (query.interval) {
      return [
        Widgets.bar,
        Widgets.line,
        Widgets.area,
        Widgets.heatmap,
        Widgets.table,
      ];
    }

    return [Widgets.gauge, Widgets.metric, Widgets.table];
  }
};