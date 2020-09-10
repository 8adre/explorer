import React, { FC, useState, useRef, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Button,
  Badge,
  CircleButton,
  Dropdown,
  FadeLoader,
} from '@keen.io/ui-core';
import { Icon } from '@keen.io/icons';

import {
  Container,
  QueryName,
  QueryMeta,
  Tag,
  Menu,
  MenuItem,
  BackLink,
  BackLinkText,
  WrapperHorizontal,
  WrapperVertical,
} from './EditorNavigation.styles';
import text from './text.json';

import ActionsMenu from '../ActionsMenu';

import { getSavedQuery } from '../../modules/savedQuery';
import { getQueriesSaving, deleteQuery } from '../../modules/queries';
import {
  showQuerySettingsModal,
  switchToQueriesList,
  getQuerySettingsModalVisibility,
  SettingsModalSource,
} from '../../modules/app';
import { colors } from '@keen.io/colors';

const actionsDropdownMotion = {
  initial: { opacity: 0, top: 20, left: -10 },
  animate: { opacity: 1, top: 2, left: -10 },
  exit: { opacity: 0, top: 30, left: -10 },
};

type Props = {
  /** Save query event handler*/
  onSaveQuery: () => void;
};

const iconVariants = {
  initial: { x: 0 },
  hover: { x: -5 },
};

const EditorNavigation: FC<Props> = ({ onSaveQuery }) => {
  const dispatch = useDispatch();
  const actionsContainer = useRef(null);

  const [actionsMenu, setActionsMenuVisibility] = useState(false);
  const { exists, displayName, name, refreshRate, tags, cached } = useSelector(
    getSavedQuery
  );
  const isSavingQuery = useSelector(getQueriesSaving);
  const isModalVisible = useSelector(getQuerySettingsModalVisibility);

  const outsideActionsMenuClick = useCallback(
    (e) => {
      if (
        actionsMenu &&
        actionsContainer.current &&
        !actionsContainer.current.contains(e.target)
      ) {
        setActionsMenuVisibility(false);
      }
    },
    [actionsContainer, actionsMenu]
  );

  useEffect(() => {
    if (actionsMenu) {
      document.addEventListener('click', outsideActionsMenuClick);
    }

    return () => document.removeEventListener('click', outsideActionsMenuClick);
  }, [actionsMenu, actionsContainer]);

  return (
    <Container>
      <WrapperVertical>
        <WrapperHorizontal>
          <QueryName>
            {displayName ? displayName : text.newQueryTitle}
          </QueryName>
          <QueryMeta>
            {cached && (
              <Tag>
                <Badge variant="green">
                  <span data-testid="cache-badge">{text.cachedLabel}</span>{' '}
                  {`(${refreshRate}${text.cacheUnits})`}
                </Badge>
              </Tag>
            )}
            {tags.map((tag) => (
              <Tag key={tag}>
                <Badge variant="purple">{tag}</Badge>
              </Tag>
            ))}
          </QueryMeta>
        </WrapperHorizontal>
        <BackLink
          onClick={() => dispatch(switchToQueriesList())}
          whileHover="hover"
          initial="initial"
          animate="initial"
        >
          <motion.div variants={iconVariants}>
            <Icon type="button-arrow-left" fill={colors.blue[300]} />
          </motion.div>
          <BackLinkText>{text.backLink}</BackLinkText>
        </BackLink>
      </WrapperVertical>
      <Menu>
        <MenuItem>
          <CircleButton
            icon={
              <span data-testid="query-settings">
                <Icon type="settings" />
              </span>
            }
            onClick={() =>
              dispatch(
                showQuerySettingsModal(SettingsModalSource.QUERY_SETTINGS)
              )
            }
          />
        </MenuItem>
        <MenuItem ref={actionsContainer}>
          <CircleButton
            icon={<Icon type="actions" />}
            onClick={() => setActionsMenuVisibility(!actionsMenu)}
          />
          <Dropdown
            isOpen={actionsMenu}
            fullWidth={false}
            motion={actionsDropdownMotion}
          >
            <ActionsMenu
              onRemoveQuery={() => {
                setActionsMenuVisibility(false);
                dispatch(deleteQuery(name));
              }}
            />
          </Dropdown>
        </MenuItem>
        <MenuItem>
          <Button
            data-testid="save-query"
            variant="secondary"
            style="solid"
            isDisabled={isSavingQuery}
            onClick={() => {
              if (!exists) {
                dispatch(
                  showQuerySettingsModal(SettingsModalSource.FIRST_QUERY_SAVE)
                );
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
