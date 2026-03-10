import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Platform, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LikeIcon from '../../assets/Icons/LikeIcons.jsx';
import WishListedLike from '../../assets/Icons/WishListedLike.jsx';
import Rating from '../../assets/Icons/Rating.jsx';
import BottomTabBar from '../../Components/BottomTabBar.jsx';
import { wishlistService } from '../../services/api/wishlistService';
import { useLocation } from '../../redux/hooks';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { useWishlistSync } from '../../hooks/useWishlistSync';
import { triggerLightHaptic } from '../../utils/haptic';

const { width, height } = Dimensions.get('window');

const WishlistScreen = ({ route }) => {
  const navigation = useNavigation();
  const { requireAuth } = useAuthGuard();
  const { pincode } = useLocation(); // Get pincode from Redux
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(2); // Favorites tab is active
  const [showTabBar, setShowTabBar] = useState(route?.params?.fromBottomTab || false); // Only show if navigated from bottom tab
  const itemsPerPage = 14; // 7 rows × 2 columns

  // Fetch wishlist items using React Query
  const { data: wishlistData, isLoading, error, refetch } = useQuery({
    queryKey: ['wishlistItems', currentPage, pincode],
    queryFn: () => wishlistService.getWishlistItems(pincode, currentPage, itemsPerPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Remove wishlist IDs query since all items are already wishlisted
  // We only need the wishlist items for this screen

  // Use global wishlist sync for real-time synchronization
  const {
    isWishlisted,
    toggleWishlist,
    toggleWishlistMutation,
    pendingOperations,
    refreshWishlistGlobal
  } = useWishlistSync();

  // Extract products from API response with proper reactivity
  const products = useMemo(() => {
    const items = wishlistData?.success ? wishlistData?.data?.data?.items || [] : [];
    console.log('Products updated, count:', items.length);
    return items;
  }, [wishlistData]);
  const totalPages = wishlistData?.success ? wishlistData?.data?.data?.pagination?.totalPages || 1 : 1;

  // No need for wishlist IDs since all items are already wishlisted
  const wishlistIds = [];
  const wishlistSet = new Set();

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    // Navigation is now handled in BottomTabBar component
  };

  // Handle wishlist toggle with auth guard and global sync
  const handleToggleWishlist = useCallback(async (itemId) => {
    // Use auth guard to check authentication and redirect if needed
    const isAllowed = await requireAuth(
      'WishlistScreen', // Current screen name
      { fromBottomTab: showTabBar }, // Preserve current state
      'wishlist' // Pending action
    );
    
    if (!isAllowed) return;
    
    // Use global toggle function
    toggleWishlist(itemId);
  }, [requireAuth, toggleWishlist, showTabBar]);



  const renderProduct = useCallback(({ item, index }) => {
    const product = item.itemId; // Extract actual product data from nested itemId
    const isOutOfStock = item.inStock === false || item.availableQuantity === 0;
    
    return (
      <TouchableOpacity 
        style={[styles.productItem, isOutOfStock && styles.productItemOutOfStock]}
        onPress={() => navigation.navigate('ProductDetail', { itemId: product._id })}
        activeOpacity={0.8}
      >
        <View style={styles.productImageContainer}>
          <Image 
            source={{ uri: product.thumbnail || product.imageUrl || product.images?.[0] }} 
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
              pendingOperations.has(product._id) && styles.likeButtonDisabled,
              isOutOfStock && styles.likeButtonOutOfStock
            ]} 
            activeOpacity={0.8}
            onPress={() => handleToggleWishlist(product._id)}
            disabled={pendingOperations.has(product._id)}
          >
            <WishListedLike width={34} height={34} />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfoContainer}>
          <Text style={[styles.productTitle, isOutOfStock && styles.productTitleOutOfStock]}>{product.name}</Text>
          <Text style={[styles.productSubtitle, isOutOfStock && styles.productSubtitleOutOfStock]} numberOfLines={1} ellipsizeMode="tail">
            {product.shortDescription}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.productPrice, isOutOfStock && styles.productPriceOutOfStock]}>₹{product.discountedPrice || product.price}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              <Rating width={14} height={14} />
            </View>
            <Text style={[styles.ratingText, isOutOfStock && styles.ratingTextOutOfStock]}>{product.avgRating || '4.5'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [pendingOperations, navigation, handleToggleWishlist]);

  // Skeleton Component for product loading state
  const ProductSkeleton = () => (
    <View style={styles.productItem}>
      <View style={styles.productImageContainer}>
        <View style={styles.skeletonImage} />
        <View style={[styles.likeButton, styles.skeletonLikeButton]} />
      </View>
      <View style={styles.productInfoContainer}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
        <View style={styles.skeletonPrice} />
        <View style={styles.skeletonRating} />
      </View>
    </View>
  );

  // Skeleton Row Component
  const SkeletonRow = () => (
    <View style={styles.row}>
      <ProductSkeleton />
      <ProductSkeleton />
    </View>
  );

  const renderPaginationButton = (pageNumber) => (
    <TouchableOpacity
      key={pageNumber}
      style={[
        styles.paginationButton,
        currentPage === pageNumber && styles.paginationButtonActive
      ]}
      onPress={() => setCurrentPage(pageNumber)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.paginationButtonText,
        currentPage === pageNumber && styles.paginationButtonTextActive
      ]}>
        {pageNumber}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.wishlistText}>WISHLIST</Text>
      </View>

      {/* Loading State - Skeleton UI */}
      {isLoading && (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.wishlistText}>WISHLIST</Text>
          </View>
          <FlatList
            data={[1, 2, 3, 4, 5, 6]} // Show 6 skeleton rows (12 products)
            renderItem={() => <SkeletonRow />}
            keyExtractor={(index) => `skeleton-${index}`}
            numColumns={1}
            contentContainerStyle={styles.productList}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Disable scrolling during skeleton load
          />
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || 'Failed to load wishlist items'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('HomeScreen')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Product Grid */}
      {!isLoading && !error && products.length > 0 && (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
          extraData={pendingOperations}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          ListFooterComponent={
            totalPages > 1 && (
              <View style={styles.paginationContainer}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(renderPaginationButton)}
              </View>
            )
          }
        />
      )}

      {/* Bottom Tab Bar - Only show if navigated from bottom tab */}
      {showTabBar && <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />}
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
    justifyContent: 'flex-start',
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 7,
    backgroundColor: '#fff',
  
  },
  wishlistText: {
    fontSize: width * 0.046,
    fontWeight: '700',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
    letterSpacing: 1,
  },
  productList: {
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
    paddingBottom: 80, // Extra padding to prevent content from hiding behind bottom tab bar
  },
  row: {
    justifyContent: 'space-between',
  },
  productItem: {
    width: width * 0.44,
    backgroundColor: '#fff',
    marginBottom: height * 0.02,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: height * 0.01,
  },
  productImage: {
    width: '100%',
    height: width * 0.55,
  },
  likeButton: {
    position: 'absolute',
    top: '80%',
    right: 3,
    padding: 4,
  },
  likeButtonDisabled: {
    opacity: 0.6,
  },
  productInfoContainer: {
    marginTop: height * 0.01,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 0,
    marginBottom: height * 0.007,
  },
  productSubtitle: {
    fontSize: 9,
    fontWeight: '400',
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 0,
    marginBottom: height * 0.009,
  },
  priceContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '400',
    color: '#C0914B',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  ratingContainer: {
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: width * 0.01,
  },
  ratingText: {
    fontSize: width * 0.03,
    fontWeight: '400',
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  paginationButton: {
    width: 35,
    height: 35,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  paginationButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#666',
  },
  paginationButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  // Skeleton styles
  skeletonImage: {
    width: '100%',
    height: width * 0.55,
    backgroundColor: '#f2f2f2',
    borderRadius: 0,
  },
  skeletonLikeButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 17,
  },
  skeletonTitle: {
    width: '90%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: height * 0.007,
  },
  skeletonSubtitle: {
    width: '80%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: height * 0.009,
  },
  skeletonPrice: {
    width: '40%',
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 4,
  },
  skeletonRating: {
    width: '30%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'flex-end',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  shopButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 5,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  // Out of stock styles
  productItemOutOfStock: {
    opacity: 0.85,
  },
  productImageOutOfStock: {
    opacity: 0.8,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  likeButtonOutOfStock: {
    opacity: 0.7,
  },
  productTitleOutOfStock: {
    color: '#666',
  },
  productSubtitleOutOfStock: {
    color: '#888',
  },
  productPriceOutOfStock: {
    color: '#666',
  },
  ratingTextOutOfStock: {
    color: '#666',
  },
});

export default WishlistScreen;