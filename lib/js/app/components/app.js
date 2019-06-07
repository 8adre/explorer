import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import parse from 'csv-parse/lib/es5/sync';

import { getThemeForSelect } from '../utils/style';
import SelectTargetProperty from './explorer/SelectTargetProperty';

import {
  fetchProject,
  fetchSchema,
  query,
} from '../redux/actionCreators/client';

import {
  updateUI,
  updateStepUI,
  resetUI,
  togglePanelSave,
  changeEventCollection,
  addStep,
} from '../redux/actionCreators/ui';

import EventCollection from './explorer/EventCollection';
import PreviewCollection from './explorer/PreviewCollection';
import Timeframe from './explorer/Timeframe';
import Extraction from './explorer/Extraction';
import Percentile from './explorer/Percentile';
import Filters from './explorer/Filters';
import GroupBy from './explorer/GroupBy';
import Interval from './explorer/Interval';
import APIQueryURL from './explorer/APIQueryURL';
import Step from './explorer/Step';
import ActorProperty from './explorer/ActorProperty';
import SavedQuery from './explorer/SavedQuery';
import SavedQueryBrowser from './explorer/SavedQueryBrowser';

import Dataviz from './explorer/Dataviz';
import JsonView from './explorer/JsonView';
import Foldable from './explorer/Foldable';
import EmbedHTML from './explorer/EmbedHTML';

import LoadingSpinner from './explorer/shared/LoadingSpinner';

import { getChartTypeOptions } from '../utils/chartTypes';
// import { getPropertyType } from '../utils/filter';

import {
  b64EncodeUnicode,
  b64DecodeUnicode,
} from '../utils/base64';

import {
  ANALYSIS_TYPES,
  PANEL_NEW_QUERY,
  PANEL_BROWSE,
  TAB_EXTRACTION_BULK,
  DEFAULT_STANDARD_INTERVAL,
} from '../consts';

import { client } from '../app';

const mapStateToProps = state => ({
  collections: state.collections,
  queries: state.queries,
  ui: state.ui,
  steps: state.ui.steps,
});

const mapDispatchToProps = {
  fetchProject,
  fetchSchema,
  query,
  updateUI,
  updateStepUI,
  resetUI,
  togglePanelSave,
  changeEventCollection,
  addStep,
};

const defaultFeatures = {
  save: true,
};

class App extends Component {
  constructor(props) {
    super(props);
    const features = {
      ...defaultFeatures,
      ...(props.features || {}),
    };
    this.state = {
      features,
    };
  }

  componentDidMount() {
    this.props.fetchProject();
    Modal.setAppElement(this.props.container);

    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    if (searchParams) {
      const UIencodedState = searchParams.get('state');
      if (UIencodedState) {
        const preloadState = JSON.parse(b64DecodeUnicode(UIencodedState));
        if (preloadState.analysisType !== 'extraction') {
          // don't autoload extractions
          preloadState.autoload = true;
        }
        this.props.updateUI(preloadState);
      }
    }
  }

  componentDidUpdate(prevProps) {
    const {
      // state
      ui,

      // dispatchers
      fetchSchema,
    } = this.props;
    const UIencodedState = b64EncodeUnicode(JSON.stringify(ui));
    const url = new URL(window.location.href);
    const query_string = url.search;
    const search_params = new URLSearchParams(query_string);
    const UIencodedStateOld = search_params.get('state');
    if (UIencodedState !== UIencodedStateOld) {
      search_params.set('state', UIencodedState);
      url.search = search_params.toString();
      history.pushState({}, '', url.toString());
    }

    const {
      autoload,
      savedQuery,

      analysisType,
      steps,
    } = this.props.ui;
    let {
      // ui state
      eventCollection,
    } = this.props.ui;

    if (analysisType === 'funnel') {
      eventCollection = steps[0].eventCollection;
    }
  
    if (prevProps.collections.items.length !== this.props.collections.items.length
      && !Object.keys(this.props.collections.schemas).length
    ) {
      fetchSchema({
        eventCollection,
      });
    }

    if (autoload) {
      ui.autoload = false;
      updateUI({
        autoload: false,
      });

      fetchSchema({
        eventCollection,
      });

      const savedQueryName = savedQuery && savedQuery.name;
      this.runQuery({
        savedQueryName,
      });
    }
  }

