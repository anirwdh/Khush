import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import SVGComponent from '../../assets/Icons/SplashBg';
import { authService } from '../../services/api/authService';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector(state => state.auth);

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      console.log('🔍 SPLASH: Checking authentication status...');
      console.log('🔍 SPLASH: Is authenticated:', isAuthenticated);
      console.log('🔍 SPLASH: Has token:', !!token);
      console.log('🔍 SPLASH: Has user:', !!user);

      // If user is already authenticated, verify token and navigate to home
      if (isAuthenticated && token) {
        try {
          console.log('🔍 SPLASH: Verifying existing token...');
          const isValid = await authService.isAuthenticated();
          
          if (isValid) {
            console.log('✅ SPLASH: Token valid, navigating to Home');
            navigation.reset({
              index: 0,
              routes: [{ name: 'HomeScreen' }],
            });
            return;
          } else {
            console.log('⚠️ SPLASH: Token invalid, clearing auth state');
            dispatch({ type: 'auth/logout' });
          }
        } catch (error) {
          console.log('🚨 SPLASH: Token verification failed:', error);
          dispatch({ type: 'auth/logout' });
        }
      }

      // If not authenticated or token invalid, proceed with normal flow
      console.log('📱 SPLASH: No valid authentication, showing splash');
    };

    // Add a small delay to show splash screen
    const timer = setTimeout(checkAuthAndNavigate, 1500);

    return () => clearTimeout(timer);
  }, [navigation, dispatch, isAuthenticated, token, user]);

  const handlePress = () => {
    // Only navigate directly to Home if user has valid token (is logged in)
    if (isAuthenticated && token) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    } else {
      // If not logged in, go to SplashScreen2 (onboarding flow)
      navigation.navigate('SplashScreen2');
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={1}>
      <SVGComponent 
        width={width} 
        height={height} 
        style={styles.background}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },

});

export default SplashScreen;