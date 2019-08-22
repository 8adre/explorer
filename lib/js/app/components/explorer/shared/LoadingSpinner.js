import React from 'react';

const LoadingSpinner = props => (
  <div
    className='loading-spinner'
    {...props}
  >
    <i className='fas fa-cog fa-spin' />
  </div>
);

export default LoadingSpinner;
