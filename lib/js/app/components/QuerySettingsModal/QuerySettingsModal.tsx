import React, { FC, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Portal, Modal, ModalHeader } from '@keen.io/ui-core';

import QuerySettings from '../QuerySettings';

import {
  getQuerySettingsModalVisibility,
  hideQuerySettingsModal,
} from '../../modules/app';
import { resetSavedQueryError } from '../../modules/queries';
import { getSavedQuery, resetSavedQuery } from '../../modules/savedQuery';

import { AppContext } from '../../contexts';

import text from './text.json';

type Props = {
  /** Save query event handler */
  onSaveQuery: (settings: {
    displayName: string;
    name: string;
    refreshRate: number;
    tags: string[];
  }) => void;
  /** Cache available indicator */
  cacheAvailable: boolean;
};

const QuerySettingsModal: FC<Props> = ({ onSaveQuery, cacheAvailable }) => {
  const dispatch = useDispatch();
  const { modalContainer } = useContext(AppContext);

  const isOpen = useSelector(getQuerySettingsModalVisibility);
  const { exists, isCloned } = useSelector(getSavedQuery);

  const closeHandler = useCallback(() => {
    dispatch(hideQuerySettingsModal());
    dispatch(resetSavedQueryError());
    if (!exists && !isCloned) {
      dispatch(resetSavedQuery());
    }
  }, [exists, isCloned]);

  return (
    <Portal modalContainer={modalContainer}>
      <Modal isOpen={isOpen} onClose={closeHandler}>
        {() => (
          <>
            <ModalHeader onClose={closeHandler}>
              {text.querySettings}
            </ModalHeader>
            <QuerySettings
              cacheAvailable={cacheAvailable}
              onSave={onSaveQuery}
              onClose={closeHandler}
            />
          </>
        )}
      </Modal>
    </Portal>
  );
};

export default QuerySettingsModal;
