import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { ToastProvider } from '@keen.io/toast-notifications';
import { getPubSub, PubSub } from '@keen.io/pubsub';

import KeenAnalysis from 'keen-analysis';

import rootReducer from './rootReducer';
import rootSaga from './rootSaga';

import App from './components/App';
import { AppContext } from './contexts';

import { NotificationManager } from './modules/notifications';
import { appStart } from './modules/app';

import { Options } from './types';

import { SHOW_TOAST_NOTIFICATION_EVENT } from './constants';

export class KeenExplorer {
  constructor(props: Options) {
    const { keenAnalysis, upgradeSubscriptionUrl, modalContainer } = props;
    const keenAnalysisClient =
      keenAnalysis.instance || new KeenAnalysis(keenAnalysis.config);

    const notificationPubSub = new PubSub();
    const sagaMiddleware = createSagaMiddleware({
      context: {
        keenClient: keenAnalysisClient,
        pubsub: getPubSub(),
        notificationManager: new NotificationManager({
          pubsub: notificationPubSub,
          eventName: SHOW_TOAST_NOTIFICATION_EVENT,
        }),
      },
    });
    const composeEnhancers = composeWithDevTools({});
    const store = createStore(
      rootReducer,
      composeEnhancers(applyMiddleware(sagaMiddleware))
    );

    sagaMiddleware.run(rootSaga);

    const initialView = props.initialView || 'browser';
    store.dispatch(appStart(initialView));

    ReactDOM.render(
      <Provider store={store}>
        <AppContext.Provider
          value={{
            keenAnalysis: keenAnalysisClient,
            modalContainer,
            upgradeSubscriptionUrl,
            notificationPubSub,
          }}
        >
          <ToastProvider>
            <App />
          </ToastProvider>
        </AppContext.Provider>
      </Provider>,
      document.querySelector(props.container)
    );
  }
}

export default KeenExplorer;
