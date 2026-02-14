import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Animated, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoginBg from '../../assets/Icons/LoginBg';
import { authService } from '../../services/api/authService';
import { TokenStorage } from '../../utils/tokenStorage';
import { AuthTest } from '../../utils/authTest';

const { width, height } = Dimensions.get('window');

// Memoized dimension calculations
const DIMENSIONS = {
  width,
  height,
  slideOffset: height * 0.20,
  contentPadding: width * 0.07,
  titleFontSize: width * 0.12,
  subtitleFontSize: width * 0.038,
  nameTop: height * 0.58,
  phoneTop: height * 0.69,
  signupTop: height * 0.44,
  loginTop: height * 0.47,
  laterTop: height * 0.36,
};

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const navigation = useNavigation();

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

  const handleScreenTap = useCallback(() => {
    Keyboard.dismiss();
    nameInputRef.current?.blur();
    phoneInputRef.current?.blur();
  }, []);

  const handleNameChange = useCallback((text) => {
    setName(text);
  }, []);

  const handlePhoneChange = useCallback((text) => {
    // Only allow numbers
    const cleanedText = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleanedText);
  }, []);

  const handleSignUp = useCallback(async () => {
    if (name && phoneNumber.length === 10) {
      try {
        // Prepare registration data according to your backend format
        const registrationData = {
          name: name,
          countryCode: "+91",
          phoneNumber: phoneNumber
        };

        console.log('Sending registration data:', registrationData);

        // Call registration API
        const result = await authService.register(registrationData);

        if (result.success) {
          console.log('Registration successful:', result.data);
          console.log('Response structure:', JSON.stringify(result.data, null, 2));
          
          // Extract userId from the correct location in response
          const userId = result.data?.userId || result.data?.data?.userId || result.data?.user?._id || result.data?._id;
          console.log('Extracted userId:', userId);
          
          // Navigate to OTP verification screen with userId
          navigation.navigate('VerificationScreen', { 
            phoneNumber: phoneNumber,
            countryCode: "+91",
            name: name,
            userId: userId
          });
          
          // Show success message
          Alert.alert(
            'Registration Successful',
            'OTP has been sent to your phone number',
            [{ text: 'OK' }]
          );
        } else {
          console.error('Registration failed:', result.message);
          
          // Show error message
          Alert.alert(
            'Registration Failed',
            result.message || 'Something went wrong. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Registration error:', error);
        
        // Show error message
        Alert.alert(
          'Registration Error',
          'Network error. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Validation error
      Alert.alert(
        'Validation Error',
        'Please enter your name and a valid 10-digit phone number',
        [{ text: 'OK' }]
      );
    }
  }, [name, phoneNumber, navigation]);

  const handleLogin = useCallback(() => {
    console.log('Login pressed');
    navigation.navigate('LoginScreen');
  }, [navigation]);

  const handleDoItLater = useCallback(() => {
    console.log('Do it later pressed');
    // Add navigation logic here
  }, []);

  // Memoized input props
  const nameInputProps = useMemo(() => ({
    ref: nameInputRef,
    style: styles.input,
    value: name,
    onChangeText: handleNameChange,
    placeholderTextColor: '#999',
    keyboardType: 'default',
    returnKeyType: 'next',
    blurOnSubmit: false,
    onSubmitEditing: () => phoneInputRef.current?.focus(),
    selectionColor: '#1a1a1a',
    autoCorrect: false,
    autoCapitalize: 'words',
    clearButtonMode: 'while-editing',
    importantForAutofill: 'no',
  }), [name, handleNameChange]);

  const phoneInputProps = useMemo(() => ({
    ref: phoneInputRef,
    style: styles.input,
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
    console.log('🧪 SIGNUP SCREEN: Testing Authentication System');
    // Fire and forget the async call
    AuthTest.checkCurrentAuthState().catch(error => {
      console.error('❌ SIGNUP SCREEN: Auth test error:', error);
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
      <TouchableWithoutFeedback onPress={handleScreenTap}>
        <View style={styles.container}>
          {/* Background SVG */}
          <LoginBg style={styles.background} />

          {/* Main Content */}
          <View style={styles.content}>
            {/* Centered Title */}
            <Text style={styles.signupTitle}>Sign-up</Text>

            {/* Centered Subtitle */}
            <Text style={styles.subtitle}>Let’s Sign-up for explore continues</Text>

            {/* Name Input Section */}
            <Animated.View style={[styles.inputContainer, { transform: [{ translateY: slideAnim }] }, { top: DIMENSIONS.nameTop }]}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput {...nameInputProps} />
              {/* Bottom Underline */}
              <View style={styles.underline} />
            </Animated.View>

            {/* Phone Number Input Section */}
            <Animated.View style={[styles.inputContainer, { transform: [{ translateY: slideAnim }] }, { top: DIMENSIONS.phoneTop }]}>
              <Text style={styles.label}>Mobile No.</Text>
              <View style={styles.inputRow}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput {...phoneInputProps} />
              </View>
              {/* Bottom Underline */}
              <View style={styles.underline} />
            </Animated.View>

            {/* Login Link */}
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLink}>Login</Text>
              </Text>
            </TouchableOpacity>

            {/* Sign-up Button */}
            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={handleSignUp}
              activeOpacity={0.8}
            >
              <Text style={styles.signupButtonText}>SIGN-UP</Text>
            </TouchableOpacity>

            {/* Do It Later */}
          
          </View>
        </View>
      </TouchableWithoutFeedback>
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

  signupTitle: {
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

  /* Input Styles */
  inputContainer: {
    width: '100%',
    marginBottom: height * 0.03,
    position: 'absolute',
  },
  label: {
    fontSize: width * 0.035,
    color: '#00000',
    marginBottom: height * 0.003,
    fontFamily: 'Interfont',
    alignSelf: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: width * 0.042,
    color: '#1a1a1a',
    fontFamily: 'Interfont',
    paddingVertical: 0,
    height: height * 0.055,
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
  underline: {
    height: 1.3,
    backgroundColor: '#AFAFAF',
    width: '100%',
    marginTop: -6,
  },

  /* Other Elements */
  loginText: {
    opacity: 0.8,
    top: DIMENSIONS.loginTop,
    fontSize: width * 0.034,
    color: '#666',
    marginBottom: height * 0.06,
    fontFamily: 'Interfont',
  },
  loginLink: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  signupButton: {
    top: DIMENSIONS.signupTop,
    backgroundColor: '#1a1a1a',
    width: '100%',
    height: height * 0.062,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.04,
  },
  signupButtonText: {
    letterSpacing: 0.9,
    color: '#fff',
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

export default SignUpScreen;
