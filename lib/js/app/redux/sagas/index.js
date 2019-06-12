import {
  all,
  put,
  takeLatest,
} from 'redux-saga/effects';

import {
  client,
} from '../../app';

function* fetchProject() {
  try {
    const url = client.url('/3.0/projects/{projectId}',
      { api_key: client.config.masterKey }
    );
    const responseBody = yield fetch(url)
      .then(response => response.json());
    yield put({
      type: 'CLIENT_FETCH_PROJECT_SUCCESS',
      payload: responseBody,
    });
  } catch (e) {
    yield put({
      type: 'CLIENT_FETCH_PROJECT_ERROR',
      payload: e,
    });
  }
}

function* fetchSchema({ payload }) {
  if (!payload.eventCollection) {
    return;
  }
  try {
    const url = client.url(`/3.0/projects/{projectId}/events/${payload.eventCollection}`,
      { api_key: client.config.masterKey }
    );
    const responseBody = yield fetch(url)
      .then(response => response.json());
    yield put({
      type: 'CLIENT_FETCH_SCHEMA_SUCCESS',
      eventCollection: payload.eventCollection,
      payload: responseBody,
    });
  } catch (e) {
    yield put({
      type: 'CLIENT_FETCH_SCHEMA_ERROR',
      payload: e,
    });
  }
}

function* fetchRecentEvents({ payload }) {
  try {
    const responseBody = yield client.query({
      analysisType: 'extraction',
      eventCollection: payload.eventCollection,
      latest: 10,
    });
    yield put({
      type: 'CLIENT_FETCH_RECENT_EVENTS_SUCCESS',
      eventCollection: payload.eventCollection,
      payload: responseBody,
    });
  } catch (e) {
    yield put({
      type: 'CLIENT_FETCH_RECENT_EVENTS_ERROR',
      payload: e,
    });
  }
}

function* query({ payload }) {
  try {
    const responseBody = yield client.query(payload);
    yield put({
      type: 'CLIENT_RUN_QUERY_SUCCESS',
      payload: responseBody,
    });
  } catch (e) {
    yield put({
      type: 'CLIENT_RUN_QUERY_ERROR',
      payload: e,
    });
  }
}

function* saveQuery({ payload }) {
  try {
    const { name, body } = payload;
    const responseBody = yield client
      .put(client.url('queries', 'saved', name))
      .auth(client.masterKey())
      .send(body);
    /*
      .put({
        url: client.url('queries', 'saved', name),
        api_key: client.config.masterKey,
        params: {
          query: queryParams,
          metadata: {
            displayName,
            visualization: {
              chartType,
            },
          },
          refreshRate: refreshRate * 60 * 60,
        },
      })
      */
    yield put({
      type: 'CLIENT_SAVE_QUERY_SUCCESS',
      payload: responseBody,
    });
  } catch (e) {
    yield put({
      type: 'CLIENT_SAVE_QUERY_ERROR',
      payload: e,
    });
  }
}

function* deleteQuery({ payload }) {
  try {
    const { name } = payload;
    yield client
      .del(client.url('queries', 'saved', name))
      .auth(client.masterKey())
      .send();
    yield put({
      type: 'RESET_SAVED_QUERY_UI',
    });
    yield put({
      type: 'CLIENT_DELETE_QUERY_SUCCESS',
      payload,
    });
  } catch (e) {
    yield put({
      type: 'CLIENT_RUN_QUERY_ERROR',
      payload: e,
    });
  }
}

function* fetchSavedQueries() {
  try {
    const responseBody = yield client
      .get(client.url('queries', 'saved'))
      .auth(client.masterKey())
      .send();
    yield put({
      type: 'CLIENT_FETCH_SAVED_QUERIES_SUCCESS',
      payload: responseBody,
    });
  } catch (e) {
    yield put({
      type: 'CLIENT_SAVE_QUERY_ERROR',
      payload: e,
    });
  }
}

export function* watchFetchProject() {
  yield takeLatest('CLIENT_FETCH_PROJECT', fetchProject);
  yield takeLatest('CLIENT_FETCH_SCHEMA', fetchSchema);
  yield takeLatest('CHANGE_EVENT_COLLECTION', fetchSchema);
  yield takeLatest('CLIENT_FETCH_RECENT_EVENTS', fetchRecentEvents);
  yield takeLatest('CLIENT_RUN_QUERY', query);
  yield takeLatest('CLIENT_SAVE_QUERY', saveQuery);
  yield takeLatest('CLIENT_DELETE_QUERY', deleteQuery);
  yield takeLatest([
    'CLIENT_FETCH_SAVED_QUERIES',
    'CLIENT_SAVE_QUERY_SUCCESS',
    'CLIENT_DELETE_SAVED_QUERY_SUCCESS',
  ], fetchSavedQueries);
}

export default function* rootSaga() {
  yield all([
    watchFetchProject(),
  ]);
}
