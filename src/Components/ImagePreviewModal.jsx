import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, StatusBar, Dimensions, Platform, Animated, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../assets/Icons/BackIcon.jsx';
import { getFontFamily } from '../utils/fontLoader';

const { width, height } = Dimensions.get('window');

const ImagePreviewModal = ({
  visible,
  images,
  startIndex,
  onClose,
}) => {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const thumbnailRef = useRef(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    if (visible && flatListRef.current) {
      // Scroll to the specific image when modal opens
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index: startIndex,
          animated: false,
        });
        thumbnailRef.current?.scrollToIndex({
          index: startIndex,
          animated: false,
        });
      });
      
      // Reset animations when modal opens
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
        })
      ]).start();
      setCurrentIndex(startIndex);
    }
  }, [visible, startIndex]);

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  const handleImageScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
    
    // Sync thumbnail scroll
    if (thumbnailRef.current) {
      thumbnailRef.current.scrollToIndex({
        index: index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  const handleThumbnailPress = (index) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({
      index: index,
      animated: true,
    });
  };

  const renderImage = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image
        source={typeof item.url === 'string' ? { uri: item.url } : item.url}
        style={styles.fullImage}
        resizeMode="contain"
      />
    </View>
  );

  const renderThumbnail = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.thumbnail,
        currentIndex === index && styles.activeThumbnail
      ]}
      onPress={() => handleThumbnailPress(index)}
      activeOpacity={0.8}
    >
      <Image
        source={typeof item.url === 'string' ? { uri: item.url } : item.url}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <StatusBar hidden backgroundColor="black" barStyle="light-content" />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={closeModal}
            activeOpacity={0.8}
          >
            <BackIcon width={24} height={24} />
          </TouchableOpacity>
          
          <Text style={styles.previewText}>PREVIEW</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Main Image View */}
          <View style={styles.mainImageContainer}>
            <FlatList
              ref={flatListRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `image-${index}`}
              renderItem={renderImage}
              onMomentumScrollEnd={handleImageScroll}
              getItemLayout={(data, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
            />
          </View>
          
          {/* Thumbnail Strip */}
          <View style={styles.thumbnailContainer}>
            <FlatList
              ref={thumbnailRef}
              data={images}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `thumb-${index}`}
              renderItem={renderThumbnail}
              contentContainerStyle={styles.thumbnailList}
              initialScrollIndex={startIndex}
              getItemLayout={(data, index) => ({
                length: 76, 
                offset: 76 * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  thumbnailRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'WHITE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
    letterSpacing: 1,
  },
  mainContent: {
    flex: 1,
    backgroundColor: 'WHITE',
    
  },
  mainImageContainer: {
    flex: 1,
    backgroundColor: 'WHITE',
  },
  imageContainer: {
    width: width,
    height: height * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'WHITE',
  },
  fullImage: {
    width: width,
    height: height * 0.85,
    backgroundColor: 'WHITE',
  },
  thumbnailContainer: {
    height: height * 0.15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  thumbnailList: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 90,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  activeThumbnail: {
    borderColor: '#000',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});

export default ImagePreviewModal;
