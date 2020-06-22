import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, Store, Unsubscribe } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { getPubSub, PubSub } from '@keen.io/pubsub';
import KeenAnalysis from 'keen-analysis';

import App from './App';
import rootSaga from './saga';
import rootReducer from './reducer';

import { appStart } from './modules/app';
import { getQuery, setQuery } from './modules/query';
import { transformToQuery } from './utils/transformToQuery';
import { serializeQuery } from './utils/serializeQuery';

import { SET_QUERY_EVENT } from './constants';

type Props = {
  /** Keen project identifer */
  projectId: string;
  /** Keen read access key */
  readKey: string;
  /** Keen master access key */
  masterKey: string;
  /** Update query event handler */
  onUpdateQuery?: (query: Object) => void;
};

class QueryCreator extends React.Component<Props> {
  /** Query Creator store */
  store: Store;

  pubsub: PubSub;

  setQuerySubscription: () => void;

  storeSubscription: Unsubscribe;

  constructor(props: Props) {
    super(props);

    const keenClient = new KeenAnalysis({
      projectId: this.props.projectId,
      masterKey: this.props.masterKey,
      readKey: this.props.readKey,
    });

    const sagaMiddleware = createSagaMiddleware({
      context: {
        keenClient,
      },
    });
    this.store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

    sagaMiddleware.run(rootSaga);
    this.store.dispatch(appStart());

    this.pubsub = getPubSub();

    this.runQueryListener();
    this.subscribeSetQuery();
  }

  componentWillUnmount() {
    if (this.storeSubscription) this.storeSubscription();
    if (this.setQuerySubscription) this.setQuerySubscription();
  }

  runQueryListener = () => {
    const { onUpdateQuery } = this.props;
    this.storeSubscription = this.store.subscribe(() => {
      const state = this.store.getState();
      const query = getQuery(state);
      if (onUpdateQuery) onUpdateQuery(transformToQuery(query));
    });
  };

  subscribeSetQuery = () => {
    this.setQuerySubscription = this.pubsub.subscribe(
      (eventName: string, meta: any) => {
        switch (eventName) {
          case SET_QUERY_EVENT:
            const { query } = meta;
            const serializedQuery = serializeQuery(query);
            this.store.dispatch(setQuery(serializedQuery));
            break;
          default:
            break;
        }
      }
    );
  };

  render() {
    return (
      <Provider store={this.store}>
        <App />
      </Provider>
    );
  }
}

export default QueryCreator;