  getQueryParams() {
    const {
      analysisType,
      eventCollection,
      targetProperty,
      timeframe,
      timezone,
      filters,
      interval,
      groupBy,
      orderBy,
      limit,
      latest,
      propertyNames,
      email,
      extractionActiveTab,
      percentile,
      steps,
    } = this.props.ui;

    let queryParams = {
      analysisType,
      eventCollection,
      timeframe,
      timezone,
      ...{
        interval,
        targetProperty,
        filters,
        groupBy,
        orderBy,
        limit,
        percentile,
      },
    };

    if (analysisType === 'extraction') {
      queryParams = {
        ...queryParams,
        latest,
        propertyNames,
      };

      if (extractionActiveTab === TAB_EXTRACTION_BULK) {
        queryParams.email = email;
      }
    }

    if (analysisType === 'funnel') {
      queryParams = {
        ...queryParams,
        steps,
      };
    }

    return queryParams;
  }

  runQuery(payload) {
    let params = {
      ...this.convertFilterValuesToJsonValues(this.getQueryParams()),
    };

    if (params.analysisType === 'funnel') {
      const updatedSteps = params.steps.map(step => {
        return {
          ...step,
          ...this.convertFilterValuesToJsonValues(step),
        };
      });
      params = {
        ...params,
        steps: [
          ...updatedSteps
        ],
        filters: undefined,
      };
    }

    this.props.query({
      ...payload,
      ...params,
    });
  }

  convertFilterValuesToJsonValues(params) {
    const schema = this.props.collections && Object.keys(this.props.collections.schemas).length && this.props.collections.schemas[params.eventCollection];

    const filters = params.filters.map(({ propertyName, propertyType, operator, propertyValue }) => {
      let value;

      if (!propertyType) {
        console.log('no prop type in filter', params);
        /*
        propertyType = getPropertyType({
          schema,
          filter: { propertyName, propertyType, operator, propertyValue },
        });
        */
      }

      if (propertyType === 'String' || propertyType === 'Datetime' || operator === 'contains' || operator === 'not_contains') {
        value = propertyValue;
      }

      if (
        propertyType === 'Boolean'
        || operator === 'exists'
      ) {
        value = (propertyValue === 'true');
      }
      else if (operator === 'in') {
        value = parse(propertyValue, {
          quote: '"',
          ltrim: true,
          rtrim: true,
          delimiter: ',',
        })[0];

        if (propertyType === 'Number') {
          value = value.map(val => val.replace(/['"]+/g, '')); // backwards compatible '1', '2'...
        }
      }
      else if (propertyType === 'Number'
      ) {
        value = parseFloat(propertyValue);
      }
      else if (propertyType === 'List'
      ) {
        value = propertyValue;
        if (operator === 'within') {
          const long = parseFloat(propertyValue.coordinates[0] || 0);
          const lat = parseFloat(propertyValue.coordinates[1] || 0);
          const radius = parseFloat(propertyValue.maxDistanceMiles || 0);
          value = {
            coordinates: [long, lat],
            maxDistanceMiles: radius,
          };
        }
      }

      if (operator === 'Null') {
        value = null;
      }

      return {
        propertyName,
        propertyType,
        operator,
        propertyValue: value,
      };
    });

    return {
      ...params,
      filters: [
        ...filters,
      ],
    };
  }

  renderFiltersFoldable({ step, funnel } = {}) {
    const {
      updateUI,
    } = this.props;
    const {
      modalFilters,
      steps,
    } = this.props.ui;
    let {
      filters,
      eventCollection,
    } = this.props.ui;

    if (funnel) {
      filters = steps[step].filters;
      eventCollection = steps[step].eventCollection;
    }

    const onCloseModal = () => {
      updateUI({
        modalFilters: false,
      });
    };

    return (
      <Fragment>
      <div
      onClick={() => {
        if (!eventCollection) {
          return;
        }
        updateUI({
          modalFilters: true,
        });
      }}
      className='filters foldable'
    >
      <div className='title'>Filters</div>
      { !!filters.length &&
        <div className='count'>{filters.length}</div>
      }
    </div>
    <Modal
      isOpen={modalFilters}
      onRequestClose={() => onCloseModal()}
      contentLabel=''
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        },
      }}
     >
      <div className='filters-container modal'>
        <div className='header'>
          <div className='title'>Filters</div>
          {
            /*
<div className='x' onClick={() => {
            onCloseModal();
          }}>x</div>
            */
          }
        </div>
        <Filters
          funnel={funnel}
          step={step}
          onCloseModal={() => onCloseModal()}
        />
      </div>
      </Modal>
      </Fragment>
    );
  }

