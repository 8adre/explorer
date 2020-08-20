import styled from 'styled-components';
import { transparentize } from 'polished';
import { colors } from '@keen.io/colors';

export const EditorActions = styled.div`
  display: flex;
  padding: 0 20px 20px 20px;
  background: ${transparentize(0.9, colors.blue[100])};
`;

export const ClearButton = styled.div`
  margin-left: 10px;
`;

export const CreatorContainer = styled.div`
  padding: 20px;
  background: ${transparentize(0.9, colors.blue[100])};
`;
