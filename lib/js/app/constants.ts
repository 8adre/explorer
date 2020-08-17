/* eslint-disable @typescript-eslint/camelcase */

export const NEW_QUERY_EVENT = '@explorer/new-query';
export const SHOW_TOAST_NOTIFICATION_EVENT =
  '@explorer/show-toast-notification';

export const NOTIFICATION_MANAGER_CONTEXT = 'notificationManager';
export const KEEN_CLIENT_CONTEXT = 'keenClient';

import { Analysis } from './types';

export const CACHE_AVAILABLE: Analysis[] = [
  'sum',
  'average',
  'count',
  'count_unique',
  'maximum',
  'minimum',
  'median',
  'percentile',
  'standard_deviation',
  'funnel',
  'select_unique',
];

export const ERRORS = {
  OVER_LIMIT_ERROR: 'OverCachedQueryLimitError',
  TOO_MANY_QUERIES: 'TooManyCachedQueriesInTheCurrentBillingPeriod',
};

export const EXTRACTION_PREVIEW_EVENTS_DEFAULT = 100;
export const EXTRACTION_PREVIEW_EVENTS_LIMIT = 100000;
export const EXTRACTION_BULK_EVENTS_DEFAULT = 1000;
export const EXTRACTION_BULK_EVENTS_LIMIT = 10000000;
