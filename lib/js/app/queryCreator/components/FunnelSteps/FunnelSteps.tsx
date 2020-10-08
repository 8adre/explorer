import React, { FC, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import Sortable from 'sortablejs';

import { Container, AddStep } from './FunnelSteps.styles';

import { mutateArray } from '../../utils';

import text from './text.json';

import FunnelStep from '../FunnelStep';
import {
  addFunnelStep,
  setFunnelSteps,
  removeFunnelStep,
  getFunnelSteps,
  changeFunnelStepsOrder,
  cloneFunnelStep,
} from '../../modules/query';

import { DRAG_ANIMATION_TIME } from './constants';

const FunnelSteps: FC<{}> = () => {
  const dispatch = useDispatch();
  const steps = useSelector(getFunnelSteps);

  const [stepVisible, setStepVisible] = useState(null);
  const [isDragged, setDragMode] = useState(false);

  const sortableRef = useRef(null);

  const stepsRef = useRef(null);
  stepsRef.current = steps;

  useEffect(() => {
    new Sortable(sortableRef.current, {
      animation: DRAG_ANIMATION_TIME,
      filter: '.add-step',
      handle: '.dragBar',
      onStart: () => setDragMode(true),
      onMove: (evt) => !evt.related.className.includes('add-step'),
      onEnd: (evt) => {
        const updatedSteps = mutateArray(
          stepsRef.current,
          evt.oldIndex,
          evt.newIndex
        );
        dispatch(changeFunnelStepsOrder(updatedSteps));
        setDragMode(false);
      },
    });

    return () => {
      dispatch(setFunnelSteps([]));
    };
  }, []);

  return (
    <Container ref={sortableRef}>
      {!!steps.length &&
        steps.map(
          (
            {
              id,
              eventCollection,
              timeframe,
              timezone,
              inverted,
              optional,
              actorProperty,
              filters,
            },
            idx
          ) => (
            <FunnelStep
              key={id}
              id={id}
              index={idx}
              timeframe={timeframe}
              timezone={timezone}
              actorProperty={actorProperty}
              eventCollection={eventCollection}
              inverted={inverted}
              optional={optional}
              filters={filters}
              onRemove={() => dispatch(removeFunnelStep(id))}
              detailsVisible={stepVisible === id}
              isFirstStep={idx === 0}
              isDragged={isDragged}
              setDetailsVisible={(id) => setStepVisible(id)}
              onClone={(id) => {
                const stepId = uuid();
                dispatch(cloneFunnelStep(id, stepId));
                setStepVisible(stepId);
              }}
            />
          )
        )}
      <AddStep
        className="add-step"
        data-testid="add-step-button"
        onClick={() => {
          const stepId = uuid();
          dispatch(addFunnelStep(stepId));
          setStepVisible(stepId);
        }}
      >
        {text.addStep}
      </AddStep>
    </Container>
  );
};

export default FunnelSteps;
