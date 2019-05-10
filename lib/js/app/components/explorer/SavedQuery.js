import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';

import {
  copyToClipboard,
  slugify,
} from '../../utils/text';

import {
  updateSavedQueryUI,
  resetSavedQueryUI,
} from '../../redux/actionCreators/ui';

import {
  saveQuery,
  deleteQuery,
} from '../../redux/actionCreators/client';

const mapStateToProps = state => ({
  results: state.queries.results,
  chartType: state.ui.chartType,
  uiSavedQuery: state.ui.savedQuery,
});

const mapDispatchToProps = {
  updateSavedQueryUI,
  resetSavedQueryUI,
  saveQuery,
  deleteQuery,
};

class SavedQuery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  save() {
    this.setState({ error: null });
    const {
      chartType,
      queryParams,
      uiSavedQuery,
    } = this.props;

    const {
      displayName,
      name,
      refreshRate,
    } = uiSavedQuery;

    if (!displayName) {
      this.setState({ error: 'Name is required' });
      return;
    }

    this.props.saveQuery({
      name,
      body: {
        query: queryParams,
        metadata: {
          displayName,
          visualization: {
            chartType,
          },
        },
        refreshRate: refreshRate * 60 * 60,
      },
    });
  }

  delete() {
    this.setState({ error: null });

    const {
      uiSavedQuery,
    } = this.props;

    const {
      name,
    } = uiSavedQuery;

    this.props.deleteQuery({
      name,
    });
  }

  clone() {
    this.setState({ error: null });
    this.props.resetSavedQueryUI();
  }

  render() {
    const {
      uiSavedQuery,
    } = this.props;

    const {
      error,
    } = this.state;

    const {
      name,
      displayName,
      cache,
      refreshRate,
      exists,
    } = uiSavedQuery;

    const refreshRates = [];
    for (let i = 4; i < 25; i++) {
      refreshRates.push(i);
    }

    return (
      <div className='saved-query'>
        <div>
          <input
            className='input-name'
            placeholder='Give your query a name...'
            type='text'
            value={displayName}
            onChange={(e) => {
              this.props.updateSavedQueryUI({
                name: slugify(e.target.value),
                displayName: e.target.value,
                exists: false,
              });
            }}
          />
          {
              name &&
          <div
            className='resource-name'>
            <div className='line line-label'>
              API's resource name:
            </div>
            <div className='line'>
            <span className='name'>
              {name}
            </span>
            
              <a
              className='button-copy'
              onClick={() => copyToClipboard(name)}
              >
              <i className="fas fa-copy"></i>
              </a>
            </div>
          </div>

           }
        </div>
        <div className='cache'>
          <div
          className='cache-toggle'
          onClick={() => {
            this.props.updateSavedQueryUI({
              cache: !cache,
              refreshRate: !cache ? 4 : 0,
            });
          }}
          >
          <i
            className={
              `fas ${cache ? 'fa-toggle-on' : 'fa-toggle-off' }`
            }
          />
          Cache
          </div>
          
          { cache &&
          <div className='cache-refresh'>
            <div className='label'>
              Refresh interval [hours]
            </div>
            <Select
              value={refreshRate && {
                label: refreshRate,
                value: refreshRate,
              }}
              options={refreshRates.map(item => ({ label: item, value: item }))}
              onChange={(value) => {
                this.props.updateSavedQueryUI({
                  refreshRate: value.value,
                });
              }}
              className=''
            />
          </div>
          }

        </div>
        { error &&
          <div className='error'>{ error }</div>}
        <div className='buttons'>
        {
          !exists &&
          <button
            className='button-save'
            onClick={() => this.save()}
          >
            Save
          </button>
        }
        {
          exists &&
          <button
            className='button-save'
            onClick={() => this.save()}
          >
            Update
          </button>
        }
        {
          exists &&
          <button
            className='button button-clone'
            onClick={() => this.clone()}
          >
            Clone
          </button>
        }
        {
          exists &&
          <button
            className='button button-delete'
            onClick={() => this.delete()}
          >
            Delete
          </button>
        }
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SavedQuery);
