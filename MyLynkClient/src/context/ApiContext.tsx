import React, { createContext, useContext, useState } from 'react';

interface ApiError {
  message: string;
  code?: string;
  status?: number;
  data?: any;
}

interface ApiState {
  loading: boolean;
  error: ApiError | null;
}

interface ApiContextType {
  apiState: Record<string, ApiState>;
  setApiState: React.Dispatch<React.SetStateAction<Record<string, ApiState>>>;
}

const ApiContext = createContext<ApiContextType>({
  apiState: {},
  setApiState: () => {}
});

export const ApiProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [apiState, setApiState] = useState<Record<string, ApiState>>({});
  return (
    <ApiContext.Provider value={{ apiState, setApiState }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApiState = (key: string) => {
  const { apiState } = useContext(ApiContext);
  return apiState[key] || { loading: false, error: null };
};

export const getApiContext = () => ApiContext;