var assert = require('chai').assert;
var _ = require('lodash');
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var ExtractionOptions = require('../../../../../client/js/app/components/explorer/query_builder/extraction_options.js');
var TestHelpers = require('../../../../../test/support/TestHelpers');
var $R = require('rquery')(_, React, ReactDOM, TestUtils);

describe('components/explorer/query_builder/extraction_options', function() {
  beforeEach(function() {
    var model = TestHelpers.createExplorerModel();
    this.defaultProps = {
      handleSelectionWithEvent: function(){},
      latest: model.query.latest,
      email: model.query.email,
      model: model,
      isEmail: false,
      projectSchema: {}
    };
    this.renderComponent = function(props) {
      var props = _.assign({}, this.defaultProps, props);
      return TestUtils.renderIntoDocument(<ExtractionOptions {...props} />);
    };
    this.component = this.renderComponent();
  });

  describe('an email extraction', function () {
    it('shows the email field', function() {
      var props = _.assign({}, this.component.props, { isEmail: true });
      this.component = TestHelpers.renderComponent(ExtractionOptions, props);

      assert.lengthOf($R(this.component).find('input[name="email"]').components, 1);
    });
    it('shows the latest field', function() {
      var props = _.assign({}, this.component.props, { isEmail: true });
      this.component = TestHelpers.renderComponent(ExtractionOptions, props);

      assert.lengthOf($R(this.component).find('LatestField').components, 1);
    });
  });

  describe('extraction properties filter', function() {
    it('shows when an extraction model is loaded', function() {
      let model = TestHelpers.createExplorerModel();
      model.query.analysis_type = 'extraction';
      model.query.event_collection = 'test collection';
      model.response = { result: [{'test_name': 12 }] };
      const projectSchema = { 'test collection': { sortedProperties: ["test_name"] } };
      const props = _.assign({}, this.component.props, { model: model, projectSchema: projectSchema });

      this.component = TestHelpers.renderComponent(ExtractionOptions, props);

      assert.lengthOf($R(this.component).find('ReactMultiSelect').components, 1);
    });

    it('is hidden when with all other types of models', function() {
      assert.lengthOf($R(this.component).find('ReactMultiSelect').components, 0);
    });
  });
});
