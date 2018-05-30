let sinon from 'sinon/pkg/sinon.js');

var _ from 'lodash');
import React from 'react';
var ReactDOM from 'react-dom');
var TestUtils from 'react-addons-test-utils');
var BrowseQueries from '../../../../../lib/js/app/components/explorer/saved_queries/browse_queries.js');
var ExplorerUtils from '../../../../../lib/js/app/utils/ExplorerUtils');
var ExplorerActions from '../../../../../lib/js/app/actions/ExplorerActions');
var TestHelpers from '../../../../support/TestHelpers');
var $R from 'rquery')(_, React, ReactDOM, TestUtils);

describe('components/explorer/saved_queries/browse_queries', () => {
  beforeEach(() => {
    var defaultProps = {
      listItems: [
        {
          id: 1,
          query_name: 'logins-over-last-30-days',
          created_at: '2015-06-07 11:15:37.000000',
          metadata: {
            display_name: 'Logins over last 30 days'
          }
        },
        {
          id: 2,
          query_name: 'activation-rate',
          created_at: '2015-06-07 11:15:37.000000',
          metadata: {
            display_name: 'Activation rate'
          }
        },
        {
          id: 2,
          query_name: 'QUERY-RATES-THIS-WEEK',
          created_at: '2015-06-07 11:15:37.000000',
          metadata: {
            display_name: 'QUERY RATES THIS WEEK'
          }
        }
      ],
      removeCallback: null,
      clickCallback: null,
      selectedIndex: null,
      notice: null,
      emptyContent: null
    };
    this.renderComponent = function(props) {
      var props = _.assign({}, defaultProps, props);
      return TestUtils.renderIntoDocument(<BrowseQueries {...props} />);
    };
    this.component = this.renderComponent();
  });

  describe('setup', () => {
    it('is of the right type', () => {
      assert.isTrue(TestUtils.isCompositeComponentWithType(this.component, BrowseQueries));
    });

    it("creates a list item for each listItem prop", () => {
      assert.equal(this.component.refs.list.childNodes.length, 3);
    });

    it("should use metadata.display_name as the default query name displayed in the browse tab", () => {
      this.component = this.renderComponent({
        listItems: [
          {
            id: 1,
            query_name: 'test-query-name',
            created_at: '2015-06-07 11:15:37.000000',
            metadata: {
              display_name: 'Test Display Name',
              visualization: {
                chart_type: null
              }
            }
          }
        ]
      });
      console.log($R(this.component).find('h5')[0]);
      assert.equal($R(this.component).find('h5')[0].textContent, 'Test Display Name');
    });

    it("should use query_name as query name displayed in the browse tab when there's no metadata.display_name", () => {
      this.component = this.renderComponent({
        listItems: [
          {
            id: 1,
            query_name: 'test-query-name',
            created_at: '2015-06-07 11:15:37.000000',
            metadata: {
              display_name: null,
              visualization: {
                chart_type: null
              }
            }
          }
        ]
      });
      console.log($R(this.component).find('h5')[0]);
      assert.equal($R(this.component).find('h5')[0].textContent, 'test-query-name');
    });

    it("should use placeholder text for queries that do not have a query_name or metadata.display_name", () => {
      this.component = this.renderComponent({
        listItems: [
          {
            id: 1,
            query_name: null,
            created_at: '2015-06-07 11:15:37.000000',
            metadata: {
              display_name: null,
              visualization: {
                chart_type: null
              }
            }
          }
        ]
      });
      console.log($R(this.component).find('h5')[0]);
      assert.equal($R(this.component).find('h5')[0].textContent, 'Query not named');
    });
  });

  describe('Interactions', () => {
    describe('click callback', () => {
      it('should call the callback if a list element is clicked', () => {
        var stub = sinon.stub();
        this.component = this.renderComponent({ clickCallback: stub });
        var firstListItem = this.component.refs.list.childNodes[0];
        TestUtils.Simulate.click(firstListItem);
        assert.isTrue(stub.calledOnce);
      });
    });
  });
});
