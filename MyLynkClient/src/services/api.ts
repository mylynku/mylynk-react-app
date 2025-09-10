import axios, { InternalAxiosRequestConfig } from 'axios';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

export interface Availability {
  day: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface LynkerProfile {
  _id: string;
  name: string;
  photo?: string;
  rating?: number;
  reviewCount?: number;
  rate?: number;
  category?: string;
  tags?: string[];
  bio?: string;
  location?: string;
  memberSince?: string;
  totalSessions?: number;
  responseTime?: string;
  languages?: string[];
  education?: string;
  experience?: string;
  services?: Service[];
  availability?: Availability[];
  reviews?: Review[];
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
}

interface ApiError {
  message: string;
  code?: string;
  status?: number;
  data?: any;
}

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This ensures cookies are sent with requests
});

// Request interceptor - No longer handles Authorization headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Remove any token handling - cookies are handled automatically
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: error.message,
      code: error.code,
    };

    if (error.response) {
      apiError.status = error.response.status;
      apiError.data = error.response.data;
    }

    return Promise.reject(apiError);
  }
);

export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return api.get<T>(url, config);
};

export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return api.post<T>(url, data, config);
};

export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return api.put<T>(url, data, config);
};

export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return api.delete<T>(url, config);
};

export default api;