import React from 'react';
import ErrorFallback from './ErrorFallback';

const NetworkErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <ErrorFallback 
      customMessage="Network Connection Error"
      onRetry={onRetry}
    />
  );
};

export default NetworkErrorFallback;