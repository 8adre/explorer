import { ReducerState } from './types';

import {
  RUN_QUERY,
  RUN_QUERY_ERROR,
  RUN_QUERY_SUCCESS,
  GET_SAVED_QUERIES_SUCCESS,
} from './constants';

export const initialState: ReducerState = {
  results: null,
  isLoading: false,
  isSavingQuery: false,
  saved: [],
  isLimited: false,
  error: null,
};

export const queriesReducer = (
  state: ReducerState = initialState,
  action: any
) => {
  switch (action.type) {
    case 'CLIENT_SAVE_QUERY':
      return {
        ...state,
        isSavingQuery: true,
      };

    case 'CLIENT_SAVE_QUERY_SUCCESS':
      return {
        ...state,
        isSavingQuery: false,
        results: initialState.results,
      };

    case 'CLIENT_SAVE_QUERY_ERROR':
      return {
        ...state,
        isSavingQuery: false,
        results: initialState.results,
      };

    case 'CLIENT_DELETE_QUERY_SUCCESS':
      return {
        ...state,
        saved: state.saved.filter(
          (item) => item.query_name !== action.payload.name
        ),
      };

    case 'UPDATE_ACTIVE_SAVED_QUERY':
      return {
        ...state,
        activeSavedQuery: action.payload,
      };

    case 'RESET_UI':
      return {
        ...state,
        results: initialState.results,
      };
    case 'QUERY_RESET_RESULTS':
      return {
        ...state,
        results: initialState.results,
      };

    case 'ABOVE_CACHE_QUERY_LIMIT':
      return {
        ...state,
        isLimited: true,
        isSavingQuery: false,
      };

    case 'BELOW_CACHE_QUERY_LIMIT':
      return {
        ...state,
        isLimited: false,
        isSavingQuery: false,
      };

    case GET_SAVED_QUERIES_SUCCESS:
      return {
        ...state,
        saved: action.payload.queries,
      };
    case RUN_QUERY: {
      return {
        ...state,
        error: null,
        isLoading: true,
      };
    }
    case RUN_QUERY_ERROR: {
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };
    }
    case RUN_QUERY_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        results: action.payload.results,
      };
    }
    default:
      return state;
  }
};
