import React from 'react';
import ErrorFallback from './ErrorFallback';

const NotFoundFallback: React.FC = () => {
  return (
    <ErrorFallback 
      customMessage="Page Not Found"
    />
  );
};

export default NotFoundFallback;