import { AppState } from '../types';

export const getSavedQueries = ({ queries }: AppState) => queries.saved;

export const getQueriesSaving = ({ queries }: AppState) =>
  queries.isSavingQuery;

export const getQueriesLimit = ({ queries }: AppState) => queries.isLimited;
