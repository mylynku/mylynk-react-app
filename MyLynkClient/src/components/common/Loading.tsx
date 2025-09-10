import React from 'react';

type LoadingVariant = 'spinner' | 'dots' | 'skeleton' | 'progress';

interface LoadingProps {
  variant?: LoadingVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  className = '',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={`flex space-x-2 ${sizeClasses[size]}`}>
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" />
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        );
      case 'skeleton':
        return (
          <div className={`animate-pulse ${sizeClasses[size]} bg-gray-200 rounded`} />
        );
      case 'progress':
        return (
          <div className={`w-full ${sizeClasses[size]}`}>
            <div className="h-1 w-full bg-gray-200">
              <div className="h-1 bg-blue-500 animate-progress" />
            </div>
          </div>
        );
      default: // spinner
        return (
          <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClasses[size]}`} />
        );
    }
  };

  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'h-screen' : ''} ${className}`}>
      {renderVariant()}
    </div>
  );
};

export default Loading;