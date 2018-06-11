import _ from 'lodash';
import React from 'react';

// Components
import FieldsToggle from '../../common/fields_toggle.js';
import SelectField from './select_field.js';
import PercentileField from './percentile_field.js';
import GroupByField from './group_by_field.js';
import ExtractionOptions from './extraction_options.js';
import FunnelBuilder from './funnels/funnel_builder.js';
import Timeframe from '../../common/timeframe.js';
import Interval from '../../common/interval.js';
import Input from '../../common/input.js';
import ApiUrl from './api_url.js';
import ExplorerStore from '../../../stores/ExplorerStore';
import ExplorerUtils from '../../../utils/ExplorerUtils';
import FilterUtils from '../../../utils/FilterUtils';
import ExplorerActions from '../../../actions/ExplorerActions';

const QueryBuilder = React.createClass({

  // Event callbacks

  handleSelectionWithEvent: function(event) {
    this.handleChange(event.target.name, event.target.value);
  },

  handleChange: function(update, value) {
    var updates = { query: {} };

    if(_.isPlainObject(update)) {
      for(key in update) {
        updates.query[key] = update[key];
      }
    } else {
      updates.query[update] = value;
    }

    ExplorerActions.update(this.props.model.id, updates);
  },

  // Convenience Methods

  updateGroupBy: function(updates) {
    ExplorerActions.update(this.props.model.id, { query: updates });
  },

  handleRevertChanges: function(event) {
    event.preventDefault();
    ExplorerActions.revertActiveChanges();
  },

  shouldShowRevertButton: function() {
    return ExplorerUtils.isPersisted(this.props.model) && this.props.model.originalModel && this.props.model.originalModel.query && !_.isEqual(this.props.model.query, this.props.model.originalModel.query);
  },

  // Fields Builders

  buildEventCollectionField: function() {
    if (this.props.model.query.analysis_type !== 'funnel') {
      return (
        <SelectField name="event_collection"
                     label="Event Collection"
                     value={this.props.model.query.event_collection}
                     requiredLabel={true}
                     onBrowseEvents={this.props.onBrowseEvents}
                     handleChange={this.handleChange}
                     options={this.props.project.eventCollections} />
      );
    }
  },

  buildExtractionOptions: function() {
    if (this.props.model.query.analysis_type === 'extraction') {
      return (
        <ExtractionOptions latest={this.props.model.query.latest}
                           email={this.props.model.query.email}
                           property_names={this.props.model.query.property_names}
                           event_collection={this.props.model.query.event_collection}
                           projectSchema={this.props.project.schema}
                           isEmail={ExplorerUtils.isEmailExtraction(this.props.model)}
                           handleChangeWithEvent={this.handleSelectionWithEvent}
                           handleChange={this.handleChange}
                           setExtractionType={this.props.setExtractionType} />
      );
    }
  },

  buildGroupByField: function() {
    if (['extraction', 'funnel'].indexOf(this.props.model.query.analysis_type) === -1) {
      return (
        <GroupByField ref="group-by-field"
                      value={this.props.model.query.group_by}
                      updateGroupBy={this.updateGroupBy}
                      options={this.props.getEventPropertyNames(this.props.model.query.event_collection)}
                      handleChange={this.handleChange} />
      );
    }
  },

  buildTargetPropertyField: function() {
    var type = this.props.model.query.analysis_type;
    if (type !== null && ExplorerUtils.shouldHaveTarget(this.props.model)) {
      return (
        <SelectField name="target_property"
                     label="Target Property"
                     inputClasses={['target-property']}
                     requiredLabel={true}
                     handleChange={this.handleChange}
                     options={this.props.getEventPropertyNames(this.props.model.query.event_collection)}
                     value={this.props.model.query.target_property}
                     sort={true} />
      );
    }
  },

  buildPercentileField: function() {
    if (this.props.model.query.analysis_type === 'percentile') {
      return (
        <PercentileField ref="percentile-field"
                         value={this.props.model.query.percentile}
                         onChange={this.handleSelectionWithEvent} />
      );
    }
  },

  buildIntervalField: function() {
    if (['extraction', 'funnel'].indexOf(this.props.model.query.analysis_type) === -1) {
      return (
        <Interval interval={this.props.model.query.interval}
                  handleChange={this.handleChange} />
      );
    }
  },

  buildFilters: function() {
    if (this.props.model.query.analysis_type !== 'funnel') {
      return (
        <div className="field-component">
          <FieldsToggle ref="filters-fields-toggle"
                        name="Filters"
                        toggleCallback={this.props.handleFiltersToggle}
                        fieldsCount={FilterUtils.validFilters(this.props.model.query.filters).length} />
        </div>
      );
    }
  },

  buildGlobalTimeframePicker: function() {
    if (this.props.model.query.analysis_type !== 'funnel') {
      return (
        <div>
          <Timeframe ref="timeframe"
                     time={this.props.model.query.time}
                     timezone={this.props.model.query.timezone}
                     handleChange={this.handleChange}/>
          <hr className="fieldset-divider" />
        </div>
      );
    }
  },

  buildFunnelBuilder: function() {
    if (this.props.model.query.analysis_type === 'funnel') {
      return <FunnelBuilder modelId={this.props.model.id}
                            steps={this.props.model.query.steps}
                            stepNotices={this.props.stepNotices || []}
                            onBrowseEvents={this.props.onBrowseEvents}
                            eventCollections={this.props.project.eventCollections}
                            getEventPropertyNames={this.props.getEventPropertyNames}
                            getPropertyType={this.props.getPropertyType} />;
    }
  },

  buildClearButton: function() {
    if (!this.shouldShowRevertButton()) {
      return (
        <button type="reset" role="clear-query"
          className="btn btn-default btn-block"
          id="clear-explorer-query"
          onClick={this.props.handleClearQuery}>
            Clear
        </button>
      );
    } else {
      return (
        <button
          className="btn btn-default btn-block"
          onClick={this.handleRevertChanges}
          role="revert-query">
            Revert to original
        </button>
      );
    }
  },

  // React methods

  render: function() {
    var apiQueryUrl;
    if (this.props.model.isValid) {
      apiQueryUrl = ExplorerUtils.getApiQueryUrl(this.props.client, this.props.model);
    }

    return (
      <section className="query-pane-section query-builder">
        <form className="form query-builder-form" onSubmit={this.props.handleQuerySubmit}>
          <SelectField name="analysis_type"
                       label="Analysis Type"
                       inputClasses={['analysis-type']}
                       options={this.props.analysisTypes}
                       value={this.props.model.query.analysis_type}
                       handleChange={this.handleChange}
                       requiredLabel={true} />
          {this.buildEventCollectionField()}
          {this.buildFunnelBuilder()}
          {this.buildExtractionOptions()}
          {this.buildTargetPropertyField()}
          {this.buildPercentileField()}
          {this.buildGlobalTimeframePicker()}
          {this.buildGroupByField()}
          {this.buildFilters()}
          {this.buildIntervalField()}
          <div className="button-set-clear-toggle">
            {this.buildClearButton()}
          </div>
          <ApiUrl url={apiQueryUrl}
                  isValid={this.props.model.isValid} />
        </form>
      </section>
    );
  }
});

export default QueryBuilder;
