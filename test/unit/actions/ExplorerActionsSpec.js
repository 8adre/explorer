import moment from 'moment';
import _ from 'lodash';
import KeenAnalysis from 'keen-analysis';
import Qs from 'qs';
import XHRmock from 'xhr-mock';

import TestHelpers from '../../support/TestHelpers';
import AppDispatcher from '../../../lib/js/app/dispatcher/AppDispatcher';
import ExplorerActions from '../../../lib/js/app/actions/ExplorerActions';
import AppStateActions from '../../../lib/js/app/actions/AppStateActions';
import FilterUtils from '../../../lib/js/app/utils/FilterUtils';
import RunValidations from '../../../lib/js/app/utils/RunValidations';
import ExplorerValidations from '../../../lib/js/app/validations/ExplorerValidations';
import ExplorerUtils from '../../../lib/js/app/utils/ExplorerUtils';
import ChartTypeUtils from '../../../lib/js/app/utils/ChartTypeUtils';
import ExplorerStore from '../../../lib/js/app/stores/ExplorerStore';

describe('actions/ExplorerActions', () => {
  const analysisClient = new KeenAnalysis(TestHelpers.createClient());
  const mockDispatch = jest.fn();
  let getStub;
  let client;
  let runQueryStub;
  let spyDispatch;

  beforeAll(() => {
    XHRmock.setup();
    spyDispatch = jest.spyOn(AppDispatcher, 'dispatch');
  });

  afterAll(() => {
    spyDispatch.mockRestore();
  });

  beforeEach(() => {
//    XHRmock.setup();
    client = new KeenAnalysis(TestHelpers.createClient());
    spyDispatch.mockReset();
  });

  afterEach(() => {
  //  XHRmock.teardown();
  })

  describe('exec', () => {
    beforeAll(() => {
      getStub = jest.spyOn(ExplorerStore, 'get');
      runQueryStub = jest.spyOn(ExplorerUtils, 'runQuery');
    });

    afterAll(() => {
    //  ExplorerStore.get.restore();
    //  ExplorerUtils.runQuery.restore();
    });

    beforeEach(() => {
      runQueryStub.mockClear();
    });

    it('should throw an error if the model is currently loading', () => {
      const explorer = { id: 5, loading: true };
      ExplorerStore.set(explorer);
      expect(ExplorerActions.exec.bind(null, client, explorer.id)).toThrow("Warning: calling exec when model loading is true. Explorer id: 5");
    });

    it('should run the validations with the right arguments', () => {
      const explorer = TestHelpers.createExplorerModel();
      explorer.query.analysis_type = 'count';
      ExplorerStore.set(explorer);
      const spyValidate = jest.spyOn(ExplorerActions, 'validate');
      ExplorerActions.exec(client, explorer.id);
      expect(spyValidate).toHaveBeenCalledTimes(1);
      spyValidate.mockRestore();
    });

    it('should call the dispatcher to update the store and set loading to true', (done) => {
      XHRmock.post(
        new RegExp(analysisClient.url('projectId', 'queries')),
        (req, res) => {
          expect(spyDispatch).hasBeenCalledWith({
            actionType: 'EXPLORER_UPDATE',
            id: 5,
            updates: { loading: true }
          });
          done();
          return res.status(200).body('[]');
        }
      );
      const explorer = {
        id: 5,
        loading: false,
        query: {},
        isValid: true
      };
      ExplorerStore.set(explorer);
      ExplorerActions.exec(client, explorer.id);
    });
/*

    it('should add the latest attribute with a limit for extractions', () => {
      var explorer = {
        id: 5,
        loading: false,
        isValid: true,
        query: {
          event_collection: 'click',
          analysis_type: 'extraction'
        }
      };
      this.getStub.returns(explorer);
      ExplorerActions.exec(client, explorer.id);
      assert.strictEqual(
        this.runQueryStub.getCall(0).args[0].query.latest,
        100
      );
    });
    */
  });
/*
  describe('runEmailExtraction', () => {
    beforeEach(() => {
      this.validateStub = jest.spyOn(ExplorerActions, 'validate');
      this.runQueryStub = jest.spyOn(ExplorerUtils, 'runQuery');
      client = { run: jest.spyOn() };
      this.explorer = {
        isValid: false,
        errors: [{
          msg: 'invalid'
        }],
        query: {
          analysis_type: 'count',
          event_collection: 'click',
          email: 'contact@keen.io',
          latest: '100'
        }
      };
      this.getStub = jest.spyOn(ExplorerStore, 'get').returns(this.explorer);
    });

    afterEach(() => {
      ExplorerActions.validate.restore();
      ExplorerUtils.runQuery.restore();
      ExplorerStore.get.restore();
    });

    it('should run validations', () => {
      ExplorerActions.runEmailExtraction(client, this.explorer.id);
      assert.isTrue(this.validateStub.calledOnce);
    });
    it('should NOT run the query if validaton fails', () => {
      this.validateStub.returns([{ msg: 'invalid' }]);
      ExplorerActions.runEmailExtraction(client, this.explorer.id);
      assert.isFalse(this.runQueryStub.called);
    });
  });

  describe('fetchAllPersisted', () => {
    beforeEach(() => {
      this.models = [
        {
          id: '1',
          name: 'favorite 1',
          query: {
            event_collection: 'clicks',
            analysis_type: 'count',
            time: {
              relativity: 'this',
              amount: 1,
              sub_timeframe: 'weeks'
            }
          },
          refresh_rate: 0,
          metadata: {
            visualization: {
              chart_type: 'metric'
            }
          }
        },
        {
          id: '2',
          name: 'favorite 2',
          refresh_rate: 0,
          query: {
            event_collection: 'clicks',
            analysis_type: 'sum',
            target_property: 'size',
            time: {
              relativity: 'this',
              amount: 1,
              sub_timeframe: 'weeks'
            }
          },
          metadata: {
            visualization: {
              chart_type: 'metric'
            }
          }
        },
        {
          id: '3',
          name: 'favorite 3',
          refresh_rate: 0,
          query: {
            event_collection: 'clicks',
            analysis_type: 'max',
            target_property: 'amount',
            time: {
              relativity: 'this',
              amount: 1,
              sub_timeframe: 'weeks'
            }
          },
          metadata: {
            visualization: {
              chart_type: 'metric'
            }
          }
        }
      ];
      function getFn(id, callback) {
        callback(null, this.models);
      }
      this.persistence = {
        get: getFn.bind(this)
      };
      this.callback = jest.spyOn();
    });

    it('should format the params for each model', () => {
      var spy = sinon.spy(ExplorerUtils, 'formatQueryParams');
      ExplorerActions.fetchAllPersisted(this.persistence, this.callback);
      assert.strictEqual(spy.getCalls().length, 3);
      ExplorerUtils.formatQueryParams.restore();
    });
    it('should run validations for each model', () => {
      var stub = jest.spyOn(RunValidations, 'run').returns([]);
      ExplorerActions.fetchAllPersisted(this.persistence, this.callback);
      assert.strictEqual(stub.getCalls().length, 3);
      RunValidations.run.restore();
    });
    it('should include invalid models', () => {
      this.models[2].query = {};
      var stub = jest.spyOn(ExplorerActions, 'createBatch');
      ExplorerActions.fetchAllPersisted(this.persistence, this.callback);
      assert.strictEqual(stub.getCall(0).args[0].length, 3);
      ExplorerActions.createBatch.restore();
    });
    it('should log a warning for invalid models', () => {
      this.models[2].query = {};
      var stub = jest.spyOn(window.console, 'warn');
      ExplorerActions.fetchAllPersisted(this.persistence, this.callback);
      assert.strictEqual(stub.getCall(0).args[0], 'A persisted explorer model is invalid: ');
      assert.deepPropertyVal(stub.getCall(0).args[1], 'id', '3');
      window.console.warn.restore();
    });
    it('should call update app state when done and set fetchingPersistedExplorers to false', () => {
      var stub = jest.spyOn(AppStateActions, 'update');
      ExplorerActions.fetchAllPersisted(this.persistence, this.callback);
      assert.isTrue(stub.calledWith({ fetchingPersistedExplorers: false }));
      AppStateActions.update.restore();
    });
  });

  describe('execError', () => {
    beforeEach(() => {
      var explorer = { id: 5 };
      ExplorerActions.execError(explorer, { message: 'NOPE' });
    });

    it('should call the dispatcher to update with the right argments', () => {
      assert.isTrue(this.dispatchStub.calledWith({
        actionType: 'EXPLORER_UPDATE',
        id: 5,
        updates: { loading: false }
      }));
    });
    it('should create a notice with the error message', () => {
      assert.isTrue(this.dispatchStub.calledWith({
        actionType: 'NOTICE_CREATE',
        attrs: {
          text: 'NOPE',
          type: 'error'
        }
      }));
    });
  });

  describe('execSuccess', () => {
    beforeEach(() => {
      this.explorer = {
        id: 5,
        query: {
          analysis_type: 'count'
        },
        metadata: {
          visualization: {
            chart_type: null
          }
        }
      };
      this.response = { result: 100 };
      jest.spyOn(ChartTypeUtils, 'getChartTypeOptions').returns(['metric']);
      this.responseSupportsChartTypeStub = jest.spyOn(ChartTypeUtils, 'responseSupportsChartType').returns(false);
    });
    afterEach(() => {
      ChartTypeUtils.getChartTypeOptions.restore();
      ChartTypeUtils.responseSupportsChartType.restore();
    });

    it('should call the dispatcher to update with the right arguments', () => {
      let expectedUpdates = {
        loading: false,
        response: this.response,
        metadata: _.cloneDeep(this.explorer.metadata)
      };
      expectedUpdates.metadata.visualization.chart_type = 'metric';

      ExplorerActions.execSuccess(this.explorer, this.response);

      assert.strictEqual(this.dispatchStub.getCall(2).args[0].actionType, 'EXPLORER_UPDATE');
      assert.strictEqual(this.dispatchStub.getCall(2).args[0].id, 5);

      // We need to check the dataTimestamp separately because we cannot get Date.now()'s to match
      // as they will be off by a few milliseconds.
      assert.deepEqual(_.omit(this.dispatchStub.getCall(2).args[0].updates, 'dataTimestamp'), expectedUpdates);

      let actualTimestamp = this.dispatchStub.getCall(2).args[0].updates.dataTimestamp;
      actualTimestamp = actualTimestamp.toString().substring(0, actualTimestamp.length-5);

      let expectedTimestamp = Date.now();
      expectedTimestamp = expectedTimestamp.toString().substring(0, expectedTimestamp.length-5);

      assert.strictEqual(actualTimestamp, expectedTimestamp);
    });
    it('should clear all notices', () => {
      ExplorerActions.execSuccess(this.explorer, this.response);
      assert.isTrue(this.dispatchStub.calledWith({
        actionType: 'NOTICE_CLEAR_ALL'
      }));
    });
    it('should add a query object on the response if one is not there', () => {
      ExplorerActions.execSuccess(this.explorer, this.response);
      assert.deepPropertyVal(this.dispatchStub.getCall(2).args[0].updates.response, 'query');
      assert.deepEqual(this.dispatchStub.getCall(2).args[0].updates.response.query, { analysis_type: 'count', timezone: 'UTC' });
    });
    it('should not add a query object on the response if one is not there', () => {
      ExplorerActions.execSuccess(this.explorer, _.assign({}, this.response, { query: { analysis_type: 'not_count' } }));
      assert.deepPropertyVal(this.dispatchStub.getCall(2).args[0].updates.response, 'query');
      assert.deepEqual(this.dispatchStub.getCall(2).args[0].updates.response.query, { analysis_type: 'not_count' });
    });
    it('should call ExplorerUtils.responseSupportsChartType with the right arguments', () => {
      var response = _.assign({}, this.response, { query: { analysis_type: 'not_count' } });
      ExplorerActions.execSuccess(this.explorer, response);
      assert.isTrue(this.responseSupportsChartTypeStub.calledWith(response.query, this.explorer.metadata.visualization.chart_type));
    });
  });

  describe('async functions', () => {
    beforeAll(() => {
      this.getStub = jest.spyOn(ExplorerStore, 'get')
    });
    afterAll(() => {
      ExplorerStore.get.restore();
    });

    describe('save with unpersisted explorer', () => {
      beforeEach(() => {
        this.persistence = {
          create: function(model, callback) {
            callback(null, _.assign({}, ExplorerUtils.formatQueryParams(ExplorerUtils.toJSON(model)), { query_name: 'abc123' }));
          }
        };
        this.explorer = TestHelpers.createExplorerModel();
        this.explorer.id = 'TEMP-ABC';
        this.explorer.query_name = 'some name';
        this.explorer.query.event_collection = 'clicks';
        this.explorer.query.analysis_type = 'count';
        this.getStub.returns(this.explorer);
        jest.spyOn(ExplorerUtils, 'mergeResponseWithExplorer').returns({ testKey: 'some updates' });
      });

      afterEach(() => {
        ExplorerUtils.mergeResponseWithExplorer.restore();
      });

      it('should dispatch an EXPLORER_SAVING event', () => {
        ExplorerActions.save(this.persistence, 'TEMP-ABC');
        assert.isTrue(this.dispatchStub.calledWith({
          actionType: 'EXPLORER_SAVING',
          id: 'TEMP-ABC',
          saveType: 'save'
        }));
      });
      it('should dispatch to update the right model with params from mergeResponseWithExplorer if successful', () => {
        ExplorerActions.save(this.persistence, 'TEMP-ABC');
        assert.isTrue(this.dispatchStub.calledWith({
          actionType: 'EXPLORER_UPDATE',
          id: 'TEMP-ABC',
          updates: { testKey: 'some updates' }
        }));
      });
      it('should dispatch a fail event if there is a failure', () => {
        var errorResp = { text: 'an error' };
        this.persistence.create = function(model, callback) {
          callback(errorResp);
        };
        ExplorerActions.save(this.persistence, 'TEMP-ABC');
        assert.isTrue(this.dispatchStub.calledWith({
          actionType: 'EXPLORER_SAVE_FAIL',
          saveType: 'save',
          id: 'TEMP-ABC',
          errorResp: errorResp,
          query: this.explorer.query
        }));
      });
      it('should set the "saving" property back to false if found invalid', () => {
        this.explorer.query.query_name = '';
        this.explorer.isValid = false;
        ExplorerActions.save(this.persistence, 'TEMP-ABC');
        assert.isTrue(this.dispatchStub.calledWith({
          actionType: 'EXPLORER_UPDATE',
          id: 'TEMP-ABC',
          updates: { saving: false }
        }));
      });
    });

    describe('save with an already persisted explorer', () => {
      beforeEach(() => {
        this.persistence = {
          update: function(model, callback) {
            callback(null, _.assign({}, ExplorerUtils.formatQueryParams(ExplorerUtils.toJSON(model)), { query_name: 'abc123' }));
          }
        };
        this.explorer = TestHelpers.createExplorerModel();
        this.explorer.id = 'abc123';
        this.explorer.query_name = 'anb123';
        this.explorer.query.event_collection = 'clicks';
        this.explorer.query.analysis_type = 'count';
        this.getStub.returns(this.explorer);
        jest.spyOn(ExplorerUtils, 'mergeResponseWithExplorer').returns({ testKey: 'some updates' });
      });

      afterEach(() => {
        ExplorerUtils.mergeResponseWithExplorer.restore();
      });

      it('should dispatch an EXPLORER_SAVING event', () => {
        ExplorerActions.save(this.persistence, 'ABC');
        assert.isTrue(this.dispatchStub.calledWith({
          actionType: 'EXPLORER_SAVING',
          id: 'ABC',
          saveType: 'update'
        }));
      });
      it('should dispatch to update the right model with params from mergeResponseWithExplorer if successful', () => {
        ExplorerActions.save(this.persistence, 'ABC');
        assert.isTrue(this.dispatchStub.calledWith({
          actionType: 'EXPLORER_UPDATE',
          id: 'ABC',
          updates: { testKey: 'some updates' }
        }));
      });
      it('should dispatch a fail event if there is a failure', () => {
        var errorResp = { text: 'an error' };
        this.persistence.update = function(model, callback) {
          callback(errorResp);
        };
        ExplorerActions.save(this.persistence, 'ABC');
        assert.isTrue(this.dispatchStub.calledWith({
          actionType: 'EXPLORER_SAVE_FAIL',
          saveType: 'update',
          id: 'ABC',
          errorResp: errorResp,
          query: this.explorer.query
        }));
      });
    });

    describe('clone a saved query', () => {
        it('should dispatch an EXPLORER_CLONE event', () => {
          ExplorerActions.clone('ABC');
          assert.isTrue(this.dispatchStub.calledWith({
            actionType: 'EXPLORER_CLONE',
            id: 'ABC'
          }));
        });
    });
  });
  */
});
