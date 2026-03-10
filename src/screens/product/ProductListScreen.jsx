import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import LikeIcon from '../../assets/Icons/LikeIcons.jsx';
import WishListedLike from '../../assets/Icons/WishListedLike.jsx';
import Rating from '../../assets/Icons/Rating.jsx';
import { getItemsByCategory } from '../../services/itemsService';
import { useWishlistSync } from '../../hooks/useWishlistSync';
import { useAuthGuard } from '../../hooks/useAuthGuard';

const { width, height } = Dimensions.get('window');

const ProductListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryName, setCategoryName] = useState('NEW ARRIVALS');
  const itemsPerPage = 14; // 7 rows × 2 columns
  const [pincode, setPincode] = useState('201309'); // Default pincode

  // Use global wishlist sync for real-time synchronization
  const { requireAuth } = useAuthGuard();
  const {
    isWishlisted,
    toggleWishlist,
    pendingOperations,
    wishlistIds
  } = useWishlistSync();

  // Get categoryId, categoryName, and sectionTitle from route params
  const { categoryId, categoryName: routeCategoryName, sectionTitle } = route.params || {};

  useEffect(() => {
    if (routeCategoryName) {
      setCategoryName(routeCategoryName.toUpperCase());
    }
  }, [routeCategoryName]);

  // Format header text
  const headerText = sectionTitle && categoryName 
    ? `${sectionTitle.toUpperCase()} `
    : categoryName || 'NEW ARRIVALS';

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch all products with higher limit for "EXPLORE MORE" functionality
      const response = await getItemsByCategory(categoryId, pincode, 1, 100);
      if (response?.success && response?.data?.items) {
        // Transform API response to match expected format
        const transformedProducts = response.data.items.map(item => ({
          id: item._id,
          title: item.name || 'Product',
          subtitle: item.shortDescription || 'Product description',
          price: item.price ? `₹${item.price}` : '₹0',
          rating: item.avgRating || 0,
          image: item.thumbnail ? { uri: item.thumbnail } : require('../../assets/Images/image.png'),
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, pincode]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Calculate current page products
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);

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

  const renderProduct = useCallback(({ item, index }) => {
    const isLiked = getWishlistStatus(item.id);
    
    return (
      <TouchableOpacity 
        style={styles.productItem}
        onPress={() => navigation.navigate('ProductDetail', { itemId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.productImageContainer}>
          <Image source={item.image} style={styles.productImage} resizeMode="cover" />
          <TouchableOpacity 
            style={[
              styles.likeButton,
              pendingOperations.has(item.id) && styles.likeButtonDisabled
            ]}
            onPress={() => handleToggleWishlist(item.id)}
            disabled={pendingOperations.has(item.id)}
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
          <Text style={styles.productTitle}>{item.title}</Text>
          <Text style={styles.productSubtitle} numberOfLines={1} ellipsizeMode="tail">{item.subtitle}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>{item.price}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              <Rating width={14} height={14} />
            </View>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, getWishlistStatus, handleToggleWishlist, pendingOperations]);

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

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <BackIcon width={26} height={26} />
          </TouchableOpacity>
          <Text style={styles.detailsText}>{headerText}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </View>
    );
  }

  // Show empty state when no categoryId
  if (!categoryId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <BackIcon width={26} height={26} />
          </TouchableOpacity>
          <Text style={styles.detailsText}>NEW ARRIVALS</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubText}>Try adjusting your filters or browse our new arrivals</Text>
        </View>
      </View>
    );
  }

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
        
        <Text style={styles.detailsText}>{headerText}</Text>
      </View>

      {/* Product Grid */}
      <FlatList
        data={currentProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubText}>Try adjusting your filters or browse our new arrivals</Text>
          </View>
        }
        ListFooterComponent={
          currentProducts.length > 0 && totalPages > 1 ? (
            <View style={styles.paginationContainer}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(renderPaginationButton)}
            </View>
          ) : null
        }
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
    paddingBottom: 7,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5ff',
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
  productList: {
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
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
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default ProductListScreen;
