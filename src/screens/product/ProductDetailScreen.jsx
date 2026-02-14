import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import ResizeIcon from '../../assets/Icons/Resize.jsx';
import ForwardIcon from '../../assets/Icons/ForwardIcon.jsx';
import CodIcon from '../../assets/Icons/cod.jsx';
import RefundIcon from '../../assets/Icons/Refund.jsx';
import DeliveryIcon from '../../assets/Icons/Deliveryicon.jsx';
import ImagePreviewModal from '../../Components/ImagePreviewModal';
import JustForYouSection from '../../Components/JustForYouSection';
import Donotbleach from '../../assets/Icons/Donotbleach.jsx';
import LikeIcon from '../../assets/Icons/LikeIcons.jsx';
import { getFontFamily } from '../../utils/fontLoader';
import { getItemById } from '../../services/itemsService';

const { width, height } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { itemId } = route.params;
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [openPolicy, setOpenPolicy] = useState(null);
  const [reviewPreviewVisible, setReviewPreviewVisible] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const scrollViewRef = useRef(null);

  // Fetch product data using React Query
  const { data: itemData, isLoading, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItemById(itemId),
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract item from API response
  const item = itemData?.success ? itemData?.data?.item : null;

  // Product images from API - show all images for selected color
  const productImages = useMemo(() => {
    if (!item?.variants) return [];
    
    // Use selectedColor if available, otherwise use defaultColor
    const colorToUse = selectedColor || item.defaultColor;
    const selectedVariant = item.variants.find(v => v.color.hex === colorToUse);
    
    if (!selectedVariant?.images) return [];
    
    // Show all images for selected color with proper URL structure
    return selectedVariant.images.map(img => ({ 
      uri: img.url,
      url: img.url // Add both uri and url for compatibility
    }));
  }, [item, selectedColor]);

  // Convert images for ImageViewer format
  const imageUrls = productImages.map((image) => ({
    url: image.uri,
  }));

  // Convert images for ImagePreviewModal format
  const previewImages = productImages.map((image) => ({
    url: image.url,
  }));

  // Review images for preview
  const reviewImages = [
    require('../../assets/Images/image.png'),
    require('../../assets/Images/Image2.png'),
    require('../../assets/Images/Image3.png'),
  ];

  const reviewImageUrls = reviewImages.map((image) => ({
    url: image,
  }));

  const handleReviewImagePress = useCallback((imageIndex) => {
    setCurrentReviewIndex(imageIndex);
    setReviewPreviewVisible(true);
  }, []);

  const handleImagePress = useCallback((index) => {
    setCurrentBannerIndex(index);
    setPreviewVisible(true);
  }, []);

  // Product details from A
  const product = useMemo(() => {
    if (!item) return null;
    
    return {
      id: item._id,
      title: item.name,
      subtitle: item.shortDescription,
      longDescription: item.longDescription,
      price: `₹${item.discountedPrice || item.price}`,
      originalPrice: item.discountedPrice ? `₹${item.price}` : null,
      rating: item.avgRating || 0,
      sizes: item.variants?.[0]?.sizes?.map(s => s.size) || [],
      colors: item.variants?.map(v => ({ name: v.color.name, hex: v.color.hex })) || [],
      care: item.care,
      shipping: item.shipping,
      codPolicy: item.codPolicy,
      returnPolicy: item.returnPolicy,
      sizeChart: item.sizeChart,
    };
  }, [item]);

  // Set default color on component mount
  useEffect(() => {
    if (item?.defaultColor && product?.colors?.length > 0 && !selectedColor) {
      const defaultColorObj = product.colors.find(c => c.name === item.defaultColor);
      if (defaultColorObj) {
        setSelectedColor(defaultColorObj.hex);
      }
    }
  }, [item, product?.colors, selectedColor]);

  const handleBannerScroll = useCallback((event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(contentOffset.x / width);
    setCurrentBannerIndex(currentIndex);
  }, []);

  const renderSize = useCallback((size) => (
    <TouchableOpacity
      key={size}
      style={[
        styles.sizePill,
        selectedSize === size && styles.sizePillActive,
      ]}
      onPress={() => setSelectedSize(size)}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.sizeText,
          selectedSize === size && styles.sizeTextActive,
        ]}
      >
        {size}
      </Text>
    </TouchableOpacity>
  ), [selectedSize]);

  const renderColor = useCallback((color) => (
    <TouchableOpacity
      key={color.hex}
      onPress={() => setSelectedColor(color.hex)}
      style={[
        styles.colorDotWrapper,
        selectedColor === color.hex && styles.activeColorDot,
      ]}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.colorDot,
          { backgroundColor: color.hex },
        ]}
      />
    </TouchableOpacity>
  ), [selectedColor]);

  const updateQuantity = useCallback((action) => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  }, [quantity]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Show error state
  if (error || !item) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load product details</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const PolicyRow = ({ title, children, id, icon }) => {
    const isOpen = openPolicy === id;

    return (
      <View>
        <TouchableOpacity
          style={styles.policyRow}
          activeOpacity={0.8}
          onPress={() => setOpenPolicy(isOpen ? null : id)}
        >
          <View style={styles.policyRowLeft}>
            {icon && <View style={styles.policyIcon}>{icon}</View>}
            <Text style={styles.policyTitle}>{title}</Text>
          </View>
          <View style={[styles.arrowContainer, isOpen && styles.arrowContainerOpen]}>
            <ForwardIcon width={24} height={24} />
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.policyContent}>
            <Text style={styles.policyText}>{children}</Text>
          </View>
        )}

        <View style={styles.thinSeparator} />
      </View>
    );
  };

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
        
        <Text style={styles.detailsText}>DETAILS</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Banner Images */}
      <View style={styles.bannerSection}>
        <View style={styles.bannerContainer}>
          <FlatList
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleBannerScroll}
            data={productImages}
            keyExtractor={(item, index) => `banner-${index}`}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                style={styles.bannerSlide}
                onPress={() => handleImagePress(index)}
                activeOpacity={1}
              >
                <Image 
                  source={item} 
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            windowSize={3}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            removeClippedSubviews={Platform.OS === 'android'}
          />
          
          <View style={styles.indicatorContainer}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentBannerIndex === index && styles.activeIndicator
                ]}
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.resizeButton} 
            activeOpacity={0.8}
            onPress={() => handleImagePress(currentBannerIndex)}
          >
            <ResizeIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.productInfoSection}>
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle}>{product.title}</Text>
            <TouchableOpacity 
              style={styles.titleLikeButton} 
              activeOpacity={0.8}
              onPress={() => setIsLiked(!isLiked)}
            >
              <LikeIcon 
                width={24} 
                height={24} 
                fill={isLiked ? '#FF0000' : 'none'}
                stroke={isLiked ? '#FF0000' : '#000'}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.productSubtitle}>{product.subtitle}</Text>

          <View style={styles.priceRatingRow}>
            <View>
              <Text style={styles.price}>{product.price}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>{product.originalPrice}</Text>
              )}
            </View>

            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {product.rating}</Text>
            </View>
          </View>
        </View>

        {/* Size and Color Selection */}
        <View style={styles.sizeColorRow}>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Color</Text>
            <View style={styles.colorRow}>
              {product.colors.map(renderColor)}
            </View>
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Size</Text>
            <View style={styles.sizeRow}>
              {product.sizes.map(renderSize)}
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>DETAILS</Text>
          <Text style={styles.description}>{product.subtitle}</Text>
          <Text style={styles.description}>{product.longDescription}</Text>
        </View>

        {/* Care */}
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>CARE</Text>
          <Text style={styles.careDescription}>{product.care?.description || 'Care instructions not available'}</Text>
          
          <View style={styles.careIconsColumn}>
            {product.care?.instructions?.map((instruction, index) => (
              <View key={instruction._id || index} style={styles.careIconItem}>
                <SvgUri 
                  uri={encodeURI(instruction.iconUrl)} 
                  width={24}
                  height={24}
                  style={styles.careIconImage}
                />
                <Text style={styles.careIconText}>{instruction.text}</Text>
              </View>
            )) || (
              <View style={styles.careIconItem}>
                <Donotbleach width={24} height={24} />
                <Text style={styles.careIconText}>Care instructions not available</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.thinSeparator} />

        {/* Policy Section */}
        <View style={styles.policySection}>
          <PolicyRow id="delivery" title="Estimated Delivery" icon={
            product.shipping?.iconUrl ? 
              <View style={{width: 21, height: 21}}>
                <SvgUri uri={encodeURI(product.shipping.iconUrl)} width={21} height={21} />
              </View> : 
              <DeliveryIcon width={21} height={21} />
          }>
            Free shipping • {product.shipping?.estimatedDelivery || '4-6 days'} delivery
          </PolicyRow>

          <PolicyRow id="cod" title="COD Policy" icon={
            product.codPolicy?.iconUrl ? 
              <View style={{width: 21, height: 21}}>
                <SvgUri uri={encodeURI(product.codPolicy.iconUrl)} width={21} height={21} />
              </View> : 
              <CodIcon width={21} height={21} />
          }>
            Cash on Delivery: {product.codPolicy?.text || 'Available'}
          </PolicyRow>

          <PolicyRow id="return" title="Return Policy" icon={
            product.returnPolicy?.iconUrl ? 
              <View style={{width: 21, height: 21}}>
                <SvgUri uri={encodeURI(product.returnPolicy.iconUrl)} width={21} height={20} />
              </View> : 
              <RefundIcon width={21} height={20} />
          }>
            Easy returns within {product.returnPolicy?.text || '7 days'} of delivery
            Items must be unused, unwashed, and with original tags.
          </PolicyRow>
        </View>
        <View style={styles.thinSeparator} />

        {/* Product Review Section */}
        <View style={styles.reviewSection}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>PRODUCT REVIEW</Text>
         
          </View>
          
          <View style={styles.reviewItem}>
            <View style={styles.reviewHeaderRow}>
              <View style={styles.reviewerInfo}>
                <View style={styles.reviewerDetails}>
                  <Text style={styles.reviewerName}>John Doe</Text>
                  <Text style={styles.reviewDate}>12 Nov 2024</Text>
                </View>
              </View>
              <View style={styles.ratingBadge}>
                <View style={styles.ratingBadgeContent}>
                  <Text style={styles.ratingText}>4.2</Text>
                  <Text style={styles.ratingStar}>★</Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewText}>Great quality leather jacket! Fits perfectly and looks amazing.</Text>
            <View style={styles.reviewImagesContainer}>
              <TouchableOpacity onPress={() => handleReviewImagePress(0)} activeOpacity={0.8}>
                <Image source={require('../../assets/Images/image.png')} style={styles.reviewImage} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReviewImagePress(1)} activeOpacity={0.8}>
                <Image source={require('../../assets/Images/Image2.png')} style={styles.reviewImage} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReviewImagePress(2)} activeOpacity={0.8}>
                <Image source={require('../../assets/Images/Image3.png')} style={styles.reviewImage} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.reviewItem}>
            <View style={styles.reviewHeaderRow}>
              <View style={styles.reviewerInfo}>
                <View style={styles.reviewerDetails}>
                  <Text style={styles.reviewerName}>Sarah Miller</Text>
                  <Text style={styles.reviewDate}>10 Nov 2024</Text>
                </View>
              </View>
              <View style={styles.ratingBadge}>
                <View style={styles.ratingBadgeContent}>
                  <Text style={styles.ratingText}>5.0</Text>
                  <Text style={styles.ratingStar}>★</Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewText}>Absolutely love this jacket! The material is premium and the craftsmanship is excellent.</Text>
            <View style={styles.reviewImagesContainer}>
              <TouchableOpacity onPress={() => handleReviewImagePress(0)} activeOpacity={0.8}>
                <Image source={require('../../assets/Images/image.png')} style={styles.reviewImage} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReviewImagePress(1)} activeOpacity={0.8}>
                <Image source={require('../../assets/Images/Image2.png')} style={styles.reviewImage} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.reviewItem}>
            <View style={styles.reviewHeaderRow}>
              <View style={styles.reviewerInfo}>
                <View style={styles.reviewerDetails}>
                  <Text style={styles.reviewerName}>Michael Johnson</Text>
                  <Text style={styles.reviewDate}>08 Nov 2024</Text>
                </View>
              </View>
              <View style={styles.ratingBadge}>
                <View style={styles.ratingBadgeContent}>
                  <Text style={styles.ratingText}>3.5</Text>
                  <Text style={styles.ratingStar}>★</Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewText}>Good jacket but sizing runs a bit small. Quality is nice though.</Text>
            <View style={styles.reviewImagesContainer}>
              <TouchableOpacity onPress={() => handleReviewImagePress(0)} activeOpacity={0.8}>
                <Image source={require('../../assets/Images/image.png')} style={styles.reviewImage} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.moreReviewsButton}
            onPress={() => navigation.navigate('ProductReviews')}
            activeOpacity={0.8}
          >
            <Text style={styles.moreReviewsText}>SHOW MORE REVIEWS</Text>
          </TouchableOpacity>
        </View>

        {/* Just For You Section */}
        <JustForYouSection />
      </View>
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.fixedBottomContainer}>
        <TouchableOpacity 
          style={styles.addToCartButton} 
          onPress={() => navigation.navigate('CartScreen')}
          activeOpacity={0.8}
        >
          <Text style={styles.addToCartText}>ADD TO CART</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton} activeOpacity={0.8}>
          <Text style={styles.buyNowText}>BUY NOW</Text>
        </TouchableOpacity>
      </View>

      <ImagePreviewModal
        visible={previewVisible}
        images={previewImages}
        startIndex={currentBannerIndex}
        onClose={() => setPreviewVisible(false)}
      />

      <ImagePreviewModal
        visible={reviewPreviewVisible}
        images={reviewImageUrls}
        startIndex={currentReviewIndex}
        onClose={() => setReviewPreviewVisible(false)}
      />
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
    paddingBottom: 100, // Height of fixed buttons + extra padding
  },
  bannerSection: {
    width: width,
    height: height * 0.55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  bannerContainer: {
    left:15,
    width: width * 0.9,
    height: height * 0.51,
    position: 'relative',
    borderRadius: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerSlide: {
    width: width * 0.9,
    height: height * 0.51,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    aspectRatio: 3/4,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 7,
    height: 7,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  resizeButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleLikeButton: {
    padding: 4,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicatorWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfoSection: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
  },
  titleBlock: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productTitle: {
    fontSize: 18,
    letterSpacing: 3,
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  productSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#777',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  priceRatingRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: width * 0.055,
    fontWeight: '700',
    color: '#C0914B',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  ratingBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  sizeColorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    left:8,
    width: 50,
    fontSize: 12,
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  colorRow: {
    flexDirection: 'row',
    flex: 1,
  },
  colorDotWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeColorDot: {
    borderWidth: 1,
    borderColor: '#000',
  },
  sizeRow: {
    flexDirection: 'row',
    flex: 1,
  },
  sizePill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sizePillActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  sizeText: {
    fontSize: 11,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  sizeTextActive: {
    color: '#fff',
  },
  selectionSection: {
    marginBottom: height * 0.03,
  },
  sectionTitle: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 2,
    marginBottom: height * 0.015,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    width: width * 0.15,
    height: width * 0.15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.02,
    marginBottom: width * 0.02,
  },
  selectedSize: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  sizeText: {
    fontSize: width * 0.035,
    fontWeight: '500',
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  selectedSizeText: {
    color: '#fff',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.02,
    marginBottom: width * 0.02,
  },
  selectedColor: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  colorText: {
    fontSize: width * 0.03,
    fontWeight: '500',
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  selectedColorText: {
    color: '#fff',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.3,
  },
  quantityButton: {
    width: width * 0.08,
    height: width * 0.08,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: width * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  quantityText: {
    flex: 1,
    textAlign: 'center',
    fontSize: width * 0.04,
    fontWeight: '500',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  descriptionSection: {
    marginBottom: height * 0.03,
  },
  description: {
    fontSize: width * 0.035,
    fontWeight: '400',
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    lineHeight: width * 0.05,
    marginBottom: height * 0.01,
  },
  careDescription: {
    fontSize: width * 0.035,
    fontWeight: '400',
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    lineHeight: width * 0.05,
    marginBottom: height * 0.02,
  },
  careIconsColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: height * 0.01,
  },
  careIconItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  careIconText: {
    fontSize: 13,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    marginLeft: 8,
  },
  featuresSection: {
    marginBottom: height * 0.03,
  },
  featureItem: {
    fontSize: width * 0.035,
    lineHeight: 20,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    marginBottom: height * 0.005,
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.05,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  addToCartButton: {
    borderWidth: 1,
    borderColor: '#000',
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 0,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 1,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 14,
    borderRadius: 0,
    alignItems: 'center',
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 1,
  },
  thinSeparator: {
    height: 1,
    backgroundColor: '#E6E6E6',
    marginVertical: 0,
  },
  policySection: {
    marginTop: 10,
  },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  policyRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  policyIcon: {
    marginRight: 12,
  },
  policyTitle: {
    fontSize: 14,
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 1,
  },
  policyArrow: {
    fontSize: 16,
    color: '#000',
  },
  arrowContainer: {
    transform: [{ rotate: '0deg' }],
  },
  arrowContainerOpen: {
    transform: [{ rotate: '180deg' }],
  },
  policyContent: {
    paddingBottom: 14,
  },
  policyText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  reviewSection: {
  //  width:360,
    backgroundColor: '#f6fbfcff',
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
    marginTop: 50,
  },
  reviewHeader: {
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
  reviewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 0,
    marginRight: 12,
  },
  reviewerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    marginBottom: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  reviewStar: {
    fontSize: 10,
    color: '#DDD',
  },
  filled: {
    color: '#000',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
  //  backgroundColor: '#000',
    paddingHorizontal: 0,
    paddingVertical: 10,
    borderRadius: 4,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  careIconImage: {
    width: 24,
    height: 24,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 0,
    resizeMode: 'cover',
  },
  moreReviewsButton: {
    left:47,
    width: '70%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 0,
    alignItems: 'center',
    marginTop: 16,
   // backgroundColor: '#fff',
  },
  moreReviewsText: {
    fontSize: 14,
    opacity: 0.3,
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 0.5,
  },
});

export default ProductDetailScreen;
