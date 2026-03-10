import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Platform, ScrollView,Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import LikeIcon from '../../assets/Icons/LikeIcons.jsx';
import WishListedLike from '../../assets/Icons/WishListedLike.jsx';
import Rating from '../../assets/Icons/Rating.jsx';
import FilterIcon from '../../assets/Icons/FilterIcon.jsx';
import ClockIcon from '../../assets/Icons/ClockIcon.jsx';
import FilterOptions from '../../Components/FilterOptions.jsx';
import { getItemsByCategory, searchItemsBySubcategory, searchItems } from '../../services/itemsService';
import { getSubcategories } from '../../services/subcategoryService';
import { wishlistService } from '../../services/api/wishlistService';
import { useLocation } from '../../redux/hooks';
import { triggerLightHaptic, triggerDrizzleHaptic } from '../../utils/haptic';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { useWishlistSync } from '../../hooks/useWishlistSync';

// Add global error handler for unhandled promise rejections
if (!__DEV__) {
  const defaultErrorHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.log('Global error handler:', error, isFatal);
    // Prevent crash by logging instead of throwing
    return defaultErrorHandler(error, isFatal);
  });
}

const { width, height } = Dimensions.get('window');

const CollectionListingScreen = ({ route }) => {
  console.log('CollectionListingScreen rendering with params:', route.params);
  
  const navigation = useNavigation();
  const { requireAuth } = useAuthGuard();
  const { pincode } = useLocation(); // Get pincode from Redux
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeSubcategoryId, setActiveSubcategoryId] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDropdownModal, setShowDropdownModal] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState('T-SHIRTS');
  const [appliedFilters, setAppliedFilters] = useState({});
  const [loadedImages, setLoadedImages] = useState({});
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const flatListRef = React.useRef(null);
  const { collectionName, categoryId, searchQuery, subcategoryId, targetSubcategoryId } = route.params || { collectionName: "Men's", categoryId: null, searchQuery: null, subcategoryId: null, targetSubcategoryId: null };
  const itemsPerPage = 14; // 7 rows × 2 columns

  console.log('Pincode from Redux:', pincode); // Debug log

  // Fetch products using React Query based on search query, selected subcategory or category
  const { data: itemsData, isLoading, error, refetch } = useQuery({
    queryKey: ['items', searchQuery, activeSubcategoryId, categoryId, pincode, currentPage, appliedFilters],
    queryFn: async () => {
      try {
        if (searchQuery) {
          // Handle search query
          const result = await searchItems(searchQuery, pincode, currentPage, itemsPerPage, appliedFilters);
          return result;
        } else if (activeSubcategoryId) {
          const result = await searchItemsBySubcategory(activeSubcategoryId, pincode, currentPage, itemsPerPage, appliedFilters);
          return result;
        } else {
          const result = await getItemsByCategory(categoryId, pincode, appliedFilters);
          return result;
        }
      } catch (error) {
        console.error('Query function error:', error);
        // Return safe fallback data instead of throwing
        return {
          success: false,
          message: error.message || 'Failed to fetch items',
          data: {
            items: [],
            pagination: {
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0
            }
          }
        };
      }
    },
    enabled: !!(searchQuery || activeSubcategoryId || categoryId),
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    cacheTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch when app comes to foreground
    refetchOnReconnect: false, // Don't refetch on network reconnect
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors, but not for 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false; // Don't retry client errors
      }
      return failureCount < 3; // Retry up to 3 times for other errors
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    onError: (error) => {
      console.error('React Query error:', error);
      // Prevent crash by handling error gracefully
    },
  });

  // Fetch subcategories for filter tabs
  const { data: subcategoriesData } = useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: () => getSubcategories({ categoryId, page: 1, limit: 10 }),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Console log the filter tabs data response
  console.log('Filter Tabs API Response:', subcategoriesData);

  // Update subcategories state and set first one as active
  useEffect(() => {
    try {
      if (subcategoriesData?.subcategories && Array.isArray(subcategoriesData.subcategories) && subcategoriesData.subcategories.length > 0) {
        const validSubcategories = subcategoriesData.subcategories.filter(sub => 
          sub && sub._id && sub.name
        );
        
        if (validSubcategories.length > 0) {
          setSubcategories(validSubcategories);
          
          // Check if a specific targetSubcategoryId was passed from OptionsScreen and we haven't auto-selected yet
          if (targetSubcategoryId && !hasAutoSelected && !activeSubcategoryId) {
            const targetSubcategory = validSubcategories.find(sub => sub._id === targetSubcategoryId);
            if (targetSubcategory) {
              console.log('Auto-selecting subcategory from route params:', targetSubcategory.name);
              setActiveCategory(targetSubcategory.name);
              setActiveSubcategoryId(targetSubcategory._id);
              setHasAutoSelected(true); // Mark that we've auto-selected
            }
          }
        } else {
          console.log('No valid subcategories found');
          setSubcategories([]);
        }
      } else {
        console.log('No subcategories data received or invalid structure');
        setSubcategories([]);
      }
    } catch (error) {
      console.error('Error in subcategories useEffect:', error);
      setSubcategories([]);
    }
  }, [subcategoriesData, activeCategory, activeSubcategoryId, targetSubcategoryId, hasAutoSelected]);

  // Debug log for state changes
  useEffect(() => {
    console.log('State changed - activeSubcategoryId:', activeSubcategoryId, 'activeCategory:', activeCategory);
  }, [activeSubcategoryId, activeCategory]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear any pending timeouts or intervals
      if (flatListRef.current) {
        flatListRef.current = null;
      }
    };
  }, []);

  // Scroll to top when active subcategory changes - instant positioning
  useEffect(() => {
    if (flatListRef.current) {
      // Scroll to top whenever subcategory changes (including when it becomes null)
      flatListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [activeSubcategoryId]);

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

  // ProductCard component for optimal performance
  const ProductCard = React.memo(({ item, isWishlisted, onToggle, navigation, pendingOperations }) => {
    if (!item || !item._id) {
      return null;
    }
    
    const thumbnail = item.thumbnail || null;
    const price = item.discountedPrice || item.price;
    const originalPrice = item.price;
    const isOutOfStock = item.inStock === false || item.availableQuantity === 0;
    
    return (
      <View style={[styles.productItem, isOutOfStock && styles.productItemOutOfStock]}>
        <TouchableOpacity 
          style={[styles.productTouchable, isOutOfStock && styles.productTouchableOutOfStock]}
          onPress={() => navigation.navigate('ProductDetail', { itemId: item._id })}
          activeOpacity={0.8}
        >
          <View style={styles.productImageContainer}>
            {thumbnail ? (
              <Image 
                source={{ uri: thumbnail }} 
                style={[styles.productImage, isOutOfStock && styles.productImageOutOfStock]} 
                resizeMode="cover" 
              />
            ) : (
              <View style={[styles.productImage, styles.placeholderImage]} />
            )}
            {isOutOfStock && (
              <View style={styles.outOfStockOverlay}>
                <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
              </View>
            )}
            <TouchableOpacity 
              style={[
                styles.likeButton, 
                pendingOperations.has(item._id) && styles.likeButtonDisabled,
                isOutOfStock && styles.likeButtonOutOfStock
              ]} 
              activeOpacity={0.8}
              onPress={() => !isOutOfStock && onToggle(item._id)}
              disabled={pendingOperations.has(item._id) || isOutOfStock}
            >
              {isWishlisted ? (
                <WishListedLike width={34} height={34} />
              ) : (
                <LikeIcon width={34} height={34} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.productInfoContainer}>
            {item.deliveryType === '90_MIN' && (
              <View style={styles.deliveryContainer}>
                <ClockIcon width={12} height={12} />
                <Text style={styles.deliveryText}>GET IN 90 MINS</Text>
              </View>
            )}
            <Text style={[styles.productTitle, isOutOfStock && styles.productTitleOutOfStock]}>
              {item.name || 'Product'}
            </Text>
            <Text style={[styles.productSubtitle, isOutOfStock && styles.productSubtitleOutOfStock]} numberOfLines={1} ellipsizeMode="tail">
              {item.shortDescription || ''}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.productPrice, isOutOfStock && styles.productPriceOutOfStock]}>
                ₹{price || 0}
              </Text>
              {originalPrice !== price && (
                <Text style={[styles.originalPrice, isOutOfStock && styles.originalPriceOutOfStock]}>
                  ₹{originalPrice}
                </Text>
              )}
            </View>
            {item.avgRating > 0 && (
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  <Rating width={14} height={14} />
                </View>
                <Text style={[styles.ratingText, isOutOfStock && styles.ratingTextOutOfStock]}>
                  {item.avgRating}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  });

  // Query client for invalidating cache
  const queryClient = useQueryClient();

  // Handle wishlist toggle with auth guard and global sync
  const handleToggleWishlist = useCallback(async (itemId) => {
    // Use auth guard to check authentication and redirect if needed
    const isAllowed = await requireAuth(
      'CollectionListingScreen', // Current screen name
      { 
        collectionName, 
        categoryId,
        // Preserve other state if needed
        activeCategory,
        selectedSortOption,
        appliedFilters
      },
      'wishlist' // Pending action
    );
    
    if (!isAllowed) return;
    
    // Use global toggle function
    toggleWishlist(itemId);
  }, [requireAuth, collectionName, categoryId, activeCategory, selectedSortOption, appliedFilters, toggleWishlist]);


  // Extract products from API response
  const products = useMemo(() => {
    try {
      if (itemsData?.success === false) {
        // Handle error response from API service
        console.log('API returned error response:', itemsData.message);
        return [];
      }
      
      if (itemsData?.success && itemsData?.data?.items && Array.isArray(itemsData.data.items)) {
        return itemsData.data.items;
      }
      
      // Handle unexpected response structure
      if (!itemsData) {
        console.log('No itemsData received');
        return [];
      }
      
      console.log('Unexpected response structure:', itemsData);
      return [];
    } catch (error) {
      console.error('Error extracting products:', error);
      return [];
    }
  }, [itemsData]);

  // Extract pagination info from API response
  const pagination = useMemo(() => {
    try {
      if (itemsData?.success === false) {
        // Handle error response from API service
        return { total: 0, page: 1, limit: 10, totalPages: 0 };
      }
      
      if (itemsData?.success && itemsData?.data?.pagination) {
        return itemsData.data.pagination;
      }
      
      // Handle unexpected response structure
      return { total: 0, page: 1, limit: 10, totalPages: 0 };
    } catch (error) {
      console.error('Error extracting pagination:', error);
      return { total: 0, page: 1, limit: 10, totalPages: 0 };
    }
  }, [itemsData]);

  // Stable key extractor for FlatList to prevent view hierarchy issues
  const keyExtractor = useCallback((item, index) => {
    if (!item || !item._id) {
      return `fallback-key-${index}`;
    }
    return item._id.toString();
  }, []);

  // Debounced filter tab press handler to prevent rapid state changes
  const debouncedFilterPress = useCallback((subcategory) => {
    if (!subcategory || !subcategory.name || !subcategory._id) return;
    
    console.log('Filter tab pressed:', subcategory.name);
    
    // Trigger drizzle haptic feedback for filter tabs
    triggerDrizzleHaptic();
    
    // Check if tapping the same active tab - if so, deselect it (reset to category view)
    if (subcategory._id === activeSubcategoryId) {
      console.log('Deselecting filter tab - returning to category view');
      setActiveCategory('');
      setActiveSubcategoryId(null);
      setCurrentPage(1);
      
      // Scroll to top when filter is deselected - instant positioning like initial load
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: false });
        }
      }, 0);
    } else {
      // Select new filter tab
      setActiveCategory(subcategory.name);
      setActiveSubcategoryId(subcategory._id);
      setCurrentPage(1);
      
      // Scroll to top when filter changes - instant positioning like initial load
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: false });
        }
      }, 0);
    }
  }, [activeSubcategoryId]);

  // Check if any filters are applied
  const hasActiveFilters = useMemo(() => {
    return appliedFilters && Object.keys(appliedFilters).some(key => 
      appliedFilters[key] && appliedFilters[key].length > 0
    );
  }, [appliedFilters]);

  // Handle filter application
  const handleApplyFilters = useCallback((filters) => {
    console.log('Applying filters:', filters);
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
    
    // Scroll to top when filters are applied - instant positioning
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, []);

  // Handle filter reset
  const handleResetFilters = useCallback(() => {
    console.log('Resetting filters');
    setAppliedFilters({});
    setCurrentPage(1); // Reset to first page when filters reset
    
    // Scroll to top when filters are reset - instant positioning
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, []);

  // Sort options for dropdown
  const sortOptions = ['T-SHIRTS', 'JEANS', 'JACKETS', 'KURTAS', 'SHIRTS', 'TROUSERS', 'SHORTS', 'HOODIES'];

  // Calculate current page products and pagination
  const currentProducts = useMemo(() => {
    if (searchQuery || activeSubcategoryId) {
      // For search or subcategory search, use API pagination - products are already paginated
      return products;
    } else {
      // For category view, use client-side pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return products.slice(startIndex, endIndex);
    }
  }, [products, currentPage, itemsPerPage, searchQuery, activeSubcategoryId]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (searchQuery || activeSubcategoryId) {
      // For search or subcategory search, use API pagination
      return pagination.totalPages || 1;
    } else {
      // For category view, use client-side pagination
      return Math.ceil(products.length / itemsPerPage);
    }
  }, [products, itemsPerPage, searchQuery, activeSubcategoryId, pagination]);
  
  // Debug console logs
  console.log('Active Subcategory ID:', activeSubcategoryId);
  console.log('Active Category Name:', activeCategory);
  console.log('Total Products:', products.length);
  console.log('Items Per Page:', itemsPerPage);
  console.log('Total Pages:', totalPages);
  console.log('Current Page:', currentPage);
  console.log('Current Products Count:', currentProducts.length);
  console.log('Pagination Info:', pagination);

  // Optimized renderProduct using ProductCard
  const renderProduct = useCallback(({ item }) => {
    if (!item || !item._id) return null;
    return (
      <ProductCard
        item={item}
        isWishlisted={isWishlisted(item._id)}
        onToggle={handleToggleWishlist}
        navigation={navigation}
        pendingOperations={pendingOperations}
      />
    );
  }, [isWishlisted, handleToggleWishlist, navigation, pendingOperations]);

  // Handle page changes
  const handlePageChange = useCallback((pageNumber) => {
    if (searchQuery || activeSubcategoryId) {
      // For search or subcategory search, we need to refetch with new page
      setCurrentPage(pageNumber);
    } else {
      // For category view, just change the current page for client-side pagination
      setCurrentPage(pageNumber);
    }
  }, [searchQuery, activeSubcategoryId]);

  const renderPaginationButton = (pageNumber) => (
    <TouchableOpacity
      key={pageNumber}
      style={[
        styles.paginationButton,
        currentPage === pageNumber && styles.paginationButtonActive
      ]}
      onPress={() => handlePageChange(pageNumber)}
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

  // Skeleton component for product loading
  const ProductSkeleton = () => (
    <View style={styles.productItem}>
      <View style={styles.productImageContainer}>
        <View style={[styles.productImage, styles.skeleton]} />
        <View style={[styles.likeButton, styles.skeletonSmall]} />
      </View>
      <View style={styles.productInfoContainer}>
        <View style={[styles.skeleton, { height: 14, width: '60%', marginBottom: 4 }]} />
        <View style={[styles.skeleton, { height: 10, width: '80%', marginBottom: 8 }]} />
        <View style={styles.priceContainer}>
          <View style={[styles.skeleton, { height: 16, width: 40 }]} />
        </View>
        <View style={styles.ratingContainer}>
          <View style={[styles.skeleton, { height: 12, width: 60 }]} />
        </View>
      </View>
    </View>
  );

  // Show loading skeleton state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeScreen')}
            activeOpacity={0.8}
          >
            <BackIcon width={26} height={26} />
          </TouchableOpacity>
          <Text style={styles.detailsText}>{collectionName.toUpperCase()} COLLECTION</Text>
        </View>
        
        {/* FILTER TABS - Show for category/subcategory views, and simplified filters for search */}
        <View style={styles.filterContainer}>
          {!searchQuery ? (
            // Full filter tabs for category/subcategory views
            <>
              {/* Category Tabs Skeleton */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryTabs}
                contentContainerStyle={styles.categoryTabsContent}
              >
                {subcategories.length > 0 ? subcategories.map((_, index) => (
                  <View key={index} style={[styles.categoryTab, styles.skeleton]} />
                )) : [1, 2, 3].map((index) => (
                  <View key={index} style={[styles.categoryTab, styles.skeleton]} />
                ))}
              </ScrollView>
            </>
          ) : (
            // Search mode - no category tabs, just empty space
            <View style={styles.searchModePlaceholder} />
          )}

          {/* Secondary Filters Skeleton - Show for both search and category views */}
          <View style={styles.secondaryFilters}>
            <View style={[styles.filterPill, styles.skeleton]} />
          </View>
        </View>

        {/* Product Grid Skeleton */}
        <FlatList
          data={Array.from({ length: 8 })} // Show 8 skeleton items
          renderItem={() => <ProductSkeleton />}
          keyExtractor={(item, index) => `skeleton-${index}`}
          numColumns={2}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeScreen')}
            activeOpacity={0.8}
          >
            <BackIcon width={26} height={26} />
          </TouchableOpacity>
          <Text style={styles.detailsText}>{collectionName.toUpperCase()} COLLECTION</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || 'Failed to fetch products. Please check your internet connection.'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => refetch()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  try {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeScreen')}
            activeOpacity={0.8}
          >
            <BackIcon width={26} height={26} />
          </TouchableOpacity>
          
          <Text style={styles.detailsText}>
            {searchQuery ? searchQuery.toUpperCase() : collectionName.toUpperCase()}
          </Text>
        </View>

        {/* FILTER TABS - Show for category/subcategory views, and simplified filters for search */}
        <View style={styles.filterContainer}>
          {!searchQuery ? (
            // Full filter tabs for category/subcategory views
            <>
              {/* Category Tabs */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryTabs}
                contentContainerStyle={styles.categoryTabsContent}
              >
                {/* ALL ITEMS Tab - always visible */}
                <TouchableOpacity
                  key="all-items"
                  style={[
                    styles.categoryTab,
                    !activeSubcategoryId && styles.categoryTabActive,
                  ]}
                  onPress={() => {
                    // Trigger drizzle haptic feedback
                    triggerDrizzleHaptic();
                    
                    console.log('ALL ITEMS tab pressed - current activeSubcategoryId:', activeSubcategoryId);
                    
                    // Deselect any active subcategory
                    setActiveCategory('');
                    setActiveSubcategoryId(null);
                    setCurrentPage(1);
                    
                    // Scroll to top - instant positioning
                    setTimeout(() => {
                      if (flatListRef.current) {
                        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
                      }
                    }, 0);
                  }}
                  activeOpacity={0.8}
                  disabled={isFilterLoading}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      !activeSubcategoryId && styles.categoryTabTextActive,
                    ]}
                  >
                    ALL ITEMS
                  </Text>
                </TouchableOpacity>

                {subcategories && subcategories.length > 0 ? (
                  subcategories.map(subcategory => {
                    if (!subcategory || !subcategory._id || !subcategory.name) return null;
                    const isActive = activeCategory === subcategory.name;
                    return (
                      <TouchableOpacity
                        key={subcategory._id}
                        style={[
                          styles.categoryTab,
                          isActive && styles.categoryTabActive,
                          isFilterLoading && isActive && styles.categoryTabLoading,
                        ]}
                        onPress={() => debouncedFilterPress(subcategory)}
                        activeOpacity={0.8}
                        disabled={isFilterLoading}
                      >
                        <Text
                          style={[
                            styles.categoryTabText,
                            isActive && styles.categoryTabTextActive,
                            isFilterLoading && isActive && styles.categoryTabTextLoading,
                          ]}
                        >
                          {isFilterLoading && isActive ? 'LOADING...' : (subcategory.name?.toUpperCase() || '')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : null}
              </ScrollView>
            </>
          ) : (
            // Search mode - no category tabs, just empty space
            <View style={styles.searchModePlaceholder} />
          )}

          {/* Secondary Filters - Show for both search and category views */}
          <View style={styles.secondaryFilters}>
            <TouchableOpacity 
              style={styles.filterPill}
              activeOpacity={0.8}
              onPress={() => setShowFilterModal(true)}
            >
              <FilterIcon width={19} height={15} style={styles.filterIcon} />
              <Text style={styles.filterText}>
                FILTER
              </Text>
              {hasActiveFilters && (
                <View style={styles.filterIndicator} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Grid */}
        <FlatList
          ref={flatListRef}
          data={currentProducts}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
          removeClippedSubviews={false} // Disabled to prevent view hierarchy issues
          maxToRenderPerBatch={5} // Reduced batch size
          windowSize={5} // Reduced window size
          initialNumToRender={5} // Reduced initial render
          updateCellsBatchingPeriod={100} // Slower batching
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10
          }}
          ListFooterComponent={
            <View style={styles.paginationContainer}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(renderPaginationButton)}
            </View>
          }
        />

        {/* Filter Modal */}
        <FilterOptions
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />

        {/* Dropdown Modal */}
        <Modal
          visible={showDropdownModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDropdownModal(false)}
        >
          {/* Overlay */}
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setShowDropdownModal(false)}
          />

          {/* Modal Card */}
          <View style={styles.dropdownModal}>
            {/* Header */}
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>SELECT CATEGORY</Text>
              <TouchableOpacity
                style={styles.dropdownCloseButton}
                onPress={() => setShowDropdownModal(false)}
              >
                <Text style={styles.dropdownCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* OPTIONS */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownOption,
                    selectedSortOption === option && styles.dropdownOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedSortOption(option);
                    setShowDropdownModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      selectedSortOption === option && styles.dropdownOptionTextSelected
                    ]}
                  >
                    {option}
                  </Text>

                  {selectedSortOption === option && (
                    <Text style={styles.dropdownCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  } catch (error) {
    console.error('CollectionListingScreen render error:', error);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeScreen')}
            activeOpacity={0.8}
          >
            <BackIcon width={26} height={26} />
          </TouchableOpacity>
          <Text style={styles.detailsText}>{collectionName.toUpperCase()} COLLECTION</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Rendering error occurred. Please restart the app.</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeScreen')}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>GO BACK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
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
    paddingHorizontal: width * 0.07,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 7,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5ff',
  },
  filterContainer: {
    paddingHorizontal: width * 0.05,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  /* CATEGORY TABS */
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  categoryTabsContent: {
    paddingHorizontal: width * 0,
  },
  categoryTab: {
    width: width * 0.34, // 2.5 tabs visible initially
    height: 39,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#000',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter-Regular',
    textAlign: 'center',
    flexShrink: 1, // Prevents text from wrapping
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  categoryTabLoading: {
    opacity: 0.7,
  },
  categoryTabTextLoading: {
    opacity: 0.7,
  },
  /* SECONDARY FILTERS */
  secondaryFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 22,
    paddingHorizontal: 18,
    height: 44,
  },
  filterIcon: {
    marginRight: 6,
    color: '#000',
  },
  filterText: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter-Regular',
  },
  filterPillActive: {
    backgroundColor: '#000',
  },
  filterTextActive: {
    color: '#fff',
  },
  filterIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginLeft: 6,
  },
  dropdownPill: {
    right:117,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 22,
    paddingHorizontal: 18,
    height: 44,
  },
  dropdownText: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#000',
    marginRight: 6,
  },
  dropdownArrow: {
    top:-3,
    fontSize: 14,
    color: '#000',
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
    paddingHorizontal: width * 0.04,
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
    marginBottom: height * 0.0,
  },
  productImage: {
    width: '100%',
    height: width * 0.55,
  },
  placeholderImage: {
    backgroundColor: '#f2f2f2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
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
    marginBottom: height * 0.003,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  deliveryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
    letterSpacing: 0.5,
    marginLeft: 3,
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

  // Dropdown Modal Styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

dropdownModal: {
position: 'absolute',
top: height * 0.25,
alignSelf: 'center',
width: width * 0.85,
maxHeight: height * 0.5,
backgroundColor: '#fff',
borderRadius: 14,
overflow: 'hidden',
},
productItem: {
width: width * 0.45,
marginBottom: 16,
borderRadius: 0,
overflow: 'hidden',
},
dropdownProductTouchable: {
flex: 1,
},
dropdownHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
paddingHorizontal: 20,
paddingVertical: 15,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  dropdownCloseButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownCloseText: {
    fontSize: 18,
    color: '#666',
  },
  dropdownOptions: {
    flex: 1,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dropdownOptionSelected: {
    backgroundColor: '#f8f8f8',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownOptionTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  dropdownCheckmark: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  // Skeleton styles
  skeleton: {
    backgroundColor: '#f2f2f2',
    borderRadius: 0,
  },
  skeletonSmall: {
    backgroundColor: '#f2f2f2',
    borderRadius: 17,
  },
  // Out of stock styles
  productItemOutOfStock: {
    opacity: 0.85,
  },
  productTouchableOutOfStock: {
    // Still tappable but with subtle visual feedback
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
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
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
  originalPriceOutOfStock: {
    color: '#999',
  },
  ratingTextOutOfStock: {
    color: '#666',
  },

  // Search mode styles
  searchModePlaceholder: {
    flex: 1,
  },
});

export default CollectionListingScreen;