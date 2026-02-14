import axios from 'axios';
import { TokenStorage } from '../../utils/tokenStorage';
import { API_CONFIG } from '../../config/api.config';
import { getDeviceId } from '../deviceService';

console.log('🚀 PRODUCTION API CLIENT INITIALIZATION');
console.log('Base URL:', API_CONFIG.BASE_URL);
console.log('Timeout:', API_CONFIG.TIMEOUT);

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // IMPORTANT for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

console.log('✅ Production API client created with cookie support');

// 🔥 Race condition protection
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  console.log('🔄 Processing failed queue:', failedQueue.length, 'requests');
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 📤 Request Interceptor - Attach Access Token
api.interceptors.request.use(
  async (config) => {
    console.log('📤 PRODUCTION API REQUEST START');
    console.log('📤 Method:', config.method?.toUpperCase());
    console.log('📤 URL:', config.baseURL + config.url);
    console.log('📤 Headers:', JSON.stringify(config.headers, null, 2));
    
    const token = await TokenStorage.getAccessToken();
    const deviceId = await getDeviceId();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Authorization header added successfully');
      console.log('📝 Bearer token length:', token.length);
    } else {
      console.log('⚠️ No access token found - request will be unauthenticated');
    }
    
    if (deviceId) {
      config.headers['x-device-id'] = deviceId;
      console.log('📱 Device ID header added:', deviceId);
    }
    
    console.log('📤 Final Request Headers:', JSON.stringify(config.headers, null, 2));
    console.log('📤 Request Data:', config.data ? JSON.stringify(config.data) : 'NONE');
    console.log('🚀 PRODUCTION API REQUEST END');
    
    return config;
  },
  (error) => {
    console.error('❌ REQUEST INTERCEPTOR ERROR');
    console.error('❌ Error:', error);
    return Promise.reject(error);
  }
);

// 📥 Response Interceptor - Auto Refresh Logic
api.interceptors.response.use(
  (response) => {
    console.log('📥 PRODUCTION API RESPONSE START');
    console.log('📥 Status:', response.status);
    console.log('📥 URL:', response.config.url);
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));
    console.log('📥 Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('📥 PRODUCTION API RESPONSE END');
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.log('🚨 PRODUCTION API ERROR START');
    console.log('🚨 Error Status:', error.response?.status);
    console.log('🚨 Error URL:', originalRequest.url);
    console.log('🚨 Error Message:', error.message);
    console.log('🚨 Error Data:', error.response?.data ? JSON.stringify(error.response.data) : 'NONE');
    console.log('🚨 Original Request _retry flag:', originalRequest._retry);
    console.log('🚨 Is Refreshing:', isRefreshing);
    console.log('🚨 Failed Queue Length:', failedQueue.length);
    
    // 🔥 Auto-refresh logic for 401 responses
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 401 Detected - Starting token refresh process');
      
      if (isRefreshing) {
        console.log('⏳ Refresh already in progress - queuing request...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            console.log('🔄 Retrying queued request with new token');
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            console.error('❌ Queued request failed:', err);
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      console.log('🔄 Starting fresh token refresh...');

      try {
        const userId = await TokenStorage.getUserId();
        if (!userId) {
          throw new Error('No userId found for token refresh');
        }

        console.log('🔄 Calling refresh endpoint...');
        console.log('🔄 Refresh URL:', `${API_CONFIG.BASE_URL}/user/auth/newAccessToken`);
        console.log('🔄 User ID:', userId);
        
        const refreshResponse = await axios.post(
          `${API_CONFIG.BASE_URL}/user/auth/newAccessToken`,
          { userId },
          { 
            withCredentials: true,
            timeout: 10000
          }
        );

        console.log('🔄 Refresh response received');
        console.log('🔄 Refresh Status:', refreshResponse.status);
        console.log('🔄 Refresh Data:', JSON.stringify(refreshResponse.data, null, 2));

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        
        if (!newAccessToken) {
          throw new Error('No new access token received from refresh endpoint');
        }

        console.log('✅ New access token received successfully');
        console.log('📝 New token length:', newAccessToken.length);
        TokenStorage.setAccessToken(newAccessToken);
        
        // Process queued requests with new token
        console.log('🔄 Processing', failedQueue.length, 'queued requests');
        processQueue(null, newAccessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        console.log('🔄 Retrying original request with new token');
        return api(originalRequest);

      } catch (refreshError) {
        console.error('❌ TOKEN REFRESH FAILED');
        console.error('❌ Refresh Error:', refreshError.message);
        console.error('❌ Refresh Status:', refreshError.response?.status);
        console.error('❌ Refresh Data:', refreshError.response?.data);
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Clear tokens and force logout
        console.log('🗑️ Clearing tokens due to refresh failure');
        TokenStorage.clear();
        
        // Emit logout event for navigation handling
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          console.log('🚨 Emitting global logout event');
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
        console.log('🔄 Token refresh process completed');
      }
    }

    console.log('🚨 PRODUCTION API ERROR END');
    
    // Handle other HTTP errors
    if (error.response?.status >= 500) {
      error.customMessage = 'Server error. Please try again later.';
      console.log('🚨 Server error detected');
    } else if (error.response?.status === 403) {
      error.customMessage = 'Access denied. You do not have permission.';
      console.log('🚨 Access denied error detected');
    } else if (error.code === 'NETWORK_ERROR') {
      error.customMessage = 'Network connection failed. Please check your internet connection.';
      console.log('🚨 Network error detected');
    }

    return Promise.reject(error);
  }
);

export default api;
