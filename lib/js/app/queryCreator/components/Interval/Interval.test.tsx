import React from 'react';
import { Provider } from 'react-redux';
import { render as rtlRender } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import Interval from './Interval';

const render = (storeState: any = {}) => {
  const mockStore = configureStore([]);
  const store = mockStore({ ...storeState });

  const wrapper = rtlRender(
    <Provider store={store}>
      <Interval />
    </Provider>
  );

  return {
    store,
    wrapper,
  };
};

test('reset interval settings', () => {
  const {
    wrapper: { unmount },
    store,
  } = render({
    query: {
      interval: 'every_10_years',
    },
  });
  unmount();

  expect(store.getActions()).toMatchInlineSnapshot(`
    Array [
      Object {
        "payload": Object {
          "interval": undefined,
        },
        "type": "@query-creator/SET_INTERVAL",
      },
    ]
  `);
});
