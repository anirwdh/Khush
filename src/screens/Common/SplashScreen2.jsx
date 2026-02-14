import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SVGComponent from '../../assets/Icons/SplashBg';

const { width, height } = Dimensions.get('window');

const SplashScreen2 = () => {
  const navigation = useNavigation();
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    navigation.navigate('OnboardingScreen');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={1}>
      <SVGComponent 
        width={width} 
        height={height} 
        style={styles.background}
      />
      
      <Animated.Image
        source={require('../../assets/Images/LogoImage.png')}
        style={[
          styles.logo,
          {
            opacity: logoAnim,
            transform: [
              {
                scale: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
        resizeMode="contain"
      />
      
      <Animated.Image
        source={require('../../assets/Images/SplashTextBottom.png')}
        style={[
          styles.bottomText,
          {
            opacity: textAnim,
            transform: [
              {
                translateY: textAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
        resizeMode="contain"
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
  logo: {
    position: 'absolute',
    top: height * 0.54,
    left: width * 0.32,
    transform: [{ translateX: -width * 0.12 }],
    width: width * 0.36,
    height: width * 0.32,
  },
  bottomText: {
    position: 'absolute',
    bottom: height * 0.02,
    left: width * 0.15,
    transform: [{ translateX: -width * 0.35 }],
    width: width * 0.7,
    height: height * 0.08,
  },
});

export default SplashScreen2;