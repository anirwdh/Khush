import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import Rating from '../../assets/Icons/Rating.jsx';
import LikeIcon from '../../assets/Icons/LikeIcons.jsx';
import WishListedLike from '../../assets/Icons/WishListedLike.jsx';
import Forwardarrow from '../../assets/Icons/Forwardarrow.jsx';
import HeadingArrow from '../../assets/Icons/HeadingArrow.jsx';
import { getFontFamily } from '../../utils/fontLoader';
import { useWishlistSync } from '../../hooks/useWishlistSync';
import { useAuthGuard } from '../../hooks/useAuthGuard';

const { width, height } = Dimensions.get('window');

const HorizontalScrollSection = React.memo(({ section }) => {
  const navigation = useNavigation();
  const route = useRoute();

  // Transform section data to ensure consistent format with stock information
  const transformedData = useMemo(() => {
    if (section.data && Array.isArray(section.data)) {
      return section.data.map(item => ({
        id: item.id || item._id,
        title: item.title || item.name || 'Product',
        price: item.price,
        rating: item.rating || item.avgRating || 0,
        image: item.image,
        inStock: item.inStock,
        availableQuantity: item.availableQuantity
      }));
    }
    return [];
  }, [section.data]);

  // Use global wishlist sync for real-time synchronization
  const { requireAuth } = useAuthGuard();
  const {
    isWishlisted,
    toggleWishlist,
    pendingOperations,
    wishlistIds
  } = useWishlistSync();

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

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <HeadingArrow width={130} height={18} />
      </View>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={transformedData}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={styles.horizontalContainer}
        snapToInterval={width * 0.4 + width * 0.02}
        decelerationRate="fast"
        snapToAlignment="center"
        windowSize={5}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        removeClippedSubviews={Platform.OS === 'android'}
        getItemLayout={(data, index) => ({
          length: width * 0.4,
          offset: index * (width * 0.4 + width * 0.02),
          index,
        })}
      />
      
      {section.showExploreMore && (
        <TouchableOpacity 
          style={styles.exploreMoreButton} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate(section.exploreMoreRoute, { section: section.id })}
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
    top: -13,
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  horizontalContainer: {
    paddingRight: width * 0.05,
  },
  productItem: {
    width: width * 0.4,
    backgroundColor: '#fff',
    marginRight: width * 0.02,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: height * 0.01,
  },
  productImage: {
    width: '100%',
    height: width * 0.5,
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
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
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

export default HorizontalScrollSection;
