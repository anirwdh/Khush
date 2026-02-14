import { storageService } from '../storage/storage';

export const TokenStorage = {
  setAccessToken: async (token) => {
    console.log('🔐 TOKEN STORAGE: Setting access token');
    console.log('📝 Token length:', token ? token.length : 0);
    console.log('📝 Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
    await storageService.setToken(token);
    console.log('✅ Access token stored successfully');
  },

  getAccessToken: async () => {
    console.log('🔍 TOKEN STORAGE: Retrieving access token');
    const token = await storageService.getToken();
    console.log('🔑 Token found:', token ? 'YES' : 'NO');
    console.log('📝 Token length:', token ? token.length : 0);
    return token;
  },

  setUserId: async (id) => {
    console.log('👤 TOKEN STORAGE: Setting User ID');
    console.log('📝 User ID:', id);
    await storageService.setItem('userId', id);
    console.log('✅ User ID stored successfully');
  },

  getUserId: async () => {
    console.log('👤 TOKEN STORAGE: Retrieving User ID');
    const userId = await storageService.getItem('userId');
    console.log('👤 User ID found:', userId || 'NONE');
    return userId;
  },

  clear: async () => {
    console.log('🗑️ TOKEN STORAGE: Clearing all tokens');
    await storageService.removeToken();
    await storageService.removeItem('userId');
    console.log('✅ Token storage cleared successfully');
  },

  // Helper to check if user is authenticated
  isAuthenticated: async () => {
    console.log('🔍 TOKEN STORAGE: Checking authentication status');
    const token = await TokenStorage.getAccessToken();
    const userId = await TokenStorage.getUserId();
    const isAuth = !!(token && userId);
    console.log('📝 Authentication status:', isAuth ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
    console.log('📝 Has token:', !!token);
    console.log('📝 Has userId:', !!userId);
    return isAuth;
  }
};
