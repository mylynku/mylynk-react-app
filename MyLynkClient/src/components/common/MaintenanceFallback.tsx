import React from 'react';
import ErrorFallback from './ErrorFallback';

const MaintenanceFallback: React.FC = () => {
  return (
    <ErrorFallback 
      customMessage="Maintenance in Progress"
    />
  );
};

export default MaintenanceFallback;