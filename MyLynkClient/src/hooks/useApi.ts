import { useState } from 'react';
import { ApiResponse } from '../services/api';

interface ApiError {
  message: string;
  code?: string;
  status?: number;
  data?: any;
}

interface ApiState<T> {
  loading: boolean;
  error: ApiError | null;
  data: T | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    loading: false,
    error: null,
    data: null
  });

  const callApi = async (
    apiCall: () => Promise<ApiResponse<T>>,
    onSuccess?: (data: T) => void,
    onError?: (error: ApiError) => void
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall();
      setState({
        loading: false,
        error: null,
        data: response.data
      });
      if (onSuccess) onSuccess(response.data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      setState({
        loading: false,
        error: apiError,
        data: null
      });
      if (onError) onError(apiError);
      throw apiError;
    }
  };

  return {
    ...state,
    callApi
  };
}