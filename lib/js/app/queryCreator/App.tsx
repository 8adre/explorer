import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Icon } from '@keen.io/icons';
import { FieldGroup } from '@keen.io/forms';
import { colors } from '@keen.io/colors';

import { PreviewCollections, PreviewLabel } from './App.styles';

import {
  Accordion,
  Analysis,
  EventCollection,
  Extraction,
  GroupBy,
  OrderBy,
  Interval,
  TargetProperty,
  Timeframe,
  Timezone,
  Limit,
  Percentile,
  FunnelSteps,
  Filters
} from './components';
import { showField } from './utils/showField';

import {
  selectEventCollection,
  selectAnalysis,
  getPercentile,
  getEventCollection,
  getAnalysis,
  setPercentile,
  getTimeframe,
  setTimeframe,
  DEFAULT_TIMEFRAME,
} from './modules/query';

type Props = {
  /** Preview collection event handler */
  onPreviewCollection?: (collection: string) => void;
};

const App: FC<Props> = ({ onPreviewCollection }) => {
  const dispatch = useDispatch();
  const analysis = useSelector(getAnalysis);
  const collection = useSelector(getEventCollection);
  const percentile = useSelector(getPercentile);
  const timeframe = useSelector(getTimeframe);

  return (
    <div>
      {showField('eventCollection', analysis) && (
        <FieldGroup data-test="event-collection">
          <EventCollection
            collection={collection}
            onReset={() => dispatch(selectEventCollection(null))}
            onChange={(collection) =>
              dispatch(selectEventCollection(collection))
            }
          />
          <PreviewCollections
            onClick={() =>
              onPreviewCollection && onPreviewCollection(collection)
            }
          >
            <Icon type="eye-solid" fill={colors.blue['500']} />
            <PreviewLabel>Preview Collections</PreviewLabel>
          </PreviewCollections>
        </FieldGroup>
      )}
      <Analysis
        analysis={analysis}
        onChange={(updatedAnalysis) =>
          dispatch(selectAnalysis(updatedAnalysis))
        }
      />
      {analysis === 'extraction' && <Extraction collection={collection} />}
      {showField('targetProperty', analysis) && (
        <FieldGroup>
          <TargetProperty collection={collection} />
        </FieldGroup>
      )}
      {showField('percentile', analysis) && (
        <FieldGroup>
          <Percentile
            value={percentile}
            onReset={() => dispatch(setPercentile(null))}
            onChange={(value) => dispatch(setPercentile(value))}
          />
        </FieldGroup>
      )}
      {showField('timeframe', analysis) && (
        <FieldGroup>
          <Timeframe
            id="timeframe"
            value={timeframe}
            onReset={() => dispatch(setTimeframe(DEFAULT_TIMEFRAME))}
            onChange={(timeframe) => dispatch(setTimeframe(timeframe))}
          />
        </FieldGroup>
      )}
      {showField('timezone', analysis) && typeof timeframe === 'string' && (
        <Timezone />
      )}
      {showField('steps', analysis) && <FunnelSteps />}
      {showField('groupBy', analysis) && (
        <Accordion renderHeader={() => <div>Group By</div>}>
          <GroupBy collection={collection} />
        </Accordion>
      )}
      {showField('orderBy', analysis) && (
        <Accordion renderHeader={() => <div>Order By</div>}>
          <OrderBy />
        </Accordion>
      )}
      {showField('interval', analysis) && <Interval />}
      {showField('limit', analysis) && <Limit />}
      {showField('filters', analysis) && <Filters collection={collection} />}
    </div>
  );
};

export default App;
