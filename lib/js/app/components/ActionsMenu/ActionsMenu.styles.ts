import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import { motion } from 'framer-motion';
import { colors } from '@keen.io/colors';

export const Container = styled.div`
  padding: 10px 0;
  width: 160px;
`;

export const DeleteQueryItem = styled.span`
  color: ${colors.red[500]};
`;

export const MutedText = styled.div`
  padding: 5px 15px;
  font-family: 'Lato Regular', sans-serif;
  font-size: 14px;
  color: ${transparentize(0.5, colors.black[100])};
`;

export const TooltipMotion = styled(motion.div)`
  position: absolute;
  left: -100%;
  top: 0;
  z-index: 1;
`;

export const TooltipContent = styled.div`
  font-family: 'Lato Regular', sans-serif;
  font-size: 14px;
  line-height: 17px;
  white-space: nowrap;

  color: ${colors.white[500]};
`;

export const ExportDataWrapper = styled.div`
  position: relative;
`;

export const ExportDataLinks = styled.div<{ isActive: boolean }>`
  ${(props) =>
    !props.isActive &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
    `}

  * {
    ${(props) =>
      !props.isActive &&
      css`
        pointer-events: none;
      `}
  }
`;
