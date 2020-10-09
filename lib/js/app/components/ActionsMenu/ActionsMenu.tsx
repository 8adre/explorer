import React, { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DropdownMenu, Tooltip } from '@keen.io/ui-core';
import { AnimatePresence } from 'framer-motion';

import { getQueryResults } from '../../modules/queries';

import {
  Container,
  DeleteQueryItem,
  MutedText,
  ExportDataWrapper,
  ExportDataLinks,
  TooltipContent,
  TooltipMotion,
} from './ActionsMenu.styles';
import text from './text.json';

import {
  shareQueryUrl,
  exportChartToImage,
  exportChartToJson,
  showEmbedModal,
} from '../../modules/app';

type Props = {
  /** Is new query */
  isNewQuery: boolean;
  /** Remove query event handler */
  onRemoveQuery: () => void;
  /** Hide menu */
  onHideMenu: () => void;
};

const tooltipMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const ActionsMenu: FC<Props> = ({ isNewQuery, onRemoveQuery, onHideMenu }) => {
  const dispatch = useDispatch();
  const queryResults = useSelector(getQueryResults);
  const [tooltip, showTooltip] = useState(false);
  return (
    <Container>
      <DropdownMenu.Container>
        <MutedText>{text.exportResult}</MutedText>
        <ExportDataWrapper
          onMouseEnter={() => !queryResults && showTooltip(true)}
          onMouseLeave={() => tooltip && showTooltip(false)}
        >
          <AnimatePresence>
            {tooltip && (
              <TooltipMotion {...tooltipMotion}>
                <Tooltip hasArrow={false} mode="dark">
                  <TooltipContent>{text.tooltip}</TooltipContent>
                </Tooltip>
              </TooltipMotion>
            )}
          </AnimatePresence>
          <ExportDataLinks isActive={queryResults}>
            <DropdownMenu.Item
              onClick={() => {
                dispatch(exportChartToImage());
                onHideMenu();
              }}
            >
              {text.image}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => {
                dispatch(exportChartToJson());
                onHideMenu();
              }}
            >
              {text.json}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => {
                console.log('generate csv');
                onHideMenu();
              }}
            >
              {text.csv}
            </DropdownMenu.Item>
          </ExportDataLinks>
        </ExportDataWrapper>
        <DropdownMenu.Divider />
        {!isNewQuery && (
          <DropdownMenu.Item
            onClick={() => {
              onRemoveQuery();
              onHideMenu();
            }}
          >
            <DeleteQueryItem>{text.deleteQuery}</DeleteQueryItem>
          </DropdownMenu.Item>
        )}
        {!isNewQuery && <DropdownMenu.Divider />}
        <DropdownMenu.Item
          onClick={() => {
            dispatch(shareQueryUrl());
            onHideMenu();
          }}
        >
          {text.shareQuery}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            dispatch(showEmbedModal());
            onHideMenu();
          }}
        >
          {text.embedHtml}
        </DropdownMenu.Item>
      </DropdownMenu.Container>
    </Container>
  );
};

export default ActionsMenu;
