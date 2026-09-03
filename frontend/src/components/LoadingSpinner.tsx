import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = (): JSX.Element => (
  <div className="spinner-container" role="status" aria-label="Loading">
    <div className="spinner" />
  </div>
);

export default LoadingSpinner;
