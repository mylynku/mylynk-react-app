import React from 'react';

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  customMessage?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry, customMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-8">
      <h2 className="text-2xl font-bold text-lynk-dark">
        {customMessage || 'Something went wrong'}
      </h2>
      {error && (
        <p className="text-gray-500 text-sm">
          {error.message}
        </p>
      )}
      <div className="flex gap-2 mt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary"
          >
            Try Again
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;