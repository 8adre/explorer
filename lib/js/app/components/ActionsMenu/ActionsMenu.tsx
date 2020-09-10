import React, { FC } from 'react';
import { DropdownMenu } from '@keen.io/ui-core';

import { Container, DeleteQueryItem } from './ActionsMenu.styles';

import text from './text.json';

type Props = {
  /** Remove query event handler */
  onRemoveQuery: () => void;
};

const ActionsMenu: FC<Props> = ({ onRemoveQuery }) => (
  <Container>
    <DropdownMenu.Container>
      <DropdownMenu.Item>Example #1</DropdownMenu.Item>
      <DropdownMenu.Divider />
      <DropdownMenu.Item onClick={onRemoveQuery}>
        <DeleteQueryItem>{text.deleteQuery}</DeleteQueryItem>
      </DropdownMenu.Item>
    </DropdownMenu.Container>
  </Container>
);

export default ActionsMenu;
