/* eslint-disable @typescript-eslint/camelcase */

import {
  all,
  select,
  takeLatest,
  getContext,
  fork,
  put,
} from 'redux-saga/effects';
import moment from 'moment-timezone';
import { v4 as uuid } from 'uuid';

import {
  fetchProjectDetails,
  fetchProjectDetailsSuccess,
  fetchProjectDetailsError,
  APP_START,
  FETCH_PROJECT_DETAILS,
} from './modules/app';

import {
  getOrderBy,
  getTimeframe,
  setTimeframe,
  getFunnelSteps,
  changeFunnelStepsOrder,
  updateFunnelStep,
  setGroupBy,
  setOrderBy,
  setFilters,
  setQuery,
  SetQueryAction,
  SelectTimezoneAction,
  SelectEventCollectionAction,
  SelectFunnelStepEventCollectionAction,
  SET_GROUP_BY,
  SERIALIZE_QUERY,
  UpdateFunnelStepTimezoneAction,
  SELECT_TIMEZONE,
  SELECT_EVENT_COLLECTION,
  SELECT_FUNNEL_STEP_EVENT_COLLECTION,
  UPDATE_FUNNEL_STEP_TIMEZONE,
} from './modules/query';

import {
  FetchCollectionSchemaAction,
  fetchCollectionSchema,
  fetchCollectionSchemaSuccess,
  fetchCollectionSchemaError,
  setEventsCollections,
  setCollectionSchemaLoading,
  getSchemas,
  FETCH_COLLECTION_SCHEMA_SUCCESS,
  FETCH_COLLECTION_SCHEMA,
} from './modules/events';

import { serializeOrderBy, serializeFilters } from './serializers';

import { Filter, OrderBy } from './types';
import { SetGroupByAction } from './modules/query/types';

import { createAbstractOperator } from './utils';

function* appStart() {
  yield put(fetchProjectDetails());
}

function* fetchProject() {
  const client = yield getContext('keenClient');

  try {
    const url = client.url('/3.0/projects/{projectId}', {
      api_key: client.config.masterKey,
    });
    const { events } = yield fetch(url).then((response) => response.json());
    const collections = events.map(({ name }) => name);

    yield put(fetchProjectDetailsSuccess());
    yield put(setEventsCollections(collections));
  } catch (err) {
    yield put(fetchProjectDetailsError(err));
  }
}

function* fetchSchema(action: FetchCollectionSchemaAction) {
  const collection = action.payload.collection;
  const client = yield getContext('keenClient');

  yield put(setCollectionSchemaLoading(collection, true));

  try {
    const url = client.url(`/3.0/projects/{projectId}/events/${collection}`, {
      api_key: client.config.masterKey,
    });
    const { properties } = yield fetch(url).then((response) => response.json());

    yield put(fetchCollectionSchemaSuccess(collection, properties));
  } catch (err) {
    yield put(fetchCollectionSchemaError(err));
  } finally {
    yield put(setCollectionSchemaLoading(collection, false));
  }
}

function* selectCollection(action: SelectEventCollectionAction) {
  const collection = action.payload.name;
  if (collection) {
    const schemas = yield select(getSchemas);
    const isSchemaExist = schemas[collection];

    if (!isSchemaExist) {
      yield put(fetchCollectionSchema(collection));
    }
  }

  yield put(setGroupBy(undefined));
  yield put(setOrderBy(undefined));
  yield put(setFilters([]));
}

function* selectFunnelStepCollection(
  action: SelectFunnelStepEventCollectionAction
) {
  const collection = action.payload.name;
  const schemas = yield select(getSchemas);
  const isSchemaExist = schemas[collection];

  if (!isSchemaExist) yield put(fetchCollectionSchema(collection));
}

function* selectTimezone(action: SelectTimezoneAction) {
  const { timezone } = action.payload;
  const timeframe = yield select(getTimeframe);

  if (typeof timeframe !== 'string') {
    const { start, end } = timeframe;
    const timeWithZone = {
      start: moment(start).tz(timezone).format(),
      end: moment(end).tz(timezone).format(),
    };
    yield put(setTimeframe(timeWithZone));
  }
}

