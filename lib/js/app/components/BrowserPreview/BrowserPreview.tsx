import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Card,
  HeaderContainer,
  QueryTitle,
  VisualizationWrapper,
} from './BrowserPreview.styles';
import text from './text.json';

import BrowserQueryMenu from '../BrowserQueryMenu';
import Heading from '../Heading';
import QueryVisualization from '../QueryVisualization';
import QuerySummary from '../QuerySummary';
import QueryLimitReached from '../QueryLimitReached';
import VisualizationPlaceholder from '../VisualizationPlaceholder';

import {
  deleteQuery,
  getQueryResults,
  getQueryLimitReached,
  getQueryPerformState,
  SavedQueryListItem,
} from '../../modules/queries';

type Props = {
  /** Current active query */
  currentQuery?: SavedQueryListItem;
  /** Run selected query event handler */
  onRunQuery: () => void;
  /** Edit query event handler */
  onEditQuery: (queryName: string) => void;
};

const BrowserPreview: FC<Props> = ({
  currentQuery,
  onEditQuery,
  onRunQuery,
}) => {
  const dispatch = useDispatch();
  const queryResults = useSelector(getQueryResults);
  const isQueryLoading = useSelector(getQueryPerformState);
  const isQueryLimitReached = useSelector(getQueryLimitReached);

  return (
    <>
      <HeaderContainer>
        <Heading>{text.title}</Heading>
      </HeaderContainer>
      <Card>
        {isQueryLimitReached ? (
          <QueryLimitReached />
        ) : (
          <>
            {currentQuery && (
              <QueryTitle>{currentQuery.displayName}</QueryTitle>
            )}
            {currentQuery && queryResults ? (
              <VisualizationWrapper
                widgetType={currentQuery.visualization.type}
              >
                <QueryVisualization
                  widgetType={currentQuery.visualization.type}
                  widgetSettings={currentQuery.visualization.widgetSettings}
                  chartSettings={currentQuery.visualization.chartSettings}
                  queryResults={queryResults}
                />
              </VisualizationWrapper>
            ) : (
              <VisualizationPlaceholder
                isLoading={isQueryLoading}
                onRunQuery={onRunQuery}
              />
            )}
          </>
        )}
        {currentQuery && (
          <>
            <BrowserQueryMenu
              onRemoveQuery={() => dispatch(deleteQuery(currentQuery.name))}
              onEditQuery={() => onEditQuery(currentQuery.name)}
            />
            <QuerySummary querySettings={currentQuery} />
          </>
        )}
      </Card>
    </>
  );
};

export default BrowserPreview;
