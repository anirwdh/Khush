import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import LikeIcon from '../assets/Icons/LikeIcons.jsx';
import WishListedLike from '../assets/Icons/WishListedLike.jsx';
import Rating from '../assets/Icons/Rating.jsx';
import HeadingArrow from '../assets/Icons/HeadingArrow.jsx';
import { getFontFamily } from '../utils/fontLoader';
import { sectionsService } from '../services/api/sectionsService';
import { useLocation } from '../redux/hooks';
import { useWishlistSync } from '../hooks/useWishlistSync';
import { triggerLightHaptic } from '../utils/haptic';
import { useAuthGuard } from '../hooks/useAuthGuard';

const { width, height } = Dimensions.get('window');

const JustForYouSection = React.memo(() => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pincode } = useLocation(); // Get pincode from Redux
  const { requireAuth } = useAuthGuard();
  
  // Pagination state for each section
  const [sectionPages, setSectionPages] = useState({});
  const [sectionLoading, setSectionLoading] = useState({});
  const [hasMore, setHasMore] = useState({});
  
  // Refs for horizontal FlatLists
  const flatListRefs = useRef({});

  // Use global wishlist sync for real-time synchronization
  const {
    wishlistIds,
    wishlistSet,
    isWishlisted,
    toggleWishlist,
    toggleWishlistMutation,
    pendingOperations,
    isLoading: isWishlistLoading
  } = useWishlistSync();

  // Fetch sections data using React Query
  const { data: sectionsData, isLoading, error } = useQuery({
    queryKey: ['justForYouSections', pincode],
    queryFn: () => sectionsService.getManualSections({
      pinCode: pincode,
      page: 1,
      limit: 10, // Load 10 items initially
      isWeb: false, // Always false for mobile app
      type: 'MANUAL' // Type for this section
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Initialize pagination state for sections
  React.useEffect(() => {
    if (sectionsData?.success && sectionsData?.data?.items) {
      const initialPages = {};
      const initialHasMore = {};
      
      sectionsData.data.items.forEach(section => {
        initialPages[section._id] = {
          page: 1,
          products: section.products?.filter(product => product?.item).map(product => ({
            id: product.itemId || product._id,
            name: product.item?.name || 'Product',
            price: product.item?.price || 0,
            discountedPrice: product.item?.discountedPrice,
            thumbnail: product.item?.thumbnail || 'https://picsum.photos/seed/placeholder/400/400',
            avgRating: product.item?.avgRating || 0,
            shortDescription: product.item?.shortDescription || '',
            inStock: product.inStock,
            availableQuantity: product.availableQuantity
          })) || []
        };
        initialHasMore[section._id] = true;
      });
      
      setSectionPages(initialPages);
      setHasMore(initialHasMore);
    }
  }, [sectionsData]);

  // Load more products for a specific section
  const loadMoreProducts = useCallback(async (sectionId) => {
    if (sectionLoading[sectionId] || !hasMore[sectionId]) return;
    
    setSectionLoading(prev => ({ ...prev, [sectionId]: true }));
    
    try {
      const currentPage = sectionPages[sectionId]?.page || 1;
      const nextPage = currentPage + 1;
      
      const response = await sectionsService.getManualSections({
        pinCode: pincode,
        page: nextPage,
        limit: 10,
        isWeb: false,
        type: 'MANUAL'
      });
      
      if (response?.success && response?.data?.items) {
        const sectionData = response.data.items.find(item => item._id === sectionId);
        
        if (sectionData?.products) {
          const newProducts = sectionData.products
            .filter(product => product?.item)
            .map(product => ({
              id: product.itemId || product._id,
              name: product.item?.name || 'Product',
              price: product.item?.price || 0,
              discountedPrice: product.item?.discountedPrice,
              thumbnail: product.item?.thumbnail || 'https://picsum.photos/seed/placeholder/400/400',
              avgRating: product.item?.avgRating || 0,
              shortDescription: product.item?.shortDescription || '',
              inStock: product.inStock,
              availableQuantity: product.availableQuantity
            }));
          
          // Only update if we have new products
          if (newProducts.length > 0) {
            setSectionPages(prev => ({
              ...prev,
              [sectionId]: {
                page: nextPage,
                products: [...(prev[sectionId]?.products || []), ...newProducts]
              }
            }));
            
            // Check if there are more products to load
            setHasMore(prev => ({
              ...prev,
              [sectionId]: newProducts.length === 10
            }));
          } else {
            // No more products available
            setHasMore(prev => ({
              ...prev,
              [sectionId]: false
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setSectionLoading(prev => ({ ...prev, [sectionId]: false }));
    }
  }, [pincode, sectionLoading, hasMore, sectionPages]);

  // Handle scroll end for horizontal lists
  const handleScrollEnd = useCallback((sectionId) => {
    const flatListRef = flatListRefs.current[sectionId];
    if (flatListRef) {
      flatListRef.scrollToEnd({ animated: true });
    }
  }, []);

  // Transform sections data for rendering
  const sectionsList = useMemo(() => {
    if (!sectionsData?.success || !sectionsData?.data?.items) {
      return [];
    }
    
    return sectionsData.data.items.map(section => ({
      id: section._id,
      title: section.title || 'Untitled Section',
      products: sectionPages[section._id]?.products || []
    }));
  }, [sectionsData, sectionPages]);

  // Handle wishlist toggle with auth guard and global sync
  const handleToggleWishlist = useCallback(async (itemId) => {
    // Determine the current screen to redirect back to
    const currentScreen = route.name;
    const redirectParams = { itemId };
    
    // Use auth guard to check authentication and redirect if needed
    const isAllowed = await requireAuth(
      currentScreen, // Use current screen dynamically
      redirectParams,
      'wishlist' // Pending action
    );
    
    if (!isAllowed) return;
    
    // Use global toggle function
    toggleWishlist(itemId);
  }, [requireAuth, toggleWishlist, route.name]);

  const renderProduct = useCallback(({ item }) => {
    if (!item) return null;
    
    const isLiked = isWishlisted(item.id);
    const displayPrice = item.discountedPrice || item.price || 0;
    const imageSource = item.thumbnail ? { uri: item.thumbnail } : { uri: 'https://picsum.photos/seed/placeholder/400/400' };
    const isOutOfStock = item.inStock === false || item.availableQuantity === 0;
    
    return (
      <TouchableOpacity 
        style={[styles.productItem, isOutOfStock && styles.productItemOutOfStock]}
        onPress={() => navigation.navigate('ProductDetail', { itemId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.productImageContainer}>
          <Image 
            source={imageSource} 
            style={[styles.productImage, isOutOfStock && styles.productImageOutOfStock]} 
            resizeMode="cover" 
          />
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
            </View>
          )}
          <TouchableOpacity 
            style={[
              styles.likeButton,
              pendingOperations.has(item.id) && styles.likeButtonDisabled,
              isOutOfStock && styles.likeButtonOutOfStock
            ]}
            onPress={() => !isOutOfStock && handleToggleWishlist(item.id)}
            disabled={pendingOperations.has(item.id) || isOutOfStock}
            activeOpacity={0.8}
          >
            {isLiked ? (
              <WishListedLike width={34} height={34} />
            ) : (
              <LikeIcon width={34} height={34} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.productInfoContainer}>
          <Text style={[styles.productTitle, isOutOfStock && styles.productTitleOutOfStock]}>{item.name || 'Product'}</Text>
          <Text style={[styles.productPrice, isOutOfStock && styles.productPriceOutOfStock]}>₹{displayPrice}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [isWishlisted, handleToggleWishlist, navigation, pendingOperations]);

  const handleViewAll = useCallback((sectionTitle, sectionId) => {
    // Navigate to collection listing screen with section-specific data
    navigation.navigate('CollectionListingScreen', { 
      type: 'MANUAL',
      title: sectionTitle,
      sectionId: sectionId
    });
  }, [navigation]);


  // Section header component
  const SectionHeader = useCallback(({ title }) => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <HeadingArrow width={130} height={18} />
      </View>
    </View>
  ), []);

  // Render individual section
  const renderSection = useCallback((section) => {
    if (section.products.length === 0) return null;
    
    return (
      <View key={section.id} style={styles.sectionContainer}>
        <SectionHeader title={section.title} />
        <FlatList
          ref={(ref) => {
            if (ref) {
              flatListRefs.current[section.id] = ref;
            }
          }}
          key={`horizontal-${section.id}`}
          data={section.products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalProductList}
          onEndReached={() => loadMoreProducts(section.id)}
          onEndReachedThreshold={0.2}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={15}
          getItemLayout={(data, index) => ({
            length: width * 0.59, // productItem width + marginRight
            offset: width * 0.59 * index,
            index,
          })}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products available</Text>
            </View>
          )}
        />
      </View>
    );
  }, [renderProduct, SectionHeader, loadMoreProducts]);

  // Loading state component
  const LoadingSkeleton = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );

  // Error state component
  const ErrorComponent = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load recommendations</Text>
      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={() => navigation.navigate('HomeScreen')}
      >
        <Text style={styles.retryButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorComponent />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        key="sections-list-vertical"
        data={sectionsList}
        renderItem={({ item }) => renderSection(item)}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sections available</Text>
          </View>
        )}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    marginTop:15,
    alignItems: 'center',
   // marginBottom: height * 0.01,
  },
  sectionHeaderText: {
    fontSize: width * 0.05,
    fontWeight: '400',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 4,
  },
  arrowContainer: {
    top: 0,
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  horizontalProductList: {
    //left:20,
    paddingRight: width * 0.05,
  },
  productItem: {
    left:20,
    width: width * 0.5,
   
    marginRight: width * 0.09,
    backgroundColor: '#fff',
  },
  productImageContainer: {
    width: width * 0.5,
  
    position: 'relative',
    marginBottom: height * 0.01,
  },
  productImage: {
    width: '110%',
    height: width * 0.67,
  },
  likeButton: {
    position: 'absolute',
    top: '80%',
    right: 3,
    padding: 4,
  },
  productInfoContainer: {
    marginTop: height * 0.01,
    paddingHorizontal: width * 0.01,
  },
  productTitle: {
    fontSize: width * 0.04,
    fontWeight: '500',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    lineHeight: 18,
    letterSpacing: 0.5,
    marginBottom: height * 0.005,
  },
  productPrice: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#C0914B',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  priceContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  starsContainer: {
    marginRight: 5,
  },
  ratingText: {
    fontSize: width * 0.03,
    fontWeight: '400',
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
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
    paddingHorizontal: width * 0.05,
  },
  errorText: {
    fontSize: width * 0.04,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    marginBottom: height * 0.02,
  },
  retryButton: {
    backgroundColor: '#C0914B',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.015,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: width * 0.035,
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: height * 0.05,
  },
  emptyText: {
    fontSize: width * 0.035,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  // Out of stock styles
  productItemOutOfStock: {
    opacity: 0.6,
  },
  productImageOutOfStock: {
    opacity: 0.7,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    textAlign: 'center',
  },
  likeButtonDisabled: {
    opacity: 0.6,
  },
  likeButtonOutOfStock: {
    opacity: 0.5,
  },
  productTitleOutOfStock: {
    opacity: 0.6,
  },
  productPriceOutOfStock: {
    opacity: 0.6,
  },
});

export default JustForYouSection;
