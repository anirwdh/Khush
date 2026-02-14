import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, StatusBar, Keyboard, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import BackIcon from '../../assets/Icons/BackIcon';
import ClockIcon from '../../assets/Icons/ClockIcon';
import { authService } from '../../services/api/authService';
import { TokenStorage } from '../../utils/tokenStorage';

const { width, height } = Dimensions.get('window');

// Memoized dimension calculations
const DIMENSIONS = {
  width,
  height,
  contentPadding: width * 0.07,
  titleFontSize: width * 0.09,
  subtitleFontSize: width * 0.038,
  otpTop: height * 0.28,
  resendTop: height * 0.38,
  verifyTop: height * 0.45,
};

const VerificationScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  // Get user data passed from SignUpScreen or LoginScreen
  const { phoneNumber, countryCode, name, userId, isLogin } = route.params || {};

  // Debug logging for received params
  useEffect(() => {
    console.log('VerificationScreen received params:', {
      phoneNumber,
      countryCode,
      name,
      userId,
      isLogin
    });
  }, [phoneNumber, countryCode, name, userId, isLogin]);

  // Optimized OTP change handler with immediate focus management
  const handleOtpChange = useCallback((text, index) => {
    // Only allow numbers, immediately filter
    const cleanedText = text.replace(/[^0-9]/g, '');
    
    // Always update the current field with the new digit
    setOtp(prev => {
      const newOtp = [...prev];
      newOtp[index] = cleanedText;
      return newOtp;
    });
    
    // Auto-focus next input if we entered a digit and there's room
    if (cleanedText && index < 5) {
      setTimeout(() => inputRefs[index + 1].current?.focus(), 0);
    }
    // If we cleared the current input, stay on current input
    else if (!cleanedText) {
      setTimeout(() => inputRefs[index].current?.focus(), 0);
    }
  }, []);

  // Optimized key press handler for better backspace handling
  const handleKeyPress = useCallback((e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current field is empty and we press backspace, go to previous
        setTimeout(() => inputRefs[index - 1].current?.focus(), 0);
      }
      // If current field has content, let the normal backspace handle it
    }
  }, [otp]);

  // Add focus handler to clear field when focusing on a filled field
  const handleInputFocus = useCallback((index) => {
    // If focusing on a field that already has content, clear it for re-entry
    if (otp[index]) {
      setOtp(prev => {
        const newOtp = [...prev];
        newOtp[index] = '';
        return newOtp;
      });
    }
  }, [otp]);

  // Optimized verify handler with immediate feedback
  const handleVerify = useCallback(async () => {
    const otpValue = otp.join('');
    if (otpValue.length === 6 && userId) {
      Keyboard.dismiss();
      setIsLoading(true);
      
      try {
        const verifyData = {
          userId: userId,
          otp: otpValue
        };
        
        console.log('=== OTP VERIFICATION DEBUG ===');
        console.log('OTP value:', otpValue);
        console.log('User ID:', userId);
        console.log('Full verify data:', verifyData);
        
        const result = await authService.verifyOtp(verifyData);
        
        console.log('OTP verification response:', result);
        
        if (result.success) {
          console.log('✅ OTP verification successful:', result.data);
          
          // Store access token and userId for future API calls
          const accessToken = result.data?.data?.accessToken || result.data?.accessToken;
          
          if (accessToken) {
            await TokenStorage.setAccessToken(accessToken);
            console.log('✅ Access token stored for API authentication');
          } else {
            console.warn('⚠️ No access token found in verification response');
          }
          
          if (userId) {
            await TokenStorage.setUserId(userId);
            console.log('✅ User ID stored for token management');
          }
          
          // Create user object for Redux state
          const userData = {
            id: userId,
            phoneNumber: phoneNumber,
            countryCode: countryCode,
            name: name || `User_${userId?.slice(-6)}`, // Fallback name if not provided
          };
          
          // Store user data in Redux state
          dispatch({
            type: 'auth/loginSuccess',
            payload: {
              user: userData,
              token: accessToken,
              userId: userId,
              refreshToken: null // Not used anymore since backend handles it
            }
          });
          console.log('✅ User data stored in Redux state');
          console.log('✅ User object:', userData);
          
          // Show success message
          Alert.alert(
            'Verification Successful',
            isLogin ? 'Login successful! Welcome back.' : 'Phone number verified successfully!',
            [
              { 
                text: 'OK', 
                onPress: () => {
                  // Navigate to HomeScreen after successful verification
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'HomeScreen' }],
                  });
                }
              }
            ]
          );
        } else {
          console.error('OTP verification failed:', result.message);
          
          // Show error message
          Alert.alert(
            'Verification Failed',
            result.message || 'Invalid OTP. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('OTP verification error:', error);
        
        // Show error message
        Alert.alert(
          'Verification Error',
          'Network error. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert(
        'Invalid OTP',
        'Please enter a valid 6-digit OTP',
        [{ text: 'OK' }]
      );
    }
  }, [otp, userId, navigation]);

  // Optimized resend handler
  const handleResend = useCallback(async () => {
    if (!isTimerActive && userId) {
      console.log('Resend OTP pressed');
      setIsLoading(true);
      
      try {
        let result;
        
        if (isLogin) {
          // For login, use login API to resend OTP
          const loginData = {
            countryCode: countryCode,
            phoneNumber: phoneNumber
          };
          console.log('Resending OTP for login:', loginData);
          result = await authService.login(loginData);
        } else {
          // For signup, use resend OTP API
          const resendData = {
            userId: userId
          };
          console.log('Resending OTP for signup:', resendData);
          result = await authService.resendOtp(resendData);
        }
        
        if (result.success) {
          console.log('OTP resent successfully');
          
          // Reset timer
          setTimer(45);
          setIsTimerActive(true);
          
          // Clear OTP inputs
          setOtp(['', '', '', '', '', '']);
          
          // Focus first input
          setTimeout(() => inputRefs[0].current?.focus(), 100);
          
          Alert.alert(
            'OTP Resent',
            'OTP has been sent to your phone number',
            [{ text: 'OK' }]
          );
        } else {
          console.error('Resend OTP failed:', result.message);
          
          Alert.alert(
            'Resend Failed',
            result.message || 'Failed to resend OTP. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Resend OTP error:', error);
        
        Alert.alert(
          'Resend Error',
          'Network error. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    }
  }, [isTimerActive, userId, isLogin, phoneNumber, countryCode]);

  // Back navigation handler
  const handleBack = useCallback(() => {
    Keyboard.dismiss();
    navigation.goBack();
  }, [navigation]);

  // Optimized timer effect with cleanup
  useEffect(() => {
    let interval;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timer]);

  // Keyboard visibility listeners for better UX
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Auto-focus first input on mount
  useEffect(() => {
    setTimeout(() => inputRefs[0].current?.focus(), 100);
  }, []);

  // Memoized input props for performance
  const getInputProps = useCallback((index) => ({
    ref: inputRefs[index],
    style: [
      styles.otpInput,
      otp[index] && styles.otpInputFilled
    ],
    value: otp[index],
    onChangeText: (text) => handleOtpChange(text, index),
    onKeyPress: (e) => handleKeyPress(e, index),
    onFocus: () => handleInputFocus(index),
    keyboardType: 'numeric',
    maxLength: 1,
    returnKeyType: index === 5 ? 'done' : 'next',
    selectionColor: '#1a1a1a',
    textAlign: 'center',
    secureTextEntry: false,
    blurOnSubmit: index === 5,
    onSubmitEditing: index === 5 ? handleVerify : () => inputRefs[index + 1].current?.focus(),
    clearButtonMode: 'never',
    autoCorrect: false,
    autoCapitalize: 'none',
    importantForAutofill: 'no',
    textContentType: 'oneTimeCode',
  }), [otp, handleOtpChange, handleKeyPress, handleInputFocus, handleVerify]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <BackIcon />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Centered Title */}
          <Text style={styles.verificationTitle}>Verify OTP</Text>

          {/* Centered Subtitle */}
          <Text style={styles.subtitle}>
            {isLogin 
              ? `Enter the login OTP sent to ${countryCode} ${phoneNumber?.slice(0, 2)}******${phoneNumber?.slice(-2)}`
              : `Enter the verification OTP sent to ${countryCode} ${phoneNumber?.slice(0, 2)}******${phoneNumber?.slice(-2)}`
            }
          </Text>

          {/* OTP Input Section */}
          <View style={styles.otpContainer}>
            <View style={styles.otpRow}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput key={index} {...getInputProps(index)} />
              ))}
            </View>
          </View>

          {/* Resend Code */}
          <TouchableOpacity onPress={handleResend} disabled={isTimerActive}>
            <View style={styles.resendContainer}>
              <ClockIcon />
              <Text style={[styles.resendText, isTimerActive && styles.resendTextDisabled]}>
                {isTimerActive ? `Resend in ${timer}s` : 'Didn\'t receive the code? '}
                {!isTimerActive && <Text style={styles.resendLink}>Resend</Text>}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Verify Button */}
          <TouchableOpacity 
            style={[
              styles.verifyButton,
              otp.join('').length === 6 && !isLoading && styles.verifyButtonActive
            ]} 
            onPress={handleVerify}
            disabled={otp.join('').length !== 6 || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'VERIFYING...' : 'VERIFY OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 50,
  },
  backButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: DIMENSIONS.contentPadding,
    alignItems: 'center',
  },

  verificationTitle: {
    letterSpacing: 0.9,
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

  /* OTP Input Styles */
  otpContainer: {
   top:-55,
    width: '100%',
    marginBottom: height * 0.08,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
  },
  otpInput: {
    width: width * 0.1,
    height: height * 0.08,
    fontSize: width * 0.05,
    color: '#1a1a1a',
    fontFamily: 'Interfont',
    borderBottomWidth: 1.3,
    borderBottomColor: '#AFAFAF',
    textAlign: 'center',
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  otpInputFilled: {
    borderBottomColor: '#1a1a1a',
    fontWeight: '600',
  },

  /* Other Elements */
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    top: -90,
    marginBottom: height * 0.06,
  },
  resendText: {
    opacity: 0.8,
    fontSize: width * 0.034,
    color: '#666',
    fontFamily: 'Interfont',
    marginLeft: 5,
  },
  resendTextDisabled: {
    opacity: 0.4,
  },
  resendLink: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  verifyButton: {
    top: 230,
    backgroundColor: '#E0E0E0',
    width: '100%',
    height: height * 0.062,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.04,
  },
  verifyButtonActive: {
    backgroundColor: '#1a1a1a',
  },
  verifyButtonText: {
    letterSpacing: 0.9,
    color: '#999',
    fontSize: width * 0.042,
    fontWeight: '400',
    fontFamily: 'Interfont',
  },
});

export default VerificationScreen;