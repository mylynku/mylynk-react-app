import React from 'react';

const GlobalErrorFallback: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-8 bg-lynk-light">
      <h2 className="text-3xl font-bold text-lynk-dark">Critical Error</h2>
      <p className="text-gray-600 text-center max-w-md">
        The application encountered a critical error. Please try reloading the page.
        If the problem persists, contact support.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="btn-primary mt-4"
      >
        Reload Application
      </button>
    </div>
  );
};

export default GlobalErrorFallback;