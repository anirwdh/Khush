import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Platform, ScrollView,Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import LikeIcon from '../../assets/Icons/LikeIcons.jsx';
import Rating from '../../assets/Icons/Rating.jsx';
import FilterIcon from '../../assets/Icons/FilterIcon.jsx';
import ClockIcon from '../../assets/Icons/ClockIcon.jsx';
import FilterOptions from '../../Components/FilterOptions.jsx';
import { getItemsByCategory } from '../../services/itemsService';
import { useLocation } from '../../redux/hooks';

const { width, height } = Dimensions.get('window');

const CollectionListingScreen = ({ route }) => {
  const navigation = useNavigation();
  const { pincode } = useLocation(); // Get pincode from Redux
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('TOP WEAR');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDropdownModal, setShowDropdownModal] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState('T-SHIRTS');
  const [appliedFilters, setAppliedFilters] = useState({});
  const [loadedImages, setLoadedImages] = useState({});
  const { collectionName, categoryId } = route.params || { collectionName: "Men's", categoryId: null };
  const itemsPerPage = 14; // 7 rows × 2 columns

  console.log('Pincode from Redux:', pincode); // Debug log

  // Fetch products using React Query
  const { data: itemsData, isLoading, error } = useQuery({
    queryKey: ['items', categoryId, pincode],
    queryFn: () => getItemsByCategory(categoryId, pincode),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    cacheTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch when app comes to foreground
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  // Extract products from API response
  const products = useMemo(() => {
    if (itemsData?.success && itemsData?.data?.items) {
      return itemsData.data.items;
    }
    return [];
  }, [itemsData]);

  // Handle image load
  const handleImageLoad = useCallback((itemId) => {
    setLoadedImages(prev => ({ ...prev, [itemId]: true }));
  }, []);

  // Sort options for dropdown
  const sortOptions = ['T-SHIRTS', 'JEANS', 'JACKETS', 'KURTAS', 'SHIRTS', 'TROUSERS', 'SHORTS', 'HOODIES'];

  // Calculate current page products
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  // Debug console logs
  console.log('Total Products:', products.length);
  console.log('Items Per Page:', itemsPerPage);
  console.log('Total Pages:', totalPages);
  console.log('Current Page:', currentPage);
  console.log('Current Products Count:', currentProducts.length);

  const renderProduct = ({ item, index }) => {
    // Get the first variant's first image as thumbnail
    const thumbnail = item.variants?.[0]?.images?.[0]?.url || null;
    const price = item.discountedPrice || item.price;
    const originalPrice = item.price;
    
    return (
      <TouchableOpacity 
        style={styles.productItem}
        onPress={() => navigation.navigate('ProductDetail', { itemId: item._id })}
        activeOpacity={0.8}
      >
        <View style={styles.productImageContainer}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.productImage} resizeMode="cover" />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]} />
          )}
          <TouchableOpacity style={styles.likeButton} activeOpacity={0.8}>
            <LikeIcon width={34} height={34} />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfoContainer}>
          <Text style={styles.productTitle}>{item.name}</Text>
          <Text style={styles.productSubtitle} numberOfLines={1} ellipsizeMode="tail">{item.shortDescription}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₹{price}</Text>
            {originalPrice !== price && (
              <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            )}
          </View>
          {item.avgRating > 0 && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                <Rating width={14} height={14} />
              </View>
              <Text style={styles.ratingText}>{item.avgRating}</Text>
            </View>
          )}
          {/* <View style={styles.deliveryContainer}>
            <ClockIcon width={11} height={11} />
            <Text style={styles.deliveryText}>GET IN 90 min.</Text>
          </View> */}
        </View>
      </TouchableOpacity>
    );
  };

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
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <BackIcon width={26} height={26} />
          </TouchableOpacity>
          <Text style={styles.detailsText}>{collectionName.toUpperCase()} COLLECTION</Text>
        </View>
        
        {/* FILTER TABS */}
        <View style={styles.filterContainer}>
          {/* Category Tabs Skeleton */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {['TOP WEAR', 'BOTTOM WEAR', 'SETS & OCCASIONS'].map((tab, index) => (
              <View key={index} style={[styles.categoryTab, styles.skeleton]} />
            ))}
          </ScrollView>

          {/* Secondary Filters Skeleton */}
          <View style={styles.secondaryFilters}>
            <View style={[styles.filterPill, styles.skeleton]} />
            <View style={[styles.dropdownPill, styles.skeleton]} />
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <BackIcon width={26} height={26} />
          </TouchableOpacity>
          <Text style={styles.detailsText}>{collectionName.toUpperCase()} COLLECTION</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error?.message || 'Failed to fetch products'}</Text>
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
        
        <Text style={styles.detailsText}>{collectionName.toUpperCase()} COLLECTION</Text>
      </View>

      {/* FILTER TABS */}
      <View style={styles.filterContainer}>
        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={styles.categoryTabsContent}
        >
          {['TOP WEAR', 'BOTTOM WEAR', 'SETS & OCCASIONS', 'ACCESSORIES', 'SHOES', 'BAGS'].map(tab => {
                const isActive = activeCategory === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.categoryTab,
                      isActive && styles.categoryTabActive,
                    ]}
                    onPress={() => setActiveCategory(tab)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        isActive && styles.categoryTabTextActive,
                      ]}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
        </ScrollView>

        {/* Secondary Filters */}
        <View style={styles.secondaryFilters}>
          <TouchableOpacity 
            style={styles.filterPill} 
            activeOpacity={0.8}
            onPress={() => setShowFilterModal(true)}
          >
          <FilterIcon width={19} height={15} style={styles.filterIcon} />
          <Text style={styles.filterText}>FILTER</Text>
        </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dropdownPill} 
            activeOpacity={0.8}
            onPress={() => setShowDropdownModal(true)}
          >
            <Text style={styles.dropdownText}>{selectedSortOption}</Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Grid */}
      <FlatList
        data={currentProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
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
  dropdownPill: {
    right:130,
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
  },
  deliveryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    marginLeft: 4,
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
    borderRadius: 4,
  },
  skeletonSmall: {
    backgroundColor: '#f2f2f2',
    borderRadius: 17,
  },
});

export default CollectionListingScreen;