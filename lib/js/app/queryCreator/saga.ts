/* eslint-disable @typescript-eslint/camelcase */

import {
  all,
  select,
  takeLatest,
  getContext,
  call,
  put,
} from 'redux-saga/effects';
import { v4 as uuid } from 'uuid';
import moment from 'moment-timezone';

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
  SELECT_TIMEZONE,
  SELECT_EVENT_COLLECTION,
  SELECT_FUNNEL_STEP_EVENT_COLLECTION,
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

import { inferFilterType, createAbstractOperator } from './utils';

import { Filter, OrderBy } from './types';
import { SetGroupByAction } from './modules/query/types';

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
      api_key: client.config.masterKey,
    });
    const { properties } = yield fetch(url).then((response) => response.json());
    collectionSchema = { schema: properties };
  }

  const { schema } = collectionSchema;
  const filtersWithInferredTypes = filters.map((filter) => ({
    ...filter,
    id: uuid(),
    operator: createAbstractOperator(filter),
    propertyType: inferFilterType(filter, schema),
  }));

  yield put(setFilters(filtersWithInferredTypes));
}

const transformOrderBy = (orderBy: string | OrderBy | OrderBy[]) => {
  if (typeof orderBy === 'string')
    return [{ id: uuid(), propertyName: orderBy, direction: 'ASC' }];
  if (Array.isArray(orderBy)) {
    return orderBy.map((item) => ({
      id: uuid(),
      ...item,
    }));
  }

  return [
    {
      id: uuid(),
      ...(orderBy as OrderBy),
    },
  ];
};
function* serializeQuery(action: SetQueryAction) {
  const {
    payload: { query },
  } = action;
  const schemas = yield select(getSchemas);

  const { filters, ...rest } = query;
  yield put(setQuery(rest));

  if (query.eventCollection && !schemas[query.eventCollection]) {
    yield put(fetchCollectionSchema(query.eventCollection));
  }

  if (query.steps) {
    const { steps } = query;
    const schemasToFetch = steps.filter(
      ({ eventCollection }) => !schemas[eventCollection]
    );

    yield all(
      schemasToFetch.map(({ eventCollection }) =>
        put(fetchCollectionSchema(eventCollection))
      )
    );
  }

  if (filters) {
    yield call(transformFilters, query.eventCollection, filters);
  }

  if (query.orderBy) {
    const transformedOrderBy = yield transformOrderBy(query.orderBy);
    yield put(setOrderBy(transformedOrderBy));
  }
}

function* updateGroupBy(action: SetGroupByAction) {
  const {
    payload: { groupBy },
  } = action;
  const orderBy = yield select(getOrderBy);

  let orderBySettings;
  if (groupBy && orderBy && groupBy.length && Object.keys(orderBy).length) {
    orderBySettings = orderBy.filter(
      (item: OrderBy) =>
        groupBy.includes(item.propertyName) || item.propertyName === 'result'
    );
  }

  yield put(setOrderBy(orderBySettings));
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
}

export default function* rootSaga() {
  yield all([watcher()]);
}
