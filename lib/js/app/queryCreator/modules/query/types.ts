import {
  SET_QUERY,
  SELECT_EVENT_COLLECTION,
  SELECT_ANALYSIS,
  SELECT_TARGET_PROPERTY,
  SET_PERCENTILE,
  SET_TIMEFRAME,
  SET_GROUP_BY,
  SET_ORDER_BY,
  SET_LIMIT,
  SELECT_TIMEZONE,
  ADD_FUNNEL_STEP,
  REMOVE_FUNNEL_STEP,
  UPDATE_FUNNEL_STEP,
  UPDATE_FUNNEL_STEP_EVENT_COLLECTION,
  CHANGE_FUNNEL_STEPS_ORDER,
} from './constants';

import { Timezones, Timeframe, OrderBy, FunnelStep } from '../../types';
import { Analysis } from '../../../types';

export type ReducerState = {
  eventCollection?: string;
  targetProperty?: string;
  percentile?: number;
  timezone?: number | Timezones;
  groupBy?: string | string[];
  orderBy?: string | OrderBy | OrderBy[];
  limit?: number;
  timeframe: Timeframe;
  analysisType: Analysis;
  steps: FunnelStep[];
};

export interface SetQuery {
  type: typeof SET_QUERY;
  payload: {
    query: Partial<ReducerState>;
  };
}

export interface SelectEventCollectionAction {
  type: typeof SELECT_EVENT_COLLECTION;
  payload: {
    name: string;
  };
}

export interface SelectAnalysisAction {
  type: typeof SELECT_ANALYSIS;
  payload: {
    analysis: Analysis;
  };
}

export interface SelectTargetPropertyAction {
  type: typeof SELECT_TARGET_PROPERTY;
  payload: {
    property: string;
  };
}

export interface SelectTimezoneAction {
  type: typeof SELECT_TIMEZONE;
  payload: {
    timezone: number | Timezones;
  };
}

export interface SetPercentileAction {
  type: typeof SET_PERCENTILE;
  payload: {
    percentile: number;
  };
}

export interface SetTimeframeAction {
  type: typeof SET_TIMEFRAME;
  payload: {
    timeframe: Timeframe;
  };
}

export interface SetGroupByAction {
  type: typeof SET_GROUP_BY;
  payload: {
    groupBy: string | string[] | undefined;
  };
}

export interface SetOrderByAction {
  type: typeof SET_ORDER_BY;
  payload: {
    orderBy: OrderBy[] | undefined;
  };
}

export interface SetLimitAction {
  type: typeof SET_LIMIT;
  payload: {
    limit: number | undefined;
  };
}

export interface AddFunnelStepAction {
  type: typeof ADD_FUNNEL_STEP;
}

export interface RemoveFunnelStepAction {
  type: typeof REMOVE_FUNNEL_STEP;
  payload: {
    index: number;
  };
}

export interface UpdateFunnelStepAction {
  type: typeof UPDATE_FUNNEL_STEP;
  payload: {
    index: number;
    properties: Partial<FunnelStep>;
  };
}

export interface UpdateFunnelStepEventCollectionAction {
  type: typeof UPDATE_FUNNEL_STEP_EVENT_COLLECTION;
  payload: {
    name: string;
  };
}

export interface ChangeFunnelStepsOrderAction {
  type: typeof CHANGE_FUNNEL_STEPS_ORDER;
  payload: {
    index: number;
    updatedIndex: number;
  };
}

export type QueryActions =
  | SetQuery
  | SelectEventCollectionAction
  | SelectAnalysisAction
  | SelectTargetPropertyAction
  | SetPercentileAction
  | SetGroupByAction
  | SetOrderByAction
  | SetLimitAction
  | SetTimeframeAction
  | SelectTimezoneAction
  | AddFunnelStepAction
  | UpdateFunnelStepAction
  | RemoveFunnelStepAction
  | UpdateFunnelStepEventCollectionAction
  | ChangeFunnelStepsOrderAction;
