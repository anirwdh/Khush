import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getFeaturedImages } from '../../services/featuredImagesService';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ onComplete }) => {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  
  // Fetch featured images using React Query
  const { data: featuredImagesData, isLoading, error } = useQuery({
    queryKey: ['featuredImages'],
    queryFn: () => getFeaturedImages({ page: 'lock' }),
    retry: 2,
    onSuccess: (data) => {
      console.log('✅ Featured images data received:', data);
      console.log('✅ Data type:', typeof data);
      console.log('✅ Is array:', Array.isArray(data));
    },
    onError: (err) => {
      console.log('❌ Featured images query error:', err);
    }
  });

  // Transform API data to match UI structure
  const slides = Array.isArray(featuredImagesData) ? featuredImagesData.map((item, idx) => ({
    id: item._id,
    title: item.heading,
    subtitle: item.subHeading,
    image: { uri: item.url },
  })) : [];

  const slide = slides[index];
  
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const textFadeAnim = React.useRef(new Animated.Value(1)).current;

  // Initial fade in effect
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 120,
        delay: 20,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Show skeleton UI while fetching data
  if (isLoading || slides.length === 0) {
    return (
      <View style={styles.container}>
        {/* Skeleton Title and Subtitle */}
        <View style={styles.textContainer}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>

        {/* Skeleton Image */}
        <View style={styles.skeletonImageWrap}>
          <View style={styles.skeletonImage} />
        </View>

        {/* Skeleton Dots */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.skeletonDot]} />
          <View style={[styles.dot, styles.skeletonDot]} />
          <View style={[styles.dot, styles.skeletonDot]} />
        </View>

        {/* Skeleton Button */}
        <View style={styles.skeletonButton} />

        {/* Skeleton Skip Button */}
        <View style={styles.skeletonSkipButton} />
      </View>
    );
  }


  const goToSlide = (newIndex) => {
    // Fade out current content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change slide
      setIndex(newIndex);
      // Fade in new content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 120,
          delay: 20,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const next = () => {
    if (index === slides.length - 1) {
      // Navigate to LoginScreen instead of calling onComplete
      navigation.navigate('LoginScreen');
    } else {
      goToSlide(index + 1);
    }
  };

  const skip = () => {
    // Navigate to LoginScreen instead of calling onComplete
    navigation.navigate('LoginScreen');
  };

  return (
    <View style={styles.container}>
      {/* Title and Subtitle at Top */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textFadeAnim,
          },
        ]}
      >
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>

      {/* Animated Image */}
      <Animated.View
        style={[
          styles.imageWrap,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.Image
          source={slide.image}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Dots Indicator */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === index && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Continue Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={next}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>
          {index === slides.length - 1 ? 'GET STARTED' : 'CONTINUE'}
        </Text>
      </TouchableOpacity>

      {/* Skip Button */}
      <TouchableOpacity 
        onPress={skip}
        style={styles.skipButton}
        activeOpacity={0.6}
      >
        <Text style={styles.skip}>SKIP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.05,
  },
  textContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: width * 0.02,
    marginTop: height * 0.08,
    marginBottom: height * 0.03,
    width: width * 0.88,
  },
  title: { width: width * 0.78,
    fontSize: width * 0.061,
    fontWeight: '600',
    textAlign: 'left',
    color: '#1a1a1a',
    marginBottom: height * 0.01,
    lineHeight: width * 0.07,
     fontFamily: 'Interfont',
  },
  subtitle: {
    fontSize: width * 0.034,
    textAlign: 'left',
    color: '#666',
    lineHeight: width * 0.05,
    fontFamily: 'Nunitosans',
  },
  imageWrap: {
    top: -13,
    width: '100%',
    height: height * 0.62,
    marginBottom: height * 0.03,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  dots: {
    top: -22,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: height * 0.04,
    paddingHorizontal: width * 0.02,
  },
  dot: {
    width: 30,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 2,
  },
  activeDot: {
    backgroundColor: '#1a1a1a',
    width: 30,
  },
  button: {
    top: -35,
    backgroundColor: '#1a1a1a',
    paddingVertical: height * 0.022,
    borderRadius: 0,
    marginBottom: height * 0.02,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: .6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  btnText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: width * 0.032,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  skipButton: {
    alignSelf: 'center',
    padding: 10,
  },
  skip: {
    top: -42,
    color: '#000000',
    fontSize: width * 0.034,
    fontWeight: '400',
  },
  // Skeleton styles
  skeletonTitle: {
    width: width * 0.78,
    height: width * 0.07,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: height * 0.01,
  },
  skeletonSubtitle: {
    width: width * 0.88,
    height: width * 0.05,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonImageWrap: {
    top: -13,
    width: '100%',
    height: height * 0.62,
    marginBottom: height * 0.03,
  },
  skeletonImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 0,
  },
  skeletonDot: {
    backgroundColor: '#e0e0e0',
  },
  skeletonButton: {
    top: -35,
    backgroundColor: '#e0e0e0',
    paddingVertical: height * 0.022,
    borderRadius: 0,
    marginBottom: height * 0.02,
    alignItems: 'center',
    height: height * 0.022 * 2 + 20,
  },
  skeletonSkipButton: {
    alignSelf: 'center',
    padding: 10,
    width: 40,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});

export default OnboardingScreen;