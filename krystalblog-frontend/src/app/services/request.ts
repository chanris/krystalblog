import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

type ApiRequest = Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete'> & {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
};

const request = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
}) as ApiRequest;

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response) => {
    const result = response.data;
    if (result && typeof result === 'object' && 'code' in result && result.code !== 200) {
      const error = new Error(result.message || '请求失败') as Error & {
        code?: number;
        response?: any;
      };
      error.code = result.code;
      error.response = response;
      return Promise.reject(error);
    }
    return result;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default request;
