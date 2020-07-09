import React from 'react';
import { Provider } from 'react-redux';
import { render as rtlRender, fireEvent, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import QuerySettings from './QuerySettings';
import text from './text.json';

const render = (storeState: any = {}, overProps: any = {}) => {
  const mockStore = configureStore([]);
  const state = {
    queries: {
      isLimited: false,
      isSaving: false,
    },
    savedQuery: {
      name: '',
      displayName: '',
      cached: false,
      refreshRate: 0,
      exists: false,
    },
    ...storeState,
  };

  const store = mockStore({ ...state });

  const props = {
    onSave: jest.fn(),
    onDelete: jest.fn(),
    cacheAvailable: true,
    ...overProps,
  };

  const wrapper = rtlRender(
    <Provider store={store}>
      <QuerySettings {...props} />
    </Provider>
  );

  return {
    store,
    props,
    wrapper,
  };
};

test('allows user to save query', () => {
  const savedQuery = {
    name: 'query',
    displayName: 'Query',
    cached: false,
    refreshRate: 0,
    exists: false,
  };
  const {
    wrapper: { container },
    props,
  } = render({ savedQuery });
  const input = container.querySelector('input[type="text"]');
  const button = screen.getByText('Save');

  fireEvent.change(input, { target: { value: 'Query' } });
  fireEvent.click(button);

  const { name, refreshRate } = savedQuery;

  expect(props.onSave).toHaveBeenCalledWith(name, refreshRate);
});

test('allows user to delete query', () => {
  const savedQuery = {
    name: 'query',
    displayName: 'Query',
    cached: false,
    refreshRate: 0,
    exists: true,
  };
  const { props } = render({ savedQuery });

  const button = screen.getByText('Delete');
  fireEvent.click(button);

  const { name } = savedQuery;

  expect(props.onDelete).toHaveBeenCalledWith(name);
});

test('reset cache settings', () => {
  const savedQuery = {
    name: 'query',
    displayName: 'Query',
    cached: false,
    refreshRate: 0,
    exists: true,
  };
  const { store } = render({ savedQuery }, { cacheAvailable: false });

  expect(store.getActions()).toMatchInlineSnapshot(`
    Array [
      Object {
        "payload": Object {
          "cached": false,
          "refreshRate": 0,
        },
        "type": "@saved-query/UPDATE_SAVED_QUERY",
      },
    ]
  `);
});

test('shows message about not available cache', () => {
  const savedQuery = {
    name: 'query',
    displayName: 'Query',
    cached: false,
    refreshRate: 0,
    exists: true,
  };

  render({ savedQuery }, { cacheAvailable: false });
  const notification = screen.getByText(text.cachingNotAvailable);

  expect(notification).toBeInTheDocument();
});

test('allows user to clone query', () => {
  const savedQuery = {
    name: 'query',
    displayName: 'Query',
    cached: false,
    refreshRate: 0,
    exists: true,
  };
  const { store } = render({ savedQuery });

  const button = screen.getByText('Clone');
  fireEvent.click(button);

  expect(store.getActions()).toMatchInlineSnapshot(`
    Array [
      Object {
        "type": "@saved-query/RESET_SAVED_QUERY",
      },
    ]
  `);
});

test('allows user to update save query name', () => {
  const {
    wrapper: { container },
    store,
  } = render();
  const input = container.querySelector('input[type="text"]');
  const button = screen.getByText('Save');

  fireEvent.change(input, { target: { value: 'Query' } });
  fireEvent.click(button);

  expect(store.getActions()).toMatchInlineSnapshot(`
    Array [
      Object {
        "payload": Object {
          "displayName": "Query",
          "exists": false,
          "name": "query",
        },
        "type": "@saved-query/UPDATE_SAVED_QUERY",
      },
    ]
  `);
});

test('shows query resource name', () => {
  const savedQuery = {
    name: 'query-name',
    displayName: 'Query',
    cached: false,
    refreshRate: 0,
    exists: false,
  };

  render({ savedQuery });
  const { name } = savedQuery;

  expect(screen.getByText(name)).toBeInTheDocument();
});
