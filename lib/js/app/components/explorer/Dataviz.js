import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import KeenDataviz from 'keen-dataviz';
import moment from 'moment-timezone';
import 'keen-dataviz/dist/keen-dataviz.css';

import { exportToCsv } from '../../utils/csv';
import { exportToJson } from '../../utils/json';

import { TIMEZONES } from '../../consts';

const mapStateToProps = state => ({
  results: state.queries.results,
  type: state.ui.chartType,
  queryName: state.ui.savedQuery.name,
  modalEmbedHTML: state.ui.modalEmbedHTML,
  modalFilters: state.ui.modalFilters,
  analysisType: state.ui.analysisType,
  stepLabels: state.ui.stepLabels,
  timezone: state.ui.timezone,
});

const mapDispatchToProps = {};
class DatavizComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDownloadButtons: false,
    };
    this.downloadToggleRef = React.createRef();
  }

  componentDidMount() {
    this.generateChart();
    this.handleClick = this.handleClick.bind(this);
    document.addEventListener('click', this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
  }

  handleClick(e) {
    if (!this.downloadToggleRef.current.contains(e.target)) {
      this.setState({
        showDownloadButtons: false,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.queryName !== this.props.queryName) {
      return;
    }

    const {
      results,
      type,
      analysisType,
      stepLabels,
      timezone,
    } = this.props;
    if (
      prevProps.analysisType !== analysisType
      || prevProps.stepLabels.toString() !== stepLabels.toString()
      || prevProps.type !== type
      || prevProps.timezone !== timezone
      || JSON.stringify(prevProps.results) !== JSON.stringify(results)
    ) {
      console.log('regenerate chart');
      this.generateChart();
    }
  }

  getData() {
    return this.dataviz && this.dataviz.dataset && this.dataviz.dataset.matrix;
  }

  generateChart() {
    const {
      results,
      type,
      analysisType,
      stepLabels,
      timezone,
    } = this.props;

    if (results) {
      if (typeof results.result === 'string') {
        return;
      }

      let labels;
      let funnel;
      if (analysisType === 'funnel') {
        const { metadata } = results;
        if (metadata) {
          const { visualization } = metadata;
          if (visualization) {
            const { stepLabels } = visualization;
            labels = stepLabels;
          }
        }
        if (stepLabels && stepLabels.length && stepLabels[0]) {
          labels = stepLabels;
        }
        funnel = {
          percents: {
            show: true,
          },
        };
      }

      const timezoneByValue = TIMEZONES.find(item => item.value === timezone);
      const timezoneString = (timezoneByValue && timezoneByValue.label) || 'UTC';

      this.dataviz = new KeenDataviz({
        container: '#keen-dataviz-container',
        type,
        // title: 'New Customers per Week',
        title: false,
        labels, // funnel step labels
        showLoadingSpinner: true,
        results,
        funnel,
        onrendered: () => {
        },
        table: {
          mapDates: (value) => {
            return moment
              .tz(value, 'UTC')
              .clone()
              .tz(timezoneString)
              .toString();
          },
        },
        sortGroups: 'desc',
        legend: {
          label: {
            textMaxLength: 30,
          },
        },
      });
    }
  }

  exportToPNG() {
    return this.dataviz && this.dataviz.exportImage({
      bgcolor: 'white',
    });
  }

  render() {
    const {
      results,
      modalEmbedHTML,
      modalFilters,
    } = this.props;

    const {
      showDownloadButtons,
    } = this.state;

    const filename = this.props.queryName || 'untitled-query';

    const resultIsString = (typeof results.result === 'string');

    return (
      <Fragment>
        {
          !resultIsString &&
          <div
          className={
            `keen-dataviz-container ${modalEmbedHTML || modalFilters ? 'hide' : ''}`
          }
          id='keen-dataviz-container'
          />
        }
        {
          resultIsString &&
          <div className={
            `keen-dataviz-container ${modalEmbedHTML || modalFilters ? 'hide' : ''} result-string`
          }><div>{ results.result }</div></div>
        }

        <div className='download-toggle' ref={this.downloadToggleRef}>
          <div className='download-toggle-label'
            onClick={() => {
              this.setState({
                showDownloadButtons: true,
              });
            }}>
            <i className='fas fa-download' />
            Download
          </div>
          {
            showDownloadButtons &&
            <div className='download-buttons'>
            <button
              className='button-download button-download-csv'
              onClick={() => exportToCsv(this.getData(), filename)} >
              CSV
            </button>
            <button
              className='button-download button-download-json'
              onClick={() => exportToJson(results, filename)} >
              JSON
            </button>
            <button
              className='button-download button-download-png'
              onClick={() => this.exportToPNG()} >
              PNG
            </button>
          </div>
          }
          
        </div>

      </Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DatavizComponent);
