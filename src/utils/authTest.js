import { TokenStorage } from './tokenStorage';

export const AuthTest = {
  // Test token storage functionality
  testTokenStorage: async () => {
    console.log('🧪 AUTH TEST: Testing Token Storage');
    console.log('='.repeat(50));
    
    try {
      // Test setting tokens
      await TokenStorage.setAccessToken('test_access_token_12345');
      await TokenStorage.setUserId('test_user_id_67890');
      
      // Test getting tokens
      const accessToken = await TokenStorage.getAccessToken();
      const userId = await TokenStorage.getUserId();
      
      // Test authentication status
      const isAuth = await TokenStorage.isAuthenticated();
      
      console.log('🧪 Test Results:');
      console.log('✅ Access Token:', accessToken);
      console.log('✅ User ID:', userId);
      console.log('✅ Is Authenticated:', isAuth);
      
      // Test clearing tokens
      await TokenStorage.clear();
      
      const clearedToken = await TokenStorage.getAccessToken();
      const clearedUserId = await TokenStorage.getUserId();
      const isAuthAfterClear = await TokenStorage.isAuthenticated();
      
      console.log('🧪 After Clear Results:');
      console.log('✅ Access Token:', clearedToken);
      console.log('✅ User ID:', clearedUserId);
      console.log('✅ Is Authenticated:', isAuthAfterClear);
      
      console.log('='.repeat(50));
      console.log('🧪 AUTH TEST: Token Storage Test Complete');
    } catch (error) {
      console.error('❌ AUTH TEST: Error in token storage test:', error);
    }
  },

  // Test current authentication state
  checkCurrentAuthState: async () => {
    console.log('🔍 AUTH TEST: Checking Current Authentication State');
    console.log('='.repeat(50));
    
    try {
      const isAuth = await TokenStorage.isAuthenticated();
      const token = await TokenStorage.getAccessToken();
      const userId = await TokenStorage.getUserId();
      
      console.log('🔍 Current State:');
      console.log('📝 Authenticated:', isAuth);
      console.log('📝 Has Token:', !!token);
      console.log('📝 Has User ID:', !!userId);
      
      if (token) {
        console.log('📝 Token Length:', token.length);
        console.log('📝 Token Preview:', token.substring(0, 20) + '...');
      } else {
        console.log('📝 Token Length: undefined');
        console.log('📝 Token Preview: No token available');
      }
      
      console.log('='.repeat(50));
      console.log('🔍 AUTH TEST: Auth State Check Complete');
    } catch (error) {
      console.error('❌ AUTH TEST: Error checking auth state:', error);
    }
  },

  // Simulate token expiry and refresh
  testTokenExpiryFlow: async () => {
    console.log('⏰ AUTH TEST: Simulating Token Expiry Flow');
    console.log('='.repeat(50));
    
    try {
      // Set a test token
      await TokenStorage.setAccessToken('expired_token_12345');
      await TokenStorage.setUserId('test_user_67890');
      
      console.log('⏰ Test token set');
      console.log('⏰ In real scenario, next API call would trigger refresh');
      
      // Check state
      const isAuth = await TokenStorage.isAuthenticated();
      console.log('⏰ Authentication Status:', isAuth);
      
      console.log('='.repeat(50));
      console.log('⏰ AUTH TEST: Token Expiry Test Complete');
    } catch (error) {
      console.error('❌ AUTH TEST: Error in token expiry test:', error);
    }
  }
};