function* storeEventSchemas() {
  const schemas = yield select(getSchemas);
  window.__QUERY_CREATOR_SCHEMAS__ = schemas;
}

function* transformFilters(collection: string, filters: Filter[]) {
  const schemas = yield select(getSchemas);
  let collectionSchema = schemas[collection];

  if (!collectionSchema) {
    const client = yield getContext('keenClient');
    const url = client.url(`/3.0/projects/{projectId}/events/${collection}`, {
      api_key: client.config.readKey,
    });
    const { properties } = yield fetch(url).then((response) => response.json());
    collectionSchema = { schema: properties };
  }

  const { schema } = collectionSchema;

  const filtersSettings = serializeFilters(filters, schema);
  yield put(setFilters(filtersSettings));
}

function* transformOrderBy(orderBy: string | OrderBy | OrderBy[]) {
  const orderBySettings = serializeOrderBy(orderBy);
  yield put(setOrderBy(orderBySettings));
}

function* serializeQuery(action: SetQueryAction) {
  const {
    payload: { query },
  } = action;
  const schemas = yield select(getSchemas);

  const { filters, orderBy, ...rest } = query;
  yield put(setQuery(rest));

  if (query.eventCollection && !schemas[query.eventCollection]) {
    yield put(fetchCollectionSchema(query.eventCollection));
  }

  if (query.steps) {
    const steps = query.steps.map((step) => ({
      ...step,
      id: uuid(),
      filters: step.filters.map((filter) => ({
        ...filter,
        operator: createAbstractOperator(filter),
      })),
    }));

    const schemasToFetch = steps.filter(
      ({ eventCollection }) => !schemas[eventCollection]
    );
    yield put(changeFunnelStepsOrder(steps));

    yield all(
      schemasToFetch.map(({ eventCollection }) =>
        put(fetchCollectionSchema(eventCollection))
      )
    );
  }

  if (filters) {
    yield fork(transformFilters, query.eventCollection, filters);
  }

  if (orderBy) {
    yield fork(transformOrderBy, orderBy);
  }
}

function* updateGroupBy(action: SetGroupByAction) {
  const {
    payload: { groupBy },
  } = action;
  const orderBy = yield select(getOrderBy);

  let orderBySettings: OrderBy[];
  if (groupBy && orderBy && groupBy.length && Object.keys(orderBy).length) {
    orderBySettings = orderBy.filter(
      ({ propertyName }: OrderBy) =>
        groupBy.includes(propertyName) || propertyName === 'result'
    );
  }

  yield put(setOrderBy(orderBySettings));
}

function* updateFunnelStepTimezone(action: UpdateFunnelStepTimezoneAction) {
  const { timezone } = action.payload;
  const steps = yield select(getFunnelSteps);
  const timeframe = steps.filter((step) => step.id === action.payload.stepId)
    .timeframe;

  if (typeof timeframe !== 'string') {
    const { start, end } = timeframe;
    const timeWithZone = {
      start: moment(start).tz(timezone).format(),
      end: moment(end).tz(timezone).format(),
    };
    yield put(
      updateFunnelStep(action.payload.stepId, {
        timeframe: timeWithZone,
      })
    );
  }
}

function* watcher() {
  yield takeLatest(APP_START, appStart);
  yield takeLatest(SERIALIZE_QUERY, serializeQuery);
  yield takeLatest(FETCH_PROJECT_DETAILS, fetchProject);
  yield takeLatest(FETCH_COLLECTION_SCHEMA, fetchSchema);
  yield takeLatest(SELECT_TIMEZONE, selectTimezone);
  yield takeLatest(SELECT_EVENT_COLLECTION, selectCollection);
  yield takeLatest(FETCH_COLLECTION_SCHEMA_SUCCESS, storeEventSchemas);
  yield takeLatest(
    SELECT_FUNNEL_STEP_EVENT_COLLECTION,
    selectFunnelStepCollection
  );
  yield takeLatest(SET_GROUP_BY, updateGroupBy);
  yield takeLatest(UPDATE_FUNNEL_STEP_TIMEZONE, updateFunnelStepTimezone);
}

export default function* rootSaga() {
  yield all([watcher()]);
}
