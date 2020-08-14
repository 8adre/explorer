import React from 'react';
import { render } from '@testing-library/react';

import VisualizationPlaceholder from './VisualizationPlaceholder';

import text from './text.json';

test("render placeholder with loading indicator", () => {
  const { queryByText } = render(<VisualizationPlaceholder isLoading />);
  const loadingPlaceholder = queryByText(text.loadingPlaceholder);
  const placeholder = queryByText(text.placeholder);
  expect(loadingPlaceholder).toBeInTheDocument();
  expect(placeholder).toBeNull();
});

test("render visualization placeholder", () => {
  const { queryByText } = render(<VisualizationPlaceholder isLoading={false} />);
  const loadingPlaceholder = queryByText(text.loadingPlaceholder);
  const placeholder = queryByText(text.placeholder);
  expect(loadingPlaceholder).toBeNull();
  expect(placeholder).toBeInTheDocument();
});
