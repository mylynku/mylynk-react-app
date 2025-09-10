import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import ErrorFallback from './ErrorFallback';

interface ApiError {
  message: string;
  code?: string;
  status?: number;
  data?: any;
}

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
  componentName?: string;
}

const ApiErrorFallback: React.FC<{ error: Error; onRetry?: () => void }> = ({ error, onRetry }) => {
  const apiError = error as ApiError;
  
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-8">
      <h2 className="text-2xl font-bold text-lynk-dark">API Error</h2>
      <p className="text-gray-600 text-center">
        {apiError.status 
          ? `Error ${apiError.status}: ${apiError.message}`
          : apiError.message}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="btn-primary mt-4"
        >
          Retry
        </button>
      )}
      <button 
        onClick={() => window.location.reload()}
        className="btn-secondary mt-2"
      >
        Reload Page
      </button>
    </div>
  );
};

const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({ children, onRetry, componentName }) => {
  return (
    <ErrorBoundary 
      fallback={<ApiErrorFallback error={new Error()} onRetry={onRetry} />}
      logEndpoint="/logs/api-errors"
      componentName={componentName}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ApiErrorBoundary;