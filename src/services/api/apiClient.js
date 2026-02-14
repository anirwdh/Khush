import axios from 'axios';
import { storageService } from '../../storage/storage';
import { API_CONFIG } from '../../config/api.config';
import { getDeviceId } from '../deviceService';

console.log('=== AXIOS INITIALIZATION ===');
console.log('Using Axios version:', axios.VERSION);
console.log('Base URL:', API_CONFIG.BASE_URL);
console.log('Timeout:', API_CONFIG.TIMEOUT);

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

console.log('Axios client created successfully');
console.log('Axios instance defaults:', {
  baseURL: apiClient.defaults.baseURL,
  timeout: apiClient.defaults.timeout,
  headers: apiClient.defaults.headers
});

apiClient.interceptors.request.use(
  (config) => {
    console.log('=== AXIOS REQUEST ===');
    console.log('Method:', config.method?.toUpperCase());
    console.log('URL:', config.baseURL + config.url);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    console.log('Axios Request ID:', config.metadata?.requestId || Date.now());
    
    try {
      const token = storageService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header added:', `Bearer ${token.substring(0, 20)}...`);
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    try {
      const deviceId = getDeviceId();
      if (deviceId) {
        config.headers['x-device-id'] = deviceId;
        console.log('Device ID header added:', deviceId);
      }
    } catch (error) {
      console.warn('Failed to get device ID:', error);
    }
    return config;
  },
  (error) => {
    console.error('=== AXIOS REQUEST ERROR ===');
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('=== AXIOS RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('URL:', response.config.url);
    console.log('Response Data:', response.data);
    console.log('Response Headers:', response.headers);
    console.log('Axios Response Time:', Date.now() - (response.config.metadata?.startTime || Date.now()) + 'ms');
    return response;
  },
  (error) => {
    console.log('=== AXIOS RESPONSE ERROR ===');
    console.log('Error URL:', error.config?.url);
    console.log('Error Status:', error.response?.status);
    console.log('Error Data:', error.response?.data);
    console.log('Error Message:', error.message);
    console.log('Is Axios Error:', error.isAxiosError);
    
    if (error.response?.status === 401) {
      try {
        storageService.removeToken();
      } catch (storageError) {
        console.warn('Failed to remove auth token:', storageError);
      }
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      error.customMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.response?.status >= 500) {
      error.customMessage = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
