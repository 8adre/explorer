import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, FadeLoader } from '@keen.io/ui-core';

import {
  Container,
  QueryName,
  Menu,
  MenuItem,
} from './EditorNavigation.styles';
import text from './text.json';

import { getSavedQuery } from '../../modules/savedQuery';
import { getQueriesSaving } from '../../modules/queries';
import {
  showQuerySettingsModal,
  getQuerySettingsModalVisibility,
} from '../../modules/app';

type Props = {
  /** Save query event handler*/
  onSaveQuery: () => void;
};

const EditorNavigation: FC<Props> = ({ onSaveQuery }) => {
  const dispatch = useDispatch();
  const { exists, displayName } = useSelector(getSavedQuery);
  const isSavingQuery = useSelector(getQueriesSaving);
  const isModalVisible = useSelector(getQuerySettingsModalVisibility);

  return (
    <Container>
      <QueryName>{displayName ? displayName : text.newQueryTitle}</QueryName>
      <Menu>
        {exists && (
          <MenuItem>
            <span onClick={() => dispatch(showQuerySettingsModal())}>
              Settings
            </span>
          </MenuItem>
        )}
        <MenuItem>
          <Button
            data-testid="save-query"
            variant="secondary"
            style="solid"
            isDisabled={isSavingQuery}
            onClick={() => {
              if (!exists) {
                dispatch(showQuerySettingsModal());
              } else {
                onSaveQuery();
              }
            }}
            icon={isSavingQuery && !isModalVisible && <FadeLoader />}
          >
            {text.saveQuery}
          </Button>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default EditorNavigation;
