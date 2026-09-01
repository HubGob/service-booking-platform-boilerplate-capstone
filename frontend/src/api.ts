/// <reference types="vite/client" />

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const root: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: root,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token: string | null = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<never> => {
    const original: any = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken: string | null = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${root}/api/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch (e) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;