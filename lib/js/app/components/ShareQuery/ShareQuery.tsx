import React, { FC, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Tooltip } from '@keen.io/ui-core';

import { Container, TooltipContent } from './ShareQuery.styles';
import { useTooltipHandler } from '../../hooks';

import text from './text.json';
import { HIDE_TIME } from './constants';

type Props = {
  /** Click event handler */
  onClick: () => void;
};

export const tooltipMotion = {
  transition: { duration: 0.3 },
  exit: { opacity: 0 },
};

const ShareQuery: FC<Props> = ({ onClick }) => {
  const containerRef = useRef(null);
  const hideTooltip = useRef(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
  });

  const { calculateTooltipPosition } = useTooltipHandler(containerRef);

  return (
    <Container ref={containerRef}>
      <AnimatePresence>
        {tooltip.visible && (
          <motion.div
            {...tooltipMotion}
            initial={{ opacity: 0, x: tooltip.x, y: tooltip.y }}
            animate={{
              x: tooltip.x,
              y: tooltip.y,
              opacity: 1,
            }}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
            }}
          >
            <Tooltip mode="dark" hasArrow={false}>
              <TooltipContent>{text.copyMessage}</TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        style="outline"
        variant="secondary"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (hideTooltip.current) clearTimeout(hideTooltip.current);
          const { tooltipX, tooltipY } = calculateTooltipPosition(e);

          setTooltip((state) => ({
            ...state,
            visible: true,
            x: tooltipX,
            y: tooltipY,
          }));

          hideTooltip.current = setTimeout(() => {
            setTooltip({
              visible: false,
              x: 0,
              y: 0,
            });
          }, HIDE_TIME);
          onClick();
        }}
      >
        {text.label}
      </Button>
    </Container>
  );
};

export default ShareQuery;