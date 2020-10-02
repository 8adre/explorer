import React, { FC, useRef } from 'react';
import {
  PickerWidgets,
  ChartSettings,
  WidgetSettings,
} from '@keen.io/widget-picker';

import { Container, JSONContainer } from './QueryVisualization.styles';

import DataViz from '../DataViz';
import JSONView from '../JSONView';

import { CONTAINER_ID } from './constants';

type Props = {
  /** Analysis results */
  queryResults: Record<string, any>;
  /** Type of visualization widget */
  widgetType: PickerWidgets;
  /** Chart plot settings */
  chartSettings: ChartSettings;
  /** Widget settings */
  widgetSettings: WidgetSettings;
};

const QueryVisualization: FC<Props> = ({
  queryResults,
  chartSettings,
  widgetSettings,
  widgetType,
}) => {
  const datavizContainerRef = useRef(null);
  const useDataviz = widgetType !== 'json';

  return (
    <Container id={CONTAINER_ID}>
      {useDataviz ? (
        <DataViz
          analysisResults={queryResults}
          chartSettings={chartSettings}
          widgetSettings={widgetSettings}
          visualization={widgetType as Exclude<PickerWidgets, 'json'>}
          ref={datavizContainerRef}
        />
      ) : (
        <JSONContainer>
          <JSONView analysisResults={queryResults} />
        </JSONContainer>
      )}
    </Container>
  );
};

export default QueryVisualization;
