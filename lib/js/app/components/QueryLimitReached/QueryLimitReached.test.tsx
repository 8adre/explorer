import React from 'react';
import { render } from '@testing-library/react';

import QueryLimitReached from './QueryLimitReached';
import text from './text.json';

test('renders exceed query limit message', () => {
  const { queryByText } = render(<QueryLimitReached />);
  const title = queryByText(text.title);
  const firstLine = queryByText(text.first_line);
  const secondLine = queryByText(text.second_line);

  expect(title).toBeInTheDocument();
  expect(firstLine).toBeInTheDocument();
  expect(secondLine).toBeInTheDocument();
});

test('renders upgrade subscription anchor', () => {
  const { queryByText } = render(
    <QueryLimitReached upgradeSubscriptionUrl="http://test.keen.io" />
  );
  const title = queryByText(text.title);
  const firstLine = queryByText(text.first_line);
  const secondLine = queryByText(text.second_line);

  expect(title).toBeInTheDocument();
  expect(firstLine).toBeNull();
  expect(secondLine).toBeInTheDocument();
});
