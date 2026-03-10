import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Animated, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoginBg from '../../assets/Icons/LoginBg';
import { authService } from '../../services/api/authService';
import { AuthTest } from '../../utils/authTest';

const { width, height } = Dimensions.get('window');

// Memoized dimension calculations
const DIMENSIONS = {
  width,
  height,
  slideOffset: height * 0.15,
  contentPadding: width * 0.07,
  titleFontSize: width * 0.12,
  subtitleFontSize: width * 0.038,
  phoneTop: height * 0.28,
  signupTop: height * 0.27,
  loginTop: height * 0.26,
  laterTop: height * 0.248,
};

const LoginScreen = ({ route }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);
  const navigation = useNavigation();
  
  // Get redirect parameters from route
  const redirectTo = route?.params?.redirectTo;
  const redirectParams = route?.params?.redirectParams || {};
  const pendingAction = route?.params?.action;
  const previousTab = route?.params?.previousTab;

  // Memoized keyboard handlers
  const handleKeyboardShow = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -DIMENSIONS.slideOffset,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleKeyboardHide = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePhoneChange = useCallback((text) => {
    // Only allow numbers
    const cleanedText = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleanedText);
  }, []);

  const handleLogin = useCallback(async () => {
    if (phoneNumber.length === 10) {
      Keyboard.dismiss();
      setIsLoading(true);
      
      try {
        const loginData = {
          countryCode: '+91',
          phoneNumber: phoneNumber
        };
        
        // Call login API
        const result = await authService.login(loginData);
        
        if (result.success) {
          // Extract userId from the correct location in response
          const userId = result.data?.userId || result.data?.data?.userId || result.data?.user?._id || result.data?._id;
          
          // Navigate to OTP verification screen with userId and redirect info
          navigation.navigate('VerificationScreen', { 
            phoneNumber: phoneNumber,
            countryCode: '+91',
            name: '', // No name for login
            userId: userId,
            isLogin: true, // Flag to distinguish login from signup
            // Pass redirect info to VerificationScreen
            redirectTo,
            redirectParams,
            pendingAction
          });
          
          // Show success message
          Alert.alert(
            'Login Successful',
            'OTP has been sent to your phone number',
            [{ text: 'OK' }]
          );
        } else {
          // Check if user doesn't exist (resource not found)
          if (result.message?.toLowerCase().includes('phone number not registered') || 
              result.message?.toLowerCase().includes('resource not found') || 
              result.message?.toLowerCase().includes('user not found') ||
              result.message?.toLowerCase().includes('not registered') ||
              result.message?.toLowerCase().includes('please register first')) {
            
            // Show alert and auto-navigate to signup screen
            Alert.alert(
              'Account Not Found',
              "You Haven't signed up yet. Redirecting to Sign Up...",
              [{ text: 'OK' }],
              { onDismiss: () => navigation.navigate('SignUpScreen') }
            );
          } else {
            // Show general error message
            Alert.alert(
              'Login Failed',
              result.message || 'Something went wrong. Please try again.',
              [{ text: 'OK' }]
            );
          }
        }
      } catch (error) {
        // Check if it's a 404 error (user not registered)
        if (error.response?.status === 404 || 
            error.message?.toLowerCase().includes('phone number not registered') ||
            error.response?.data?.message?.toLowerCase().includes('phone number not registered') ||
            error.response?.data?.message?.toLowerCase().includes('please register first')) {
          
          // Show alert and auto-navigate to signup screen
          Alert.alert(
            'Account Not Found',
            "You Haven't signed up yet. Redirecting to Sign Up...",
            [{ text: 'OK' }]
          );
          
          // Navigate immediately after showing alert
          setTimeout(() => {
            navigation.navigate('SignUpScreen');
          }, 100);
        } else {
          // Show general error message
          Alert.alert(
            'Login Error',
            error.response?.data?.message || error.message || 'Network error. Please check your connection and try again.',
            [{ text: 'OK' }]
          );
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Validation error
      Alert.alert(
        'Validation Error',
        'Please enter a valid 10-digit phone number',
        [{ text: 'OK' }]
      );
    }
  }, [phoneNumber, navigation]);

  const handleDoItLater = useCallback(() => {
    console.log('Do it later pressed');
    
    // If this was a wishlist or cart action, navigate back to previous screen instead of opening the respective screen
    if ((pendingAction === 'wishlist' || pendingAction === 'cart') && previousTab) {
      // Navigate to the screen corresponding to the previous tab
      switch (previousTab) {
        case 1: // Home
          navigation.replace('HomeScreen', { fromBottomTab: true });
          break;
        case 3: // Categories
          navigation.replace('CollectionsScreen', { fromBottomTab: true });
          break;
        case 4: // Cart
          navigation.replace('CartScreen', { fromBottomTab: true });
          break;
        case 5: // Profile
          navigation.replace('ProfileScreen', { fromBottomTab: true });
          break;
        default:
          // Fallback to Home if previous tab is unknown
          navigation.replace('HomeScreen', { fromBottomTab: true });
      }
    } else if (redirectTo === 'ProductDetail' || redirectTo === 'HomeScreen' || redirectTo === 'CollectionListingScreen') {
      // For these screens, just go back instead of navigating to avoid duplicates
      navigation.goBack();
    } else if (redirectTo) {
      // For other actions, navigate back to original screen (original behavior)
      navigation.replace(redirectTo, redirectParams);
    } else {
      // Default fallback to Home (original behavior)
      navigation.replace('HomeScreen');
    }
  }, [navigation, redirectTo, redirectParams, pendingAction, previousTab]);

  const handleSignup = useCallback(() => {
    console.log('Signup pressed');
    navigation.navigate('SignUpScreen');
  }, [navigation]);

  // Memoized input props
  const inputProps = useMemo(() => ({
    ref: inputRef,
    style: styles.mobileInput,
    value: phoneNumber,
    onChangeText: handlePhoneChange,
    placeholderTextColor: '#999',
    keyboardType: 'phone-pad',
    maxLength: 10,
    returnKeyType: 'done',
    blurOnSubmit: true,
    onSubmitEditing: Keyboard.dismiss,
    selectionColor: '#1a1a1a',
    autoCorrect: false,
    autoCapitalize: 'none',
    clearButtonMode: 'while-editing',
    importantForAutofill: 'no',
    textContentType: 'telephoneNumber',
  }), [phoneNumber, handlePhoneChange]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    // Test authentication system on component mount
    console.log('🧪 LOGIN SCREEN: Testing Authentication System');
    // Fire and forget the async call
    AuthTest.checkCurrentAuthState().catch(error => {
      console.error('❌ LOGIN SCREEN: Auth test error:', error);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [handleKeyboardShow, handleKeyboardHide]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.container}>
        {/* Background SVG */}
        <LoginBg style={styles.background} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Centered Title */}
          <Text style={styles.loginTitle}>Login</Text>

          {/* Centered Subtitle */}
          <Text style={styles.subtitle}>Let's login for explore continues</Text>

          {/* Phone Number Input Section */}
          <Animated.View style={[styles.phoneContainer, { transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.label}>Mobile No.</Text>

            <View style={styles.inputRow}>
              <Text style={styles.countryCode}>+91</Text>
            <TextInput {...inputProps} />
            </View>

            {/* Bottom Underline */}
            <View style={styles.underline} />
          </Animated.View>

          {/* Sign-up Link */}
          <TouchableOpacity onPress={handleSignup}>
            <Text style={styles.signupText}>
              Don't have an account? <Text style={styles.signupLink}>Sign-up</Text>
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[
              styles.loginButton,
              phoneNumber.length === 10 && !isLoading && styles.loginButtonActive
            ]} 
            onPress={handleLogin}
            disabled={phoneNumber.length !== 10 || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'SENDING OTP...' : 'LOGIN'}
            </Text>
          </TouchableOpacity>

          {/* Do It Later */}
          <TouchableOpacity 
            style={styles.laterContainer} 
            onPress={handleDoItLater}
            activeOpacity={0.6}
          >
            <Text style={styles.laterText}>DO IT LATER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: DIMENSIONS.contentPadding,
    paddingTop: height * 0.18,
    alignItems: 'center',
  },

  loginTitle: {
    opacity: 0.9,
    fontSize: DIMENSIONS.titleFontSize,
    fontWeight: '400',
    color: '#1a1a1a',
    fontFamily: 'Inter',
    marginBottom: height * 0.01,
    textAlign: 'center',
  },
  subtitle: {
    opacity: 0.6,
    fontSize: DIMENSIONS.subtitleFontSize,
    color: '#666',
    fontFamily: 'Nunitosans',
    marginBottom: height * 0.09,
    textAlign: 'center',
    lineHeight: width * 0.055,
  },

  /* Phone Input Styles */
  phoneContainer: {
    top: DIMENSIONS.phoneTop,
    width: '100%',
    marginBottom: height * 0.03,
  },
  label: {
    fontSize: width * 0.035,
    color: '#00000',
    marginBottom: height * 0.008,
    fontFamily: 'Interfont',
    alignSelf: 'flex-start',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: height * 0.055,
  },
  countryCode: {
    left: 8,
    fontSize: width * 0.042,
    fontWeight: '400',
    color: '#AFAFAF',
    fontFamily: 'Interfont',
    paddingRight: width * 0.03,
  },
  mobileInput: {
    flex: 1,
    fontSize: width * 0.042,
    color: '#1a1a1a',
    fontFamily: 'Interfont',
    paddingVertical: 0,
    height: '100%',
  },
  underline: {
    height: 1.3,
    backgroundColor: '#AFAFAF',
    width: '100%',
    marginTop: -6,
  },

  /* Other Elements */
  signupText: {
    opacity: 0.8,
    top: DIMENSIONS.signupTop,
    fontSize: width * 0.034,
    color: '#666',
    marginBottom: height * 0.06,
    fontFamily: 'Interfont',
  },
  signupLink: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  loginButton: {
    top: DIMENSIONS.loginTop,
    backgroundColor: '#E0E0E0',
    width: '100%',
    height: height * 0.062,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.04,
  },
  loginButtonActive: {
    backgroundColor: '#1a1a1a',
  },
  loginButtonText: {
    letterSpacing: 0.9,
    color: '#999',
    fontSize: width * 0.042,
    fontWeight: '400',
    fontFamily: 'Interfont',
  },
  laterContainer: {
    paddingVertical: 10,
  },
  laterText: {
    top: DIMENSIONS.laterTop,
    fontSize: width * 0.04,
    fontWeight: '400',
    color: '#1a1a1a',
    fontFamily: 'Interfont',
  },
});

export default LoginScreen;