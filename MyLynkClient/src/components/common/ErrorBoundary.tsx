import { Component, ReactNode } from 'react';
import { post } from '../../services/api';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  logEndpoint?: string;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { logEndpoint = '/logs/errors', componentName = 'Unknown' } = this.props;
    
    const errorData = {
      timestamp: new Date().toISOString(),
      component: componentName,
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    };

    // Log error to backend if endpoint provided
    if (logEndpoint) {
      post(logEndpoint, errorData).catch(() => {
        console.error('Failed to log error to backend', errorData);
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;