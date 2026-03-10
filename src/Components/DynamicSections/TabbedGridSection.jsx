import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { triggerLightHaptic } from '../../utils/haptic';
import Rating from '../../assets/Icons/Rating.jsx';
import LikeIcon from '../../assets/Icons/LikeIcons.jsx';
import WishListedLike from '../../assets/Icons/WishListedLike.jsx';
import Forwardarrow from '../../assets/Icons/Forwardarrow.jsx';
import HeadingArrow from '../../assets/Icons/HeadingArrow.jsx';
import { getFontFamily } from '../../utils/fontLoader';
import { getItemsByCategory } from '../../services/itemsService';
import { useWishlistSync } from '../../hooks/useWishlistSync';
import { useAuthGuard } from '../../hooks/useAuthGuard';

const { width, height } = Dimensions.get('window');

// Memoized section title component to prevent re-renders
const SectionTitle = React.memo(({ title }) => {
  console.log('Title rendered'); // for testing

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.arrowContainer}>
        <HeadingArrow width={130} height={18} />
      </View>
    </>
  );
});

const TabbedGridSection = React.memo(({ section }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pincode, setPincode] = useState('201309'); // Default pincode
  const abortControllerRef = useRef(null);

  // Use global wishlist sync for real-time synchronization
  const { requireAuth } = useAuthGuard();
  const {
    isWishlisted,
    toggleWishlist,
    pendingOperations,
    wishlistIds
  } = useWishlistSync();

  // Extract categories from section data or fallback to tabs
  const categories = useMemo(() => {
    if (section.categories && section.categories.length > 0) {
      return section.categories.map(cat => cat.name);
    }
    return section.tabs || [];
  }, [section.categories, section.tabs]);

  // Set initial active tab
  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  // Fetch products when active tab changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!activeTab || !section.categories) return;

      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      
      try {
        // Find the category ID for the active tab
        const activeCategory = section.categories.find(cat => cat.name === activeTab);
        if (activeCategory) {
          // Fetch more products (limit 50) but we'll only display 4
          const response = await getItemsByCategory(activeCategory._id, pincode, 1, 50);
          if (response?.success && response?.data?.items && !abortControllerRef.current.signal.aborted) {
            // Transform API response to match expected format
            const transformedProducts = response.data.items.map(item => ({
              id: item._id,
              title: item.name || 'Product',
              price: item.price ? `₹${item.price}` : '₹0',
              rating: item.avgRating || 0,
              image: item.thumbnail ? { uri: item.thumbnail } : require('../../assets/Images/image.png'),
              categoryId: activeCategory._id,
              inStock: item.inStock,
              availableQuantity: item.availableQuantity
            }));
            setProducts(transformedProducts);
          }
        }
      } catch (error) {
        if (!abortControllerRef.current.signal.aborted) {
          console.error('Error fetching products:', error);
          setProducts([]);
        }
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [activeTab, section.categories, pincode]);

  // Memoized tab press handler with haptics
  const handleTabPress = useCallback((tab) => {
    triggerLightHaptic();
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  }, [activeTab]);

  // Memoized explore more handler
  const handleExploreMore = useCallback(() => {
    // Find active category ID for navigation
    const activeCategory = section.categories?.find(cat => cat.name === activeTab);
    navigation.navigate(section.exploreMoreRoute, { 
      categoryId: activeCategory?._id,
      collectionName:  section.title, // Use active tab or section title as collection name
    });
  }, [activeTab, section.categories, section.exploreMoreRoute, section.title, navigation]);

  // Handle wishlist toggle with auth guard and global sync
  const handleToggleWishlist = useCallback(async (itemId) => {
    // Determine current screen to redirect back to
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

  // Memoized wishlist status to ensure proper re-renders
  const getWishlistStatus = useCallback((itemId) => {
    return isWishlisted(itemId);
  }, [isWishlisted, wishlistIds, pendingOperations]);

  const renderProductItem = useCallback(({ item }) => {
    const isLiked = getWishlistStatus(item.id);
    const isOutOfStock = item.inStock === false || item.availableQuantity === 0;
    
    return (
      <TouchableOpacity 
        style={[styles.productItem, isOutOfStock && styles.productItemOutOfStock]}
        onPress={() => navigation.navigate('ProductDetail', { itemId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.productImageContainer}>
          <Image 
            source={item.image} 
            style={[styles.productImage, isOutOfStock && styles.productImageOutOfStock]} 
            resizeMode="cover" 
            progressiveRenderingEnabled={true}
            fadeDuration={300}
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
          <Text style={[styles.productTitle, isOutOfStock && styles.productTitleOutOfStock]}>{item.title}</Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.productPrice, isOutOfStock && styles.productPriceOutOfStock]}>{item.price}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              <Rating width={14} height={14} />
            </View>
            <Text style={[styles.ratingText, isOutOfStock && styles.ratingTextOutOfStock]}>{item.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, getWishlistStatus, handleToggleWishlist, pendingOperations]);

  // Memoized tab component to prevent unnecessary re-renders
  const TabComponent = useMemo(() => {
    return ({ tab }) => (
      <TouchableOpacity
        style={styles.tab}
        onPress={() => handleTabPress(tab)}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
        {activeTab === tab && <View style={styles.diamondIndicator} />}
      </TouchableOpacity>
    );
  }, [activeTab, handleTabPress]);

  const renderTab = useCallback((tab) => <TabComponent tab={tab} />, [TabComponent]);


  // Memoized tabs container to prevent re-renders
  const TabsContainer = useMemo(() => (
    <FlatList
      data={categories}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsContainer}
      keyExtractor={(item) => item}
      renderItem={({ item }) => renderTab(item)}
      removeClippedSubviews={Platform.OS === 'android'}
      initialNumToRender={categories.length}
      maxToRenderPerBatch={10}
      windowSize={20}
    />
  ), [categories, renderTab]);

  // Skeleton loading component
  const SkeletonLoader = useMemo(() => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.skeletonTitle} />
      </View>
      <View style={styles.arrowContainer}>
        <View style={styles.skeletonArrow} />
      </View>
      
      <FlatList
        data={categories}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        keyExtractor={(_, index) => index.toString()}
        renderItem={() => (
          <View style={styles.skeletonTab} />
        )}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={categories.length}
        maxToRenderPerBatch={10}
        windowSize={20}
      />
      
      <View style={styles.productsContainer}>
        <View style={styles.productRow}>
          {[1, 2].map((item) => (
            <View key={item} style={styles.skeletonProductItem}>
              <View style={styles.skeletonImage} />
              <View style={styles.skeletonInfo}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonPrice} />
                <View style={styles.skeletonRating} />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.productRow}>
          {[3, 4].map((item) => (
            <View key={item} style={styles.skeletonProductItem}>
              <View style={styles.skeletonImage} />
              <View style={styles.skeletonInfo}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonPrice} />
                <View style={styles.skeletonRating} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  ), [categories]);

  // Show skeleton loading state
  if (loading) {
    return SkeletonLoader;
  }

  return (
    <View style={styles.section}>
      <SectionTitle title={section.title} />
      {TabsContainer}
      
      <FlatList
        numColumns={2}
        showsVerticalScrollIndicator={false}
        data={products.slice(0, 4)} // Show only first 4 products
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={styles.productsContainer}
        columnWrapperStyle={styles.productRow}
        windowSize={15}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        removeClippedSubviews={Platform.OS === 'android'}
        getItemLayout={(data, index) => ({
          length: width * 0.45 + height * 0.02,
          offset: Math.floor(index / 2) * (width * 0.45 + height * 0.02),
          index,
        })}
        scrollEnabled={false}
        updateCellsBatchingPeriod={50}
        key={`grid-2-columns`} // Add unique key to prevent numColumns issues
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
      
      {section.showExploreMore && (
        <TouchableOpacity 
          style={styles.exploreMoreButton} 
          activeOpacity={0.8}
          onPress={handleExploreMore}
        >
          <View style={styles.exploreMoreContent}>
            <Text style={styles.exploreMoreText}>EXPLORE MORE</Text>
            <Forwardarrow width={28} height={20} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.04,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: '400',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 4,
  },
  arrowContainer: {
    top: 3,
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  tabsContainer: {
    left: 53,
    flexDirection: 'row',
    marginBottom: height * 0.02,
    paddingBottom: height * 0.01,
    paddingRight: width * 0.05, // Add padding to the right for better scroll experience
  },
  tab: {
    paddingHorizontal: width * 0.0,
    paddingVertical: height * 0.01,
    marginRight: width * 0.05,
    alignItems: 'center',
  },
  tabText: {
    fontSize: width * 0.032,
    fontWeight: '500',
    color: '#888',
    fontFamily: getFontFamily(),
    letterSpacing: 1.8,
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  diamondIndicator: {
    width: 7,
    height: 7,
    backgroundColor: '#000',
    transform: [{ rotate: '45deg' }],
    marginTop: height * 0.007,
  },
  productsContainer: {
    paddingBottom: height * 0.02,
  },
  productRow: {
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
    fontFamily: getFontFamily(),
    lineHeight: 16,
    letterSpacing: 0,
    marginBottom: height * 0.005,
  },
  priceContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '400',
    color: '#C0914B',
    fontFamily: getFontFamily(),
    lineHeight: 24,
    letterSpacing: 0,
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
    fontFamily: getFontFamily(),
  },
  exploreMoreButton: {
    borderWidth: 0.8,
    borderColor: '#000',
    backgroundColor: 'transparent',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.03,
    alignSelf: 'center',
  },
  exploreMoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: width * 0.01,
  },
  exploreMoreText: {
    fontSize: width * 0.032,
    fontWeight: '500',
    color: '#000',
    fontFamily: getFontFamily(),
    letterSpacing: 1.5,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Skeleton styles
  skeletonTitle: {
    width: width * 0.4,
    height: width * 0.05,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    alignSelf: 'center',
  },
  skeletonArrow: {
    width: 130,
    height: 18,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    alignSelf: 'center',
  },
  skeletonTab: {
    width: width * 0.15,
    height: height * 0.03,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: width * 0.05,
  },
  skeletonProductItem: {
    width: width * 0.44,
    backgroundColor: '#fff',
    marginBottom: height * 0.02,
  },
  skeletonImage: {
    width: '100%',
    height: width * 0.55,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  skeletonInfo: {
    marginTop: height * 0.01,
  },
  skeletonProductTitle: {
    width: '80%',
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: height * 0.005,
  },
  skeletonPrice: {
    width: '40%',
    height: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: height * 0.005,
  },
  skeletonRating: {
    width: '30%',
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    alignSelf: 'flex-end',
  }, 
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: getFontFamily(),
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
  likeButtonOutOfStock: {
    opacity: 0.5,
  },
  productTitleOutOfStock: {
    opacity: 0.6,
  },
  productPriceOutOfStock: {
    opacity: 0.6,
  },
  ratingTextOutOfStock: {
    opacity: 0.6,
  },
});

export default TabbedGridSection;
