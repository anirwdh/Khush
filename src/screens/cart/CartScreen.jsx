import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, Dimensions, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import DeliveryIconCart from '../../assets/Icons/DeliveryIconCart.jsx';
import ArrowTap from '../../assets/Icons/ArrowTap.jsx';
import DropDown from '../../assets/Icons/DropDown.jsx';
import BottomTabBar from '../../Components/BottomTabBar.jsx';
import { cartService } from '../../services/api/cartService';
import { useLocation } from '../../redux/hooks';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { triggerLightHaptic } from '../../utils/haptic';

const deliveryOptions = [
  { label: '1 Day Delivery', value: '1 DAY DELIVERY' },
  { label: '6-7 Days Delivery', value: '6-7 DAYS DELIVERY' },
  { label: '90 Min Delivery', value: '90 MIN DELIVERY' },
];

const DeliveryTimeSelector = ({ value, onSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <View style={styles.deliverySelector}>
      <View style={styles.deliveryRowInline}>
        <Text style={styles.deliveryLabel}>Choose Delivery Time</Text>
        <TouchableOpacity 
          style={styles.deliveryDropdown}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={styles.deliveryDropdownText}>{value}</Text>
          <View style={[styles.arrowIcon, showDropdown && styles.arrowIconRotated]}>
            <DropDown width={16} height={16} left={8} />
          </View>
        </TouchableOpacity>
      </View>
      
      {showDropdown && (
        <View style={styles.dropdownOptions}>
          {deliveryOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.dropdownOption}
              onPress={() => {
                onSelect(option.value);
                setShowDropdown(false);
              }}
            >
              <Text style={styles.dropdownOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const CartItem = React.memo(({ item, onUpdateQuantity, onRemoveItem, onPress, deliveryTime, onDeliveryTimeSelect }) => {
  const cartItem = item;
  const product = cartItem.itemId;
  const variant = cartItem.variant;
  
  const handleDecrement = () => {
    triggerLightHaptic();
    onUpdateQuantity(variant.sku, 'decrease');
  };
  
  const handleIncrement = () => {
    triggerLightHaptic();
    onUpdateQuantity(variant.sku, 'increase');
  };
  
  return (
    <TouchableOpacity 
      style={styles.cartItem} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <DeliveryTimeSelector 
        value={deliveryTime} 
        onSelect={onDeliveryTimeSelect}
      />
      <View style={styles.itemContent}>
        <Image 
          source={{ uri: variant.imageUrl || 'https://picsum.photos/seed/default/400/400' }} 
          style={styles.itemImage} 
        />

        <View style={styles.itemDetails}>
          <Text style={styles.itemBrand}>{product.name}</Text>
          <Text style={styles.itemTitle}>{product.shortDescription}</Text>
          <Text style={styles.variantInfo}>
            {variant.color} | {variant.size}
          </Text>

          <View style={styles.quantityRow}>
            <TouchableOpacity 
              style={styles.qtyBtnCircle} 
              onPress={handleDecrement}
              disabled={cartItem.quantity <= 0}
            >
              <Text style={styles.qtyBtn}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyText}>{cartItem.quantity}</Text>

            <TouchableOpacity 
              style={styles.qtyBtnCircle} 
              onPress={handleIncrement}
            >
              <Text style={styles.qtyBtn}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.priceRow}>
            <TouchableOpacity onPress={() => onRemoveItem(variant.sku)}>
              <Text style={styles.removeText}>Remove Item</Text>
            </TouchableOpacity>
            <Text style={styles.price}>₹{cartItem.itemTotal}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const CartSkeleton = () => {
  return (
    <View style={styles.skeletonContainer}>
      {/* Skeleton Cart Items */}
      {[1, 2].map((item) => (
        <View key={item} style={styles.skeletonItem}>
          {/* Skeleton Delivery Selector */}
          <View style={styles.skeletonDeliverySelector}>
            <View style={styles.skeletonDeliveryLabel} />
            <View style={styles.skeletonDeliveryDropdown} />
          </View>
          
          {/* Skeleton Item Content */}
          <View style={styles.skeletonItemContent}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonDetails}>
              <View style={styles.skeletonBrand} />
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonVariant} />
              <View style={styles.skeletonQuantityRow}>
                <View style={styles.skeletonQtyBtn} />
                <View style={styles.skeletonQtyText} />
                <View style={styles.skeletonQtyBtn} />
              </View>
              <View style={styles.skeletonPriceRow}>
                <View style={styles.skeletonRemoveBtn} />
                <View style={styles.skeletonPrice} />
              </View>
            </View>
          </View>
        </View>
      ))}
      
      {/* Skeleton Address Block */}
      <View style={styles.skeletonAddressBlock}>
        <View style={styles.skeletonAddressLines}>
          <View style={styles.skeletonAddressLine} />
          <View style={styles.skeletonAddressLine} />
          <View style={styles.skeletonAddressLine} />
        </View>
        <View style={styles.skeletonArrow} />
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const CartScreen = ({ route }) => {
  const navigation = useNavigation();
  const { requireAuth } = useAuthGuard();
  const { pincode } = useLocation();
  const [activeTab, setActiveTab] = useState(route?.params?.activeTab || 4);
  const [showTabBar, setShowTabBar] = useState(route?.params?.fromBottomTab || false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartData, setCartData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());
  const [deliveryTime, setDeliveryTime] = useState('90 MIN DELIVERY');

  // Fetch default address using React Query with token authentication
  const { data: defaultAddressData, isLoading: addressLoading, error: addressError } = useQuery({
    queryKey: ['defaultAddress'],
    queryFn: () => cartService.getDefaultAddress(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: true, // Always enabled since auth guard ensures user is authenticated
    onSuccess: (data) => {
      console.log('🏠 CART SCREEN: Address data received:', data);
    },
    onError: (error) => {
      console.log('❌ CART SCREEN: Address error:', error);
    }
  });

  // Fetch cart data on component mount
  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const response = await cartService.getMyCart(null, 1, 10);
      
      if (response.success && response.data && response.data.data) {
        const cartData = response.data.data;
        setCartData(cartData);
        setCartItems(cartData.items || []);
        setLastSyncTime(Date.now());
      } else {
        setCartItems([]);
        setCartData(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
      setCartData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Background sync - silently syncs with server without blocking UI
  const backgroundSync = useCallback(async () => {
    try {
      const response = await cartService.getMyCart(null, 1, 10);
      
      if (response.success && response.data && response.data.data) {
        const cartData = response.data.data;
        setCartData(cartData);
        setLastSyncTime(Date.now());
        
        // Only update cart items if there's a significant difference from local state
        // This prevents UI jitter from minor server differences
        const serverItems = cartData.items || [];
        if (serverItems.length !== cartItems.length) {
          setCartItems(serverItems);
        }
      }
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }, [cartItems.length]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCartData();
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    // Navigation is now handled in BottomTabBar component
  };

  const updateQuantity = useCallback(async (sku, action) => {
    // Use auth guard to check authentication and redirect if needed
    const isAllowed = await requireAuth(
      'CartScreen', // Current screen name
      { fromBottomTab: showTabBar }, // Preserve current state
      'cart' // Pending action
    );
    
    if (!isAllowed) return;

    // Optimistic update - update UI immediately with recalculated totals
    setCartItems(prevItems => {
      if (action === 'decrease') {
        // For decrease action, remove item if quantity would be 0 or less
        return prevItems.map(item => {
          if (item.variant.sku === sku) {
            const newQuantity = item.quantity - 1;
            if (newQuantity > 0) {
              const newItemTotal = item.unitPrice * newQuantity;
              return { ...item, quantity: newQuantity, itemTotal: newItemTotal };
            }
            return null;
          }
          return item;
        }).filter(item => item !== null); // Remove items with null quantity
      } else {
        // For increase action, update quantity and recalculate total
        return prevItems.map(item => {
          if (item.variant.sku === sku) {
            const newQuantity = item.quantity + 1;
            const newItemTotal = item.unitPrice * newQuantity;
            return { ...item, quantity: newQuantity, itemTotal: newItemTotal };
          }
          return item;
        });
      }
    });

    try {
      let response;
      
      if (action === 'increase') {
        response = await cartService.increaseQuantity(sku, pincode);
      } else if (action === 'decrease') {
        response = await cartService.decreaseQuantity(sku);
      }
      
      if (response.success) {
        // Background sync after successful operation (non-blocking)
        setTimeout(() => backgroundSync(), 500);
      } else {
        // Revert optimistic update on error
        await fetchCartData();
        
        if (response.message?.includes('out of stock')) {
          Alert.alert('Out of Stock', response.message);
        } else {
          Alert.alert('Error', response.message || 'Failed to update quantity');
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchCartData();
      Alert.alert('Error', error.message || 'Failed to update quantity');
    }
  }, [requireAuth, showTabBar, pincode, backgroundSync]);

  const removeItem = useCallback(async (sku) => {
    // Use auth guard to check authentication and redirect if needed
    const isAllowed = await requireAuth(
      'CartScreen', // Current screen name
      { fromBottomTab: showTabBar }, // Preserve current state
      'cart' // Pending action
    );
    
    if (!isAllowed) return;

    // Optimistic update - remove item from UI immediately
    setCartItems(prevItems => prevItems.filter(item => item.variant.sku !== sku));
    
    try {
      const response = await cartService.removeItem(sku);
      
      if (response.success) {
        // Background sync after successful operation (non-blocking)
        setTimeout(() => backgroundSync(), 500);
      } else {
        // Revert optimistic update on error
        await fetchCartData();
        Alert.alert('Error', response.message || 'Failed to remove item');
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchCartData();
      Alert.alert('Error', error.message || 'Failed to remove item');
    }
  }, [requireAuth, showTabBar, backgroundSync]);

  // Real-time instant calculation - local first for immediate updates
  const total = useMemo(() => {
    // Always use local calculation for instant UI updates
    return cartItems.reduce((sum, item) => {
      return sum + (item.itemTotal || (item.unitPrice * item.quantity));
    }, 0);
  }, [cartItems]);

  // Server total for background sync comparison
  const serverTotal = useMemo(() => {
    return cartData?.summary?.subTotal || 0;
  }, [cartData]);

  // Flag to indicate if totals are in sync with server (for debugging)
  const isTotalSynced = useMemo(() => {
    return serverTotal === total;
  }, [serverTotal, total]);

  // Fast local total quantity calculation
  const totalQuantity = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);
  }, [cartItems]);

  const handleCheckout = useCallback(async () => {
    // Use auth guard to check authentication and redirect if needed
    const isAllowed = await requireAuth(
      'CartScreen', // Current screen name
      { fromBottomTab: showTabBar }, // Preserve current state
      'checkout' // Pending action
    );
    
    if (!isAllowed) return;

    navigation.navigate('BillSummary');
  }, [requireAuth, showTabBar, navigation]);

  const handleItemPress = useCallback((item) => {
    const productId = item.itemId._id;
    if (productId) {
      navigation.navigate('ProductDetail', { itemId: productId });
    }
  }, [navigation]);

  const renderCartItem = useCallback(({ item }) => {
    return (
      <View style={styles.cartItemWrapper}>
        <CartItem 
          item={item} 
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onPress={() => handleItemPress(item)}
          deliveryTime={deliveryTime}
          onDeliveryTimeSelect={setDeliveryTime}
        />
      </View>
    );
  }, [updateQuantity, removeItem, handleItemPress, deliveryTime]);

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
        
        <Text style={styles.detailsText}>CART</Text>
      </View>

      {/* Cart Content */}
      {loading ? (
        <CartSkeleton />
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={
            showTabBar 
              ? [styles.scrollContent, styles.scrollContentWithTabBar]
              : styles.scrollContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          {cartItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              {/* Premium Empty Cart Illustration */}
              <View style={styles.illustrationContainer}>
                <Image 
                  source={require('../../assets/Images/Cart.png')} 
                  style={styles.cartImage}
                  resizeMode="contain"
                />
              </View>

              {/* Premium Typography */}
              <Text style={styles.emptyTitle}>Oops! Your cart ghosted the clothes</Text>
              <Text style={styles.emptySubtitle}>
                Let’s fix that → 
                <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
                  <Text style={styles.startShoppingText}>Start shopping!</Text>
                </TouchableOpacity>
              </Text>
              
              

              
             
            </View>
          ) : (
            <>
              {/* Cart Items */}
              <FlatList
                data={cartItems}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.variant.sku}
                contentContainerStyle={styles.cartList}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />

              {/* Address Section */}
              <TouchableOpacity 
                style={styles.addressBlock}
                onPress={() => navigation.navigate('AddAddressScreen')}
                activeOpacity={0.8}
              >
                <View>
                  {addressLoading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : addressError ? (
                    <Text style={styles.addressText}>Add Delivery Address</Text>
                  ) : defaultAddressData?.success && defaultAddressData?.data ? (
                    <>
                      <Text style={styles.addressText}>
                        {defaultAddressData.data.addressLine}
                      </Text>
                      {defaultAddressData.data.city && (
                        <Text style={styles.addressText}>
                          {defaultAddressData.data.city}
                        </Text>
                      )}
                      {defaultAddressData.data.state && (
                        <Text style={styles.addressText}>
                          {defaultAddressData.data.state}
                        </Text>
                      )}
                    </>
                  ) : (
                    <>
                      <Text style={styles.addressText}>Add Delivery Address</Text>
                      <Text style={styles.addressTextSub}>Tap to set your location</Text>
                    </>
                  )}
                </View>

                <ArrowTap width={16} height={16} />
              </TouchableOpacity>

              {/* Total and Checkout Section */}
              {cartItems.length > 0 && (
                <View style={styles.bottomBar}>
                  <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                    <Text style={styles.checkoutText}>CHECKOUT</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
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
    bottom:0,
    paddingBottom: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 120, // Extra padding when tab bar is visible to enable scrolling beside bottom tab
  },
  emptyContainer: {
    top:-60,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.02,
    paddingVertical: 40,
    minHeight: height * 0.6,
  },
  illustrationContainer: {
    left:-6,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartImage: {
    width: 120,
    height: 120,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans-Regular' : 'TenorSans-Regular',
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    right:-4,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  startShoppingText: {
    fontWeight: '500',
    color: '#000',
  },
  deliverySelector: {
    paddingHorizontal: width * 0.05,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  deliveryRowInline: {
    
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  deliveryLabel: {
    left:-15,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  deliveryDropdown: {
    
    right:0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  deliveryDropdownText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#000',
  },
  arrowIcon: {
    transform: [{ rotate: '0deg' }],
  },
  arrowIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownOptions: {

    position: 'absolute',
    top: '100%',
    right: width * 0.05,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    minWidth: 150,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownOptionText: {
    fontSize: 13,
    color: '#333',
  },
  actionButtonsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  primaryActionButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C0914B',
  },
  secondaryActionText: {
    color: '#C0914B',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconText: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  trendingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  trendingTitle: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  trendingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  activeDot: {
    backgroundColor: '#C0914B',
    width: 20,
  },
  cartList: {
  
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  cartItem: {
    flexDirection: 'column',
    backgroundColor: '#f3f3f3',
    marginBottom: 0,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: width * 0.05,
  },
  itemContent: {
    flexDirection: 'row',
  },
  cartItemWrapper: {
    backgroundColor: '#f3f3f3',
    marginBottom: 0,
  },
  itemImage: {
    width: 90,
    height: 120,
    borderRadius: 0,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemBrand: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
  itemTitle: {
    fontSize: 12,
    color: '#666',
    marginVertical: 6,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  qtyBtnCircle: {
    opacity:0.7,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e5e5e5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtn: {
    bottom:2,
    fontSize: 20,
    textAlign: 'center',
  },
  qtyText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    color: '#C0914B',
  },
  removeText: {
    color: '#929292',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#929292',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  addressBlock: {
    top:-37,
    bottom:20,
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  addressTextSub: {
    fontSize: 10,
    color: '#999',
    lineHeight: 14,
    marginTop: 2,
  },
  deliveryRow: {
    bottom:15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: 1,
  },
  deliveryLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '400',
    marginLeft: 8,
  },
  deliveryFree: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '400',
  },
  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    letterSpacing: 1.6,
    fontWeight: '600',
    fontSize: 12,
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '400',
    color: '#C0914B',
  },
  checkoutBtn: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  // New styles for API integration
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  variantInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  addressContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceSummarySection: {
    marginVertical: 20,
    paddingHorizontal: width * 0.05,
    backgroundColor: '#f9f9f9',
    paddingVertical: 15,
    borderRadius: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  priceValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  // Skeleton UI Styles
  skeletonContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skeletonItem: {
    flexDirection: 'column',
    backgroundColor: '#f3f3f3',
    marginBottom: 0,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: width * 0.05,
  },
  skeletonDeliverySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  skeletonDeliveryLabel: {
    width: 120,
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonDeliveryDropdown: {
    width: 120,
    height: 32,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
  },
  skeletonItemContent: {
    flexDirection: 'row',
  },
  skeletonImage: {
    width: 90,
    height: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 15,
  },
  skeletonDetails: {
    flex: 1,
  },
  skeletonBrand: {
    width: 100,
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonTitle: {
    width: 150,
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonVariant: {
    width: 80,
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  skeletonQtyBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
  },
  skeletonQtyText: {
    width: 20,
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  skeletonPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonRemoveBtn: {
    width: 80,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonPrice: {
    width: 40,
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonAddressBlock: {
    top: -37,
    bottom: 20,
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  skeletonAddressLines: {
    flex: 1,
  },
  skeletonAddressLine: {
    width: '100%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonArrow: {
    width: 16,
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});

export default CartScreen;
