import apiClient from './apiClient.production';
import { API_CONFIG } from '../../config/api.config';
import { createApiSuccessResponse, createApiErrorResponse } from '../../utils/apiHelpers';
import { TokenStorage } from '../../utils/tokenStorage';

export const authService = {
  register: async (userData) => {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.AUTH.REGISTER;
      const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
      
      console.log('=== REGISTRATION DEBUG ===');
      console.log('Base URL:', API_CONFIG.BASE_URL);
      console.log('Endpoint:', endpoint);
      console.log('Full URL:', fullUrl);
      console.log('User Data:', userData);

      const response = await apiClient.post(endpoint, userData);
      
      // Handle successful registration - OTP sent
      return createApiSuccessResponse(response.data, 'OTP sent successfully');
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return createApiErrorResponse(error);
    }
  },

  verifyOtp: async (otpData) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, otpData);
      
      if (response.data.accessToken) {
        TokenStorage.setAccessToken(response.data.accessToken);
        
        // Store userId if available
        if (response.data.userId) {
          TokenStorage.setUserId(response.data.userId);
        }
        
        // Store user data if available
        if (response.data.user) {
          // Store user profile data separately if needed
          console.log('✅ User data received:', response.data.user);
        }
      }
      
      return createApiSuccessResponse(response.data, 'Phone number verified successfully');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  resendOtp: async (userId) => {
    try {
      console.log('🔄 AUTH SERVICE: Resending OTP for userId:', userId);
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.RESEND_OTP, { userId });
      console.log('🔄 AUTH SERVICE: Resend OTP response:', response.data);
      return createApiSuccessResponse(response.data, 'OTP resent successfully');
    } catch (error) {
      console.error('🔄 AUTH SERVICE: Resend OTP error:', error);
      return createApiErrorResponse(error);
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      
      // Note: Login only sends OTP, doesn't return tokens
      // Tokens are returned after OTP verification
      
      return createApiSuccessResponse(response.data, 'OTP sent successfully');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  logout: async () => {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      
      // Clear local storage
      TokenStorage.clear();
      
      return createApiSuccessResponse(null, 'Logout successful');
    } catch (error) {
      // Even if API call fails, clear local storage
      TokenStorage.clear();
      return createApiErrorResponse(error);
    }
  },

  refreshToken: async () => {
    try {
      const userId = await TokenStorage.getUserId();
      if (!userId) {
        throw new Error('No userId found for token refresh');
      }
      
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, { userId });
      
      if (response.data.accessToken) {
        TokenStorage.setAccessToken(response.data.accessToken);
      }
      
      return createApiSuccessResponse(response.data, 'Token refreshed');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return createApiSuccessResponse(response.data, 'Password reset email sent');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword
      });
      return createApiSuccessResponse(response.data, 'Password reset successful');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.GET_PROFILE);
      
      // Store/Update user data if needed
      if (response.data) {
        console.log('✅ User profile fetched:', response.data);
      }
      
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
      
      // Update local user data if needed
      if (response.data) {
        console.log('✅ Profile updated:', response.data);
      }
      
      return createApiSuccessResponse(response.data, 'Profile updated successfully');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  // New method for manual token refresh
  refreshAccessToken: async () => {
    try {
      const userId = await TokenStorage.getUserId();
      if (!userId) {
        throw new Error('No userId found for token refresh');
      }
      
      const response = await apiClient.post('/user/auth/newAccessToken', { userId });
      
      if (response.data?.data?.accessToken) {
        TokenStorage.setAccessToken(response.data.data.accessToken);
        return createApiSuccessResponse(response.data.data, 'Access token refreshed');
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  // Helper method to check authentication status
  isAuthenticated: () => {
    return TokenStorage.isAuthenticated();
  }
};