  render() {
    const {
      queries,
      updateUI,
      resetUI,
      togglePanelSave,
      addStep,

      // from config props
      previewCollection,
      saveStateToLocalStorage,
    } = this.props;
    const {
      features,
    } = this.state;
    const {
      activePanel,
      analysisType,
      eventCollection,
      showTargetProperty,
      targetProperty,
      interval,
      groupBy,
      chartType,
      modalEmbedHTML,
      modalPreviewCollection,
      error,
      fetching,
      panelSave,
      extractionActiveTab,
      steps,
    } = this.props.ui;
    const selectedAnalysisType = {
      label: analysisType,
      value: analysisType,
    };
    const selectedTargetProperty = {
      label: targetProperty,
      value: targetProperty,
    };

    const queryParams = this.getQueryParams();

    const chartTypes = getChartTypeOptions(queryParams);
    const hasResults = queries && queries.results;

    let chartTypeSelected = chartTypes.length && { label: chartTypes[0], value: chartTypes[0] };
    if (chartType) {
      chartTypeSelected = { label: chartType, value: chartType };
    }

    const { readKey, projectId } = this.props.keenAnalysis.config;

    return (
      <div className='keenExplorer' >
        <div className='panel'>
          <div className='panel-buttons tabs'>
            <div
              className={`tab button button-new-query`}
              onClick={() => {
                resetUI();
              }}
            >
              <i
                className='fa fa-plus'
              />
            </div>
            <div
              className={`tab button ${activePanel === PANEL_NEW_QUERY ? 'active' : ''}`}
              onClick={() => updateUI({
                activePanel: PANEL_NEW_QUERY,
              })}
            >Query
            </div>
            <div
              className={`tab button ${activePanel === PANEL_BROWSE ? 'active' : ''}`}
              onClick={() => updateUI({
                activePanel: PANEL_BROWSE,
              })}
            >Browse</div>
          </div>
          <div className={
            `panel-content ${activePanel !== PANEL_NEW_QUERY ? 'hide' : ''}`
          }>
          <div className='label label-analysis-type'>Analysis type</div>
          <Select
            value={selectedAnalysisType}
            options={ANALYSIS_TYPES.map(item => ({ label: item.type, value: item.type }))}
            onChange={(e) => {
              updateUI({
                analysisType: e.value,
                showTargetProperty:
                  !!ANALYSIS_TYPES.find(item => item.type === e.label).targetProperty,
              });
            }}
            theme={getThemeForSelect}
          />

          {
            analysisType !== 'funnel' &&
            <EventCollection
              saveStateToLocalStorage={saveStateToLocalStorage.eventCollection}
            />
          }

          {
            previewCollection &&
            <Fragment>
               <a
                  className='a-preview-collection'
                  onClick={() => {
                    updateUI({
                      modalPreviewCollection: true,
                    });
                  }} >
                  <i className='fas fa-search' /> Preview Collections
                </a>
                <Modal
                  isOpen={modalPreviewCollection}
                  onRequestClose={() => {
                    updateUI({
                      modalPreviewCollection: false,
                    });
                  }}
                  style={{
                    overlay: {
                      backgroundColor: 'rgba(0, 0, 0, 0.3)'
                    },
                  }}
                >
                  <div className='modal'>
                    <div className='header'>
                      <div className='title'>Preview Collections</div>
                      <div className='x' onClick={() => {
                        updateUI({
                          modalPreviewCollection: false,
                        });
                      }}>x</div>
                    </div>
                    <PreviewCollection />
                  </div>
                </Modal>

            </Fragment>
          }
          
          { showTargetProperty && eventCollection &&
            <SelectTargetProperty
              value={selectedTargetProperty}
              eventCollection={eventCollection}
            />
          }

          { analysisType === 'extraction' && eventCollection &&
            <Extraction />
          }

          { analysisType === 'percentile' && eventCollection &&
            <Percentile />
          }

          { analysisType === 'funnel' && steps &&
          <div className='funnel'>
          { steps.map((step, index) => {
            return (
              <Step
                key={index}
                index={index}
                className=''>
                <EventCollection
                  funnel={true}
                  step={index}/>
                <ActorProperty
                  step={index}/>
                <Timeframe
                  funnel={true}
                  step={index}/>
                { this.renderFiltersFoldable({
                  funnel: true,
                  step: index,
                }) }
              </Step>
            );
          }) }
          <div
            onClick={() => addStep()}
            className='button button-add'>
              <i className='fas fa-plus' /> Add a step
            </div>
          </div>
          }

          { analysisType !== 'funnel' &&
            <Fragment>
            <Timeframe />
            { this.renderFiltersFoldable() }
            </Fragment>
          }

          {
          analysisType !== 'extraction' &&
          analysisType !== 'funnel' &&

          <Fragment>
          <Foldable
          title='Group By - Order By'
          defaultActive={!!groupBy}
          onClose={
            () => {
              updateUI({
                groupBy: undefined,
                orderBy: undefined,
                limit: undefined,
                numberOfGroupByProps: 1,
              });
            }
          }>
          <GroupBy />
          </Foldable>

          <Foldable
          title='Interval'
          defaultActive={!!interval}
          onOpen={
            () => {
              updateUI({
                interval: DEFAULT_STANDARD_INTERVAL,
              });
            }
          }
          onClose={
            () => {
              updateUI({
                interval: undefined,
              });
            }
          }>
            <Interval />
          </Foldable>

          <APIQueryURL
            queryParams={queryParams}
            client={client}
          />

          </Fragment>
          }

        </div>


        <div
          className={
            `panel-content ${activePanel !== PANEL_BROWSE ? 'hide' : ''}`
          }>
          <SavedQueryBrowser
            client={client}
          />
        </div>

        </div>


        <div className='result'>
          { !hasResults &&
          <div className='lets-go'>
            Let's go exploring!
          </div>
          }

          { hasResults &&
              <div className='preview'>
                { chartType === 'JSON' && <JsonView />}
                { chartType !== 'JSON' &&
                <Fragment>
                 <Dataviz />
                 <button
                  className='button-download button-embed-html'
                  onClick={() => {
                    updateUI({
                      modalEmbedHTML: true,
                    });
                  }} >
                  <i className='fas fa-code' /> Embed HTML
                </button>
                <Modal
                  isOpen={modalEmbedHTML}
                  onRequestClose={() => {
                    updateUI({
                      modalEmbedHTML: false,
                    });
                  }}
                  style={{
                    overlay: {
                      backgroundColor: 'rgba(0, 0, 0, 0.3)'
                    },
                  }}
                >
                  <div className='modal'>
                    <div className='header'>
                      <div className='title'>Embed HTML</div>
                      <div className='x' onClick={() => {
                        updateUI({
                          modalEmbedHTML: false,
                        });
                      }}>x</div>
                    </div>
                    <EmbedHTML
                      projectId={projectId}
                      readKey={readKey}
                    />
                  </div>
                </Modal>
                </Fragment>
                }
                <div className='select-chart-type-container'>
                <Select
                   className='select-chart-type'
                   value={chartTypeSelected}
                   options={chartTypes.map(item => ({ label: item, value: item }))}
                   onChange={(e) => {
                     updateUI({
                       chartType: e.value,
                     });
                   }}
                   theme={getThemeForSelect}
                  />

                  {
                    chartTypeSelected && chartTypeSelected.value.indexOf('funnel') > -1 &&
                    <div className='chart-not-supported-note'>
                      Note: this chart type isn't supported in the dashboard builder yet.
                    </div>
                  }
                </div>
              </div>
           }

          {
            error &&
            <div className='error'>
              {error.body}
            </div>
          }

          <div className='action-buttons'>

            <button
            className='button-run-query button-with-loading-spinner'
            onClick={() => this.runQuery()}>
            {
              fetching &&
              <LoadingSpinner />
            }
            {
              !(analysisType === 'extraction' && extractionActiveTab === TAB_EXTRACTION_BULK)
              && <Fragment>
                Run Query
              </Fragment>
            }
            {
              (analysisType === 'extraction' && extractionActiveTab === TAB_EXTRACTION_BULK)
              && <Fragment>
                Extract to Email
              </Fragment>
            }
            </button>

          {
            features.save
            && analysisType !== 'extraction'
            &&
            <div
            className={
              `button-toggle ${panelSave ? 'button-toggle-active' : ''}`
            }
            onClick={() => togglePanelSave()}>
            Save Query
            </div>
          }
          
          { features.save &&
            panelSave &&
            <SavedQuery
              client={client}
              queryParams={queryParams}
            />
          }

          </div>

        </div>
      </div>
    );
  }

}

App.propTypes = {
  todoText: PropTypes.string,
  //increment: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
