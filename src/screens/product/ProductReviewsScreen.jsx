import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import ResizeIcon from '../../assets/Icons/Resize.jsx';
import LikeIcon from '../../assets/Icons/LikeIcons.jsx';
import Rating from '../../assets/Icons/Rating.jsx';

const { width, height } = Dimensions.get('window');

const ProductReviewsScreen = ({ route }) => {
  const navigation = useNavigation();
  const [reviewPreviewVisible, setReviewPreviewVisible] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Review images for preview
  const reviewImages = [
    require('../../assets/Images/image.png'),
    require('../../assets/Images/Image2.png'),
    require('../../assets/Images/Image3.png'),
  ];

  const reviewImageUrls = reviewImages.map((image) => ({
    url: typeof image === 'string' ? image : image,
  }));

  const handleReviewImagePress = useCallback((imageIndex) => {
    setCurrentReviewIndex(imageIndex);
    setReviewPreviewVisible(true);
  }, []);

  // Mock reviews data
  const reviews = useMemo(() => [
    {
      id: '1',
      name: 'John Doe',
      date: '12 Nov 2024',
      rating: 4.2,
      text: 'Great quality leather jacket! Fits perfectly and looks amazing.',
      images: [
        require('../../assets/Images/image.png'),
        require('../../assets/Images/Image2.png'),
        require('../../assets/Images/Image3.png'),
      ]
    },
    {
      id: '2',
      name: 'Sarah Miller',
      date: '10 Nov 2024',
      rating: 5.0,
      text: 'Absolutely love this jacket! The material is premium and the craftsmanship is excellent.',
      images: [
        require('../../assets/Images/image.png'),
        require('../../assets/Images/Image2.png'),
      ]
    },
    {
      id: '3',
      name: 'Michael Johnson',
      date: '08 Nov 2024',
      rating: 3.5,
      text: 'Good jacket but sizing runs a bit small. Quality is nice though.',
      images: [
        require('../../assets/Images/image.png'),
      ]
    },
    {
      id: '4',
      name: 'Emily Davis',
      date: '05 Nov 2024',
      rating: 4.8,
      text: 'Amazing jacket! The leather is so soft and the fit is perfect. Worth every penny.',
      images: [
        require('../../assets/Images/Image2.png'),
        require('../../assets/Images/Image3.png'),
      ]
    },
    {
      id: '5',
      name: 'Robert Wilson',
      date: '02 Nov 2024',
      rating: 4.0,
      text: 'Very satisfied with my purchase. The jacket looks even better in person.',
      images: [
        require('../../assets/Images/image.png'),
      ]
    },
  ], []);

  const renderReview = useCallback(({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeaderRow}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerDetails}>
            <Text style={styles.reviewerName}>{item.name}</Text>
            <Text style={styles.reviewDate}>{item.date}</Text>
          </View>
        </View>
        <View style={styles.ratingBadge}>
          <View style={styles.ratingBadgeContent}>
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.ratingStar}>★</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
      {item.images && item.images.length > 0 && (
        <View style={styles.reviewImagesContainer}>
          {item.images.map((image, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => handleReviewImagePress(index)} 
              activeOpacity={0.8}
            >
              <Image source={image} style={styles.reviewImage} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  ), [handleReviewImagePress]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <BackIcon width={26} height={26} />
        </TouchableOpacity>
        
        <Text style={styles.detailsText}>PRODUCT REVIEWS</Text>
      </View>

      {/* Reviews List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
     

        {/* Reviews List */}
        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.reviewsList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  detailsText: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    color: '#000',
  },
  emptyStar: {
    opacity: 0.3,
  },
  reviewsList: {
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
  },
  reviewItem: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    marginBottom: 12,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  ratingBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    marginRight: 4,
  },
  ratingStar: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    marginLeft: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    marginBottom: 2,
  },
  reviewText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    marginBottom: 8,
  },
  reviewImagesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});

export default ProductReviewsScreen;