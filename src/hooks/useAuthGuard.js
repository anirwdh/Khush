import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { TokenStorage } from '../utils/tokenStorage';

export const useAuthGuard = () => {
  const navigation = useNavigation();

  const requireAuth = useCallback(async (redirectTo, redirectParams = {}, action = null, previousTab = null) => {
    try {
      // Check if user is authenticated
      const token = await TokenStorage.getAccessToken();
      
      if (!token) {
        // User is not logged in, navigate to login with redirect info
        navigation.navigate('LoginScreen', {
          redirectTo,
          redirectParams,
          action, // Store the pending action (e.g., 'wishlist', 'cart', etc.)
          previousTab, // Store the previous tab for "do it later" functionality
        });
        return false;
      }
      
      // User is authenticated
      return true;
    } catch (error) {
      console.log('Error checking auth status:', error);
      // Assume not logged in if there's an error
      navigation.navigate('LoginScreen', {
        redirectTo,
        redirectParams,
        action,
        previousTab,
      });
      return false;
    }
  }, [navigation]);

  return { requireAuth };
};
