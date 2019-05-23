import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import KeenDataviz from 'keen-dataviz';
import 'keen-dataviz/dist/keen-dataviz.css';

import { exportToCsv } from '../../utils/csv';
import { exportToJson } from '../../utils/json';

const mapStateToProps = state => ({
  results: state.queries.results,
  type: state.ui.chartType,
  queryName: state.ui.savedQuery.name,
  modalEmbedHTML: state.ui.modalEmbedHTML,
  modalFilters: state.ui.modalFilters,
  analysisType: state.ui.analysisType,
  stepLabels: state.ui.stepLabels,
});

const mapDispatchToProps = {};
class DatavizComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.generateChart();
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
    } = this.props;
    if (
      prevProps.analysisType !== analysisType
      || prevProps.stepLabels.toString() !== stepLabels.toString()
      || prevProps.type !== type
      || JSON.stringify(prevProps.results) !== JSON.stringify(results)
    ) {
      this.generateChart();
    }
  }

  generateChart() {
    const {
      results,
      type,
      analysisType,
      stepLabels,
    } = this.props;
    if (results) {
      console.log('re-draw chart', results);
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
      });
    }
  }

  getData() {
    return this.dataviz && this.dataviz.dataset && this.dataviz.dataset.matrix;
  }

  render() {
    const {
      results,
      modalEmbedHTML,
      modalFilters,
    } = this.props;
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
        <button
          className='button-download button-download-csv'
          onClick={() => exportToCsv(this.getData(), filename)} >
          <i className='fas fa-download'></i> CSV</button>
        <button
          className='button-download button-download-json'
          onClick={() => exportToJson(results, filename)} >
          <i className='fas fa-download'></i> JSON</button>
      </Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DatavizComponent);
