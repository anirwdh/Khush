import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, Dimensions, ActivityIndicator, Animated, Easing, LayoutAnimation, UIManager, Alert } from 'react-native';
import { SvgXml } from 'react-native-svg';
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
import JustForYouSection from '../../Components/JustForYouSection.jsx';
import Donotbleach from '../../assets/Icons/Donotbleach.jsx';
import LikeIcon from '../../assets/Icons/LikeIcons.jsx';
import WishListedLike from '../../assets/Icons/WishListedLike.jsx';
import { getFontFamily } from '../../utils/fontLoader';
import { getItemById } from '../../services/itemsService';
import { useWishlistSync } from '../../hooks/useWishlistSync';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { useLocation } from '../../redux/hooks';
import { triggerLightHaptic } from '../../utils/haptic';
import { cartService } from '../../services/api/cartService';

const { width, height } = Dimensions.get('window');

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { itemId } = route.params;
  const { pincode } = useLocation(); // Get pincode from Redux
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [openPolicy, setOpenPolicy] = useState(null);
  const [reviewPreviewVisible, setReviewPreviewVisible] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const scrollViewRef = useRef(null);

  // Use global wishlist sync for real-time synchronization
  const { requireAuth } = useAuthGuard();
  const {
    isWishlisted,
    toggleWishlist,
    pendingOperations,
    wishlistIds
  } = useWishlistSync();

  // Fetch product data using React Query
  const { data: itemData, isLoading, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItemById(itemId),
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract item from API response
  const item = itemData?.success ? itemData?.data?.item : null;

  // Memoize wishlist status to ensure proper re-renders
  const currentItemWishlistedStatus = useMemo(() => {
    const status = isWishlisted(item?._id);
    console.log('❤️ ProductDetailScreen - Wishlist status for item', item?._id, ':', status);
    return status;
  }, [isWishlisted, item?._id, wishlistIds, pendingOperations]);

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

  const handleImagePress = useCallback((imageIndex) => {
    setCurrentBannerIndex(imageIndex);
    setPreviewVisible(true);
  }, []);

  // Set default color on component mount
  const SafeSvgIcon = React.memo(({ uri, width, height, fallbackIcon, style }) => {
    const [svgError, setSvgError] = useState(false);
    const [svgData, setSvgData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fetchTimeoutRef = useRef(null);
    const controllerRef = useRef(null);

    // Memoize fetch function to prevent recreation
    const fetchSvg = useCallback(async () => {
      if (!uri || svgError || isLoading) return;
      
      setIsLoading(true);
      
      try {
        const encodedUrl = uri.replace(/ /g, '%20');
        
        controllerRef.current = new AbortController();
        fetchTimeoutRef.current = setTimeout(() => {
          if (controllerRef.current) {
            controllerRef.current.abort();
          }
        }, 2000); // Reduced timeout for faster fallback
        
        const response = await fetch(encodedUrl, { 
          signal: controllerRef.current.signal,
          headers: {
            'Accept': 'image/svg+xml',
          }
        });
        
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const svgText = await response.text();
        
        if (!svgText.includes('<svg')) {
          throw new Error('Invalid SVG content');
        }
        
        setSvgData(svgText);
        setSvgError(false);
      } catch (error) {
        setSvgError(true);
        setSvgData(null);
      } finally {
        setIsLoading(false);
      }
    }, [uri, svgError, isLoading]);

    useEffect(() => {
      fetchSvg();

      return () => {
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        if (controllerRef.current) {
          controllerRef.current.abort();
        }
      };
    }, [fetchSvg]);

    // Memoize container style to prevent recalculation
    const containerStyle = useMemo(() => [
      style, 
      { 
        width: width, 
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: width,
        minHeight: height
      }
    ], [style, width, height]);

    // Memoize loading style
    const loadingStyle = useMemo(() => ({ 
      width: width * 0.6, 
      height: height * 0.6, 
      backgroundColor: '#f5f5f5', 
      borderRadius: 2,
      opacity: 0.3 // Reduced opacity for less visual impact
    }), [width, height]);

    // Early return for loading state to prevent layout shifts
    if (isLoading) {
      return (
        <View style={containerStyle}>
          <View style={loadingStyle} />
        </View>
      );
    }

    // Return fallback icon immediately on error
    if (svgError || !svgData) {
      return (
        <View style={containerStyle}>
          {fallbackIcon}
        </View>
      );
    }

    return (
      <View style={containerStyle}>
        <SvgXml 
          xml={svgData} 
          width={width} 
          height={height}
        />
      </View>
    );
  });
  // Data for the main FlatList to avoid ScrollView nesting
  const scrollData = useMemo(() => [
    { type: 'banner' },
    { type: 'productInfo' },
    { type: 'justForYou' }
  ], []);

  const product = useMemo(() => {
    if (!item) return null;
    
    // Get sizes for the currently selected color or default color
    const selectedVariant = item.variants?.find(v => 
      v.color.hex === (selectedColor || item.defaultColor)
    );
    
    const sizesWithStock = selectedVariant?.sizes?.map(s => ({
      size: s.size,
      inStock: s.inStock,
      availableQuantity: s.availableQuantity,
      sku: s.sku,
      barcode: s.barcode
    })) || [];
    
    return {
      id: item._id,
      title: item.name,
      subtitle: item.shortDescription,
      longDescription: item.longDescription,
      price: `₹${item.discountedPrice || item.price}`,
      originalPrice: item.discountedPrice ? `₹${item.price}` : null,
      rating: item.avgRating || 0,
      sizes: sizesWithStock,
      colors: item.variants?.map(v => ({ name: v.color.name, hex: v.color.hex })) || [],
      care: item.care,
      shipping: item.shipping,
      codPolicy: item.codPolicy,
      returnPolicy: item.returnPolicy,
      exchangePolicy: item.exchangePolicy,
      sizeChart: item.sizeChart,
    };
  }, [item, selectedColor]);

  // Set default color and size on component mount
  useEffect(() => {
    if (item?.variants && !selectedColor) {
      // Set default color - first try to find by name, then fallback to first variant
      let defaultColorObj = item.variants.find(v => v.color.name === item.defaultColor);
      
      // If default color not found or out of stock, find first variant with any size in stock
      if (!defaultColorObj || !defaultColorObj.sizes?.some(s => s.inStock && s.availableQuantity > 0)) {
        const inStockVariant = item.variants.find(v => 
          v.sizes?.some(s => s.inStock && s.availableQuantity > 0)
        );
        defaultColorObj = inStockVariant || item.variants[0];
      }
      
      if (defaultColorObj) {
        setSelectedColor(defaultColorObj.color.hex);
        
        // Set default size to first available size in stock for the selected color
        const availableSize = defaultColorObj.sizes?.find(s => s.inStock && s.availableQuantity > 0);
        if (availableSize) {
          setSelectedSize(availableSize.size);
        } else if (defaultColorObj.sizes?.length > 0) {
          // If no sizes in stock, set to first available size
          setSelectedSize(defaultColorObj.sizes[0].size);
        }
      }
    }
  }, [item, selectedColor]);

  // Update selected size when color changes
  useEffect(() => {
    if (item?.variants && selectedColor) {
      const selectedVariant = item.variants.find(v => v.color.hex === selectedColor);
      if (selectedVariant) {
        // Check if current selected size is available for this color
        const currentSizeAvailable = selectedVariant.sizes?.find(s => s.size === selectedSize && s.inStock && s.availableQuantity > 0);
        
        if (!currentSizeAvailable) {
          // Set to first available size in stock for this color
          const availableSize = selectedVariant.sizes?.find(s => s.inStock && s.availableQuantity > 0);
          if (availableSize) {
            setSelectedSize(availableSize.size);
          } else if (selectedVariant.sizes?.length > 0) {
            // If no sizes in stock, set to first available size
            setSelectedSize(selectedVariant.sizes[0].size);
          }
        }
      }
    }
  }, [selectedColor, item, selectedSize]);

  const handleBannerScroll = useCallback((event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(contentOffset.x / width);
    setCurrentBannerIndex(currentIndex);
  }, []);

  const handleToggleWishlist = useCallback(async () => {
    if (!item?._id) return;
    
    // Use auth guard to check authentication and redirect if needed
    const isAllowed = await requireAuth(
      'ProductDetail', // Current screen name
      { itemId }, // Preserve current params
      'wishlist' // Pending action
    );
    
    if (!isAllowed) return;
    
    // Trigger haptic feedback
    triggerLightHaptic();
    
    // Use global toggle function
    toggleWishlist(item._id);
  }, [requireAuth, item?._id, toggleWishlist]);

  const handleAddToCart = useCallback(async () => {
    if (!item?._id) return;
    
    // Check if size is selected
    if (!selectedSize) {
      Alert.alert('Error', 'Please select a size.');
      return;
    }
    
    // Use auth guard to check authentication and redirect if needed
    const isAllowed = await requireAuth(
      'ProductDetail', // Current screen name
      { itemId }, // Preserve current params
      'addToCart' // Pending action
    );
    
    if (!isAllowed) return;
    
    try {
      // Find the selected variant by color
      const selectedVariant = item.variants?.find(v => 
        v.color.hex === (selectedColor || item.defaultColor)
      );
      
      if (!selectedVariant) {
        Alert.alert('Error', 'Selected color not found. Please select a different color.');
        return;
      }
      
      // Find the selected size within the variant
      const selectedSizeObj = selectedVariant.sizes?.find(s => s.size === selectedSize);
      
      if (!selectedSizeObj) {
        Alert.alert('Error', 'Selected size not found. Please select a different size.');
        return;
      }
      
      // Check if the selected size is in stock
      if (!selectedSizeObj.inStock || selectedSizeObj.availableQuantity <= 0) {
        Alert.alert('Error', 'Selected size is out of stock. Please select a different size.');
        return;
      }
      
      // Prepare variant object for API
      const variantPayload = {
        color: selectedVariant.color.name,
        size: selectedSize,
        sku: selectedSizeObj.sku,
        barcode: selectedSizeObj.barcode,
        imageUrl: selectedVariant.images?.[0]?.url ? encodeURI(selectedVariant.images[0].url) : ''
      };
      
      console.log('Adding to cart:', {
        itemId: item._id,
        variant: variantPayload,
        quantity,
        pincode
      });
      
      // Call cart service
      const response = await cartService.addToCart(
        item._id,
        variantPayload,
        quantity,
        pincode
      );
      
      if (response.success) {
        triggerLightHaptic();
        Alert.alert('Success', 'Item added to cart successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', error.message || 'Failed to add item to cart');
    }
  }, [requireAuth, item, selectedColor, selectedSize, quantity, pincode]);

  const handleBuyNow = useCallback(async () => {
    if (!item?._id) return;
    
    // Check if size is selected
    if (!selectedSize) {
      Alert.alert('Error', 'Please select a size.');
      return;
    }
    
    // Use auth guard to check authentication and redirect if needed
    const isAllowed = await requireAuth(
      'ProductDetail', // Current screen name
      { itemId }, // Preserve current params
      'buyNow' // Pending action
    );
    
    if (!isAllowed) return;
    
    // First add to cart, then navigate to checkout
    try {
      // Find the selected variant by color
      const selectedVariant = item.variants?.find(v => 
        v.color.hex === (selectedColor || item.defaultColor)
      );
      
      if (!selectedVariant) {
        Alert.alert('Error', 'Selected color not found. Please select a different color.');
        return;
      }
      
      // Find the selected size within the variant
      const selectedSizeObj = selectedVariant.sizes?.find(s => s.size === selectedSize);
      
      if (!selectedSizeObj) {
        Alert.alert('Error', 'Selected size not found. Please select a different size.');
        return;
      }
      
      // Check if the selected size is in stock
      if (!selectedSizeObj.inStock || selectedSizeObj.availableQuantity <= 0) {
        Alert.alert('Error', 'Selected size is out of stock. Please select a different size.');
        return;
      }
      
      // Prepare variant object for API
      const variantPayload = {
        color: selectedVariant.color.name,
        size: selectedSize,
        sku: selectedSizeObj.sku,
        barcode: selectedSizeObj.barcode,
        imageUrl: selectedVariant.images?.[0]?.url ? encodeURI(selectedVariant.images[0].url) : ''
      };
      
      console.log('Buy Now - Adding to cart:', {
        itemId: item._id,
        variant: variantPayload,
        quantity,
        pincode
      });
      
      // Call cart service
      const response = await cartService.addToCart(
        item._id,
        variantPayload,
        quantity,
        pincode
      );
      
      if (response.success) {
        triggerLightHaptic();
        // Navigate to cart screen after successful addition
        navigation.navigate('CartScreen');
      } else {
        Alert.alert('Error', response.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Buy Now error:', error);
      Alert.alert('Error', error.message || 'Failed to add item to cart');
    }
  }, [requireAuth, item, selectedColor, selectedSize, quantity, pincode, navigation]);


  const renderSize = useCallback((sizeObj) => {
    const isOutOfStock = !sizeObj.inStock || sizeObj.availableQuantity <= 0;
    
    return (
      <TouchableOpacity
        key={sizeObj.size}
        style={[
          styles.sizePill,
          selectedSize === sizeObj.size && styles.sizePillActive,
          isOutOfStock && styles.sizePillOutOfStock,
        ]}
        onPress={() => !isOutOfStock && setSelectedSize(sizeObj.size)}
        disabled={isOutOfStock}
        activeOpacity={isOutOfStock ? 1 : 0.8}
      >
        <Text
          style={[
            styles.sizeText,
            selectedSize === sizeObj.size && styles.sizeTextActive,
            isOutOfStock && styles.sizeTextOutOfStock,
          ]}
        >
          {sizeObj.size}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedSize]);

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

  // Skeleton Components for loading state
  const BannerSkeleton = () => (
    <View style={styles.bannerSection}>
      <View style={styles.bannerContainer}>
        <View style={styles.skeletonBannerImage} />
        <View style={styles.skeletonIndicatorContainer}>
          {[1, 2, 3].map((index) => (
            <View key={index} style={styles.skeletonIndicator} />
          ))}
        </View>
        <View style={styles.skeletonResizeButton} />
      </View>
    </View>
  );

  const ProductInfoSkeleton = () => (
    <View style={styles.productInfoSection}>
      <View style={styles.titleBlock}>
        <View style={styles.titleRow}>
          <View style={styles.skeletonProductTitle} />
          <View style={styles.skeletonLikeButton} />
        </View>
        <View style={styles.skeletonProductSubtitle} />
        <View style={styles.priceRatingRow}>
          <View style={styles.skeletonPrice} />
          <View style={styles.skeletonRatingBadge} />
        </View>
      </View>

      <View style={styles.sizeColorRow}>
        <View style={styles.optionRow}>
          <View style={styles.skeletonOptionLabel} />
          <View style={styles.skeletonColorRow}>
            {[1, 2, 3, 4].map((index) => (
              <View key={index} style={styles.skeletonColorDot} />
            ))}
          </View>
        </View>
        <View style={styles.optionRow}>
          <View style={styles.skeletonOptionLabel} />
          <View style={styles.skeletonSizeRow}>
            {['S', 'M', 'L'].map((size) => (
              <View key={size} style={styles.skeletonSizePill} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.selectionSection}>
        <View style={styles.skeletonSectionTitle} />
        <View style={styles.skeletonDescription} />
        <View style={styles.skeletonDescription} />
      </View>

      <View style={styles.selectionSection}>
        <View style={styles.skeletonSectionTitle} />
        <View style={styles.skeletonCareDescription} />
        <View style={styles.skeletonCareIconsRow}>
          {[1, 2, 3, 4].map((index) => (
            <View key={index} style={styles.skeletonCareIconItem}>
              <View style={styles.skeletonCareIcon} />
              <View style={styles.skeletonCareIconText} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const PolicySkeleton = () => (
    <View style={styles.policySection}>
      {[1, 2, 3].map((index) => (
        <View key={index}>
          <View style={styles.policyRow}>
            <View style={styles.policyRowLeft}>
              <View style={styles.skeletonPolicyIcon} />
              <View style={styles.skeletonPolicyTitle} />
            </View>
            <View style={styles.skeletonArrow} />
          </View>
          <View style={styles.thinSeparator} />
        </View>
      ))}
    </View>
  );

  const ReviewSkeleton = () => (
    <View style={styles.reviewSection}>
      <View style={styles.reviewHeader}>
        <View style={styles.skeletonReviewTitle} />
      </View>
      
      {[1, 2, 3].map((index) => (
        <View key={index} style={styles.reviewItem}>
          <View style={styles.reviewHeaderRow}>
            <View style={styles.reviewerInfo}>
              <View style={styles.reviewerDetails}>
                <View style={styles.skeletonReviewerName} />
                <View style={styles.skeletonReviewDate} />
              </View>
            </View>
            <View style={styles.skeletonRatingBadge} />
          </View>
          <View style={styles.skeletonReviewText} />
          <View style={styles.skeletonReviewImagesContainer}>
            {[1, 2, 3].map((imgIndex) => (
              <View key={imgIndex} style={styles.skeletonReviewImage} />
            ))}
          </View>
        </View>
      ))}
      
      <View style={styles.skeletonMoreReviewsButton} />
    </View>
  );

  // Show loading skeleton state
  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.skeletonBackButton} />
          <View style={styles.skeletonDetailsText} />
        </View>

        <View style={styles.scrollContent}>
          <BannerSkeleton />
          <ProductInfoSkeleton />
          <View style={styles.thinSeparator} />
          <PolicySkeleton />
          <View style={styles.thinSeparator} />
          <ReviewSkeleton />
          <View style={styles.skeletonJustForYou} />
        </View>

        {/* Fixed Bottom Buttons */}
        <View style={styles.fixedBottomContainer}>
          <View style={styles.skeletonAddToCartButton} />
          <View style={styles.skeletonBuyNowButton} />
        </View>
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

  // Memoized PolicyRow Component with LayoutAnimation for smooth performance
  const PolicyRow = React.memo(({ title, children, id, icon }) => {
    const isOpen = openPolicy === id;

    const iconContainerStyle = useMemo(() => [
      styles.policyIcon,
      {
        width: 21,
        height: 21,
        minWidth: 21,
        minHeight: 21,
        justifyContent: 'center',
        alignItems: 'center'
      }
    ], []);

    return (
      <View>
        <TouchableOpacity
          style={styles.policyRow}
          activeOpacity={0.8}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setOpenPolicy(isOpen ? null : id);
          }}
        >
          <View style={styles.policyRowLeft}>
            {icon && (
              <View style={iconContainerStyle}>
                {icon}
              </View>
            )}
            <Text style={styles.policyTitle}>{title}</Text>
          </View>
          <View style={[
            styles.arrowContainer,
            isOpen && styles.arrowContainerOpen
          ]}>
            <ForwardIcon width={24} height={24} />
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.policyContent}>
            <View style={styles.policyContentInner}>
              <Text style={styles.policyText}>{children}</Text>
            </View>
          </View>
        )}

        <View style={styles.thinSeparator} />
      </View>
    );
  });

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

      <FlatList
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        data={scrollData}
        keyExtractor={(item, index) => `section-${index}`}
        renderItem={({ item, index }) => {
          switch (item.type) {
            case 'banner':
              return (
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
              );
            case 'productInfo':
              return (
                <View style={styles.productInfoSection}>
                  <View style={styles.titleBlock}>
                    <View style={styles.titleRow}>
                      <Text style={styles.productTitle}>{product.title}</Text>
                      <TouchableOpacity 
                        style={[
                          styles.titleLikeButton,
                          pendingOperations.has(item?._id) && styles.titleLikeButtonDisabled
                        ]} 
                        activeOpacity={0.8}
                        onPress={handleToggleWishlist}
                        disabled={pendingOperations.has(item?._id)}
                      >
                        {currentItemWishlistedStatus ? (
                          <WishListedLike width={30} height={30}  />
                        ) : (
                          <LikeIcon 
                            width={30} 
                            height={30} 
                            fill="none"
                            stroke="#000"
                          />
                        )}
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
                          <SafeSvgIcon 
                            uri={instruction.iconUrl}
                            width={24}
                            height={24}
                            fallbackIcon={<Donotbleach width={24} height={24} />}
                            style={styles.careIconContainer}
                          />
                          <Text style={styles.careIconText}>{instruction.text}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.thinSeparator} />

                  {/* Policy Section */}
                  <View style={styles.policySection}>
                    <PolicyRow id="delivery" title="Estimated Delivery" icon={
                      product.shipping?.iconUrl ? 
                        <SafeSvgIcon 
                          uri={product.shipping.iconUrl}
                          width={21} 
                          height={21}
                          fallbackIcon={<DeliveryIcon width={21} height={21} />}
                          style={styles.policyIconContainer}
                        /> : 
                        <View style={styles.policyIconContainer}>
                          <DeliveryIcon width={21} height={21} />
                        </View>
                    }>
                      {product.shipping?.text || 'Standard delivery (5-7 days)'}
                    </PolicyRow>

                    <PolicyRow id="cod" title="COD Policy" icon={
                      product.codPolicy?.iconUrl ? 
                        <SafeSvgIcon 
                          uri={product.codPolicy.iconUrl}
                          width={21} 
                          height={21}
                          fallbackIcon={<CodIcon width={21} height={21} />}
                          style={styles.policyIconContainer}
                        /> : 
                        <View style={styles.policyIconContainer}>
                          <CodIcon width={21} height={21} />
                        </View>
                    }>
                      Cash on Delivery: {product.codPolicy?.text || 'Available'}
                    </PolicyRow>

                    <PolicyRow id="return" title="Return Policy" icon={
                      product.returnPolicy?.iconUrl ? 
                        <SafeSvgIcon 
                          uri={product.returnPolicy.iconUrl}
                          width={21} 
                          height={20}
                          fallbackIcon={<RefundIcon width={21} height={20} />}
                          style={styles.policyIconContainer}
                        /> : 
                        <View style={styles.policyIconContainer}>
                          <RefundIcon width={21} height={20} />
                        </View>
                    }>
                      {product.returnPolicy?.text || '7-day return policy'}
                    </PolicyRow>

                    {product.exchangePolicy && (
                      <PolicyRow id="exchange" title="Exchange Policy" icon={
                        product.exchangePolicy?.iconUrl ? 
                          <SafeSvgIcon 
                            uri={product.exchangePolicy.iconUrl}
                            width={21} 
                            height={20}
                            fallbackIcon={<RefundIcon width={21} height={20} />}
                            style={styles.policyIconContainer}
                          /> : 
                          <View style={styles.policyIconContainer}>
                            <RefundIcon width={21} height={20} />
                          </View>
                      }>
                        {product.exchangePolicy?.text || 'Exchange available'}
                      </PolicyRow>
                    )}
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
                </View>
              );
            case 'justForYou':
              return <JustForYouSection />;
            default:
              return null;
          }
        }}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      {/* Fixed Bottom Buttons */}
      <View style={styles.fixedBottomContainer}>
        <TouchableOpacity 
          style={styles.addToCartButton} 
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Text style={styles.addToCartText}>ADD TO CART</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.buyNowButton}
          activeOpacity={0.8}
          onPress={handleBuyNow}
        >
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
    flex: 1,
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
  titleLikeButtonDisabled: {
    opacity: 0.6,
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
  sizePillOutOfStock: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    opacity: 0.6,
  },
  sizeTextOutOfStock: {
    color: '#999',
    textDecorationLine: 'line-through',
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
  careIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  policyIconContainer: {
    width: 21,
    height: 21,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
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
  // Out of stock button styles
  addToCartButtonOutOfStock: {
    opacity: 0.5,
    borderColor: '#ccc',
  },
  addToCartTextOutOfStock: {
    color: '#999',
  },
  buyNowButtonOutOfStock: {
    opacity: 0.5,
    backgroundColor: '#999',
    borderColor: '#999',
  },
  buyNowTextOutOfStock: {
    color: '#ccc',
  },
  thinSeparator: {
    height: 1,
    backgroundColor: '#E6E6E6',
    marginVertical: 0,
  },
  policySection: {
    marginTop: 10,
    overflow: 'hidden', // Prevent layout overflow
    minHeight: 159, // Fixed height: 3 rows * 53px each
  },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    minHeight: 53, // Fixed height to prevent layout shifts
  },
  policyRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  policyIcon: {
    width: 21,
    height: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
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
    paddingHorizontal: 33,
    paddingVertical: 0,
    backgroundColor: '#ffff',
    overflow: 'hidden',
  },
  policyContentInner: {
    paddingVertical: 16,
  },
  policyText: {
    fontSize: 13,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    lineHeight: 20,
    minHeight: 40, // Ensure text has minimum height
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
  // Skeleton styles
  skeletonBackButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
  },
  skeletonDetailsText: {
    width: 100,
    height: 20,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
  },
  skeletonBannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 0,
  },
  skeletonIndicatorContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonIndicator: {
    width: 7,
    height: 7,
    backgroundColor: '#e0e0e0',
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 4,
  },
  skeletonResizeButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 40,
    height: 40,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
  },
  skeletonProductTitle: {
    width: '70%',
    height: 22,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
  },
  skeletonLikeButton: {
    width: 38,
    height: 38,
    backgroundColor: '#f2f2f2',
    borderRadius: 19,
  },
  skeletonProductSubtitle: {
    width: '90%',
    height: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    marginTop: 6,
  },
  skeletonPrice: {
    width: 80,
    height: 24,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
  },
  skeletonRatingBadge: {
    width: 60,
    height: 24,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
  },
  skeletonOptionLabel: {
    width: 40,
    height: 14,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
    left: 8,
  },
  skeletonColorRow: {
    flexDirection: 'row',
    flex: 1,
  },
  skeletonColorDot: {
    width: 24,
    height: 24,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    marginRight: 8,
  },
  skeletonSizeRow: {
    flexDirection: 'row',
    flex: 1,
  },
  skeletonSizePill: {
    width: 28,
    height: 28,
    backgroundColor: '#f2f2f2',
    borderRadius: 14,
    marginRight: 8,
  },
  skeletonSectionTitle: {
    width: 80,
    height: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
    marginBottom: 12,
  },
  skeletonDescription: {
    width: '100%',
    height: 14,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
    marginBottom: 8,
  },
  skeletonCareDescription: {
    width: '100%',
    height: 14,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
    marginBottom: 16,
  },
  skeletonCareIconsRow: {
    flexDirection: 'column',
    gap: 12,
  },
  skeletonCareIconItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonCareIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
    marginRight: 8,
  },
  skeletonCareIconText: {
    width: 120,
    height: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
  },
  skeletonPolicyIcon: {
    width: 21,
    height: 21,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
    marginRight: 8,
  },
  skeletonPolicyTitle: {
    width: 140,
    height: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
  },
  skeletonArrow: {
    width: 24,
    height: 24,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
  },
  skeletonReviewTitle: {
    width: 160,
    height: 18,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
  },
  skeletonReviewerName: {
    width: 100,
    height: 14,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
    marginBottom: 4,
  },
  skeletonReviewDate: {
    width: 80,
    height: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
  },
  skeletonReviewText: {
    width: '100%',
    height: 14,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 12,
  },
  skeletonReviewImagesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonReviewImage: {
    width: 60,
    height: 60,
    backgroundColor: '#f2f2f2',
    borderRadius: 2,
  },
  skeletonMoreReviewsButton: {
    left: 47,
    width: '70%',
    height: 48,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    marginTop: 16,
    alignSelf: 'center',
  },
  skeletonJustForYou: {
    width: '100%',
    height: 200,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    marginVertical: 20,
  },
  skeletonAddToCartButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    marginRight: 8,
  },
  skeletonBuyNowButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    marginLeft: 8,
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
