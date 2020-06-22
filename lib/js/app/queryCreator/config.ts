import { QueryCreatorConfig } from './types';

export const FIELDS_CONFIG: QueryCreatorConfig = {
  analysisType: ['*'],
  eventCollection: [
    'sum',
    'average',
    'count',
    'count_unique',
    'maximum',
    'minimum',
    'median',
    'percentile',
    'standard_deviation',
    'extraction',
    'select_unique',
  ],
  targetProperty: [
    'average',
    'count_unique',
    'maximum',
    'median',
    'minimum',
    'percentile',
    'select_unique',
    'standard_deviation',
    'sum',
  ],
  percentile: ['percentile'],
  timeframe: [
    'sum',
    'average',
    'count',
    'count_unique',
    'maximum',
    'minimum',
    'median',
    'percentile',
    'standard_deviation',
    'extraction',
    'select_unique',
  ],
  timezone: [
    'sum',
    'average',
    'count',
    'count_unique',
    'maximum',
    'minimum',
    'median',
    'percentile',
    'standard_deviation',
    'extraction',
    'select_unique',
  ],
  steps: ['funnel'],
  groupBy: [
    'sum',
    'average',
    'count',
    'count_unique',
    'maximum',
    'minimum',
    'median',
    'percentile',
    'standard_deviation',
    'select_unique',
  ],
  orderBy: [
    'sum',
    'average',
    'count',
    'count_unique',
    'maximum',
    'minimum',
    'median',
    'percentile',
    'standard_deviation',
    'select_unique',
  ],
  limit: [
    'sum',
    'average',
    'count',
    'count_unique',
    'maximum',
    'minimum',
    'median',
    'percentile',
    'standard_deviation',
    'select_unique',
  ],
  propertyNames: [
    'extraction',
  ],
};
