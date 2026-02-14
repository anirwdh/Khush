import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import DeliveryIconCart from '../../assets/Icons/DeliveryIconCart.jsx';
import ArrowTap from '../../assets/Icons/ArrowTap.jsx';
import BottomTabBar from '../../Components/BottomTabBar.jsx';

const { width, height } = Dimensions.get('window');

const CartScreen = ({ route }) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(4); // Cart tab is active
  const [showTabBar, setShowTabBar] = useState(route?.params?.fromBottomTab || false); // Only show if navigated from bottom tab
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'LAMEREI',
      subtitle: 'RECYCLE BOUCLE KNIT CARDIGAN PINK',
      price: 120,
      quantity: 1,
      image: require('../../assets/Images/image.png')
    },
    {
      id: '2',
      name: 'LAMEREI',
      subtitle: 'RECYCLE BOUCLE KNIT CARDIGAN PINK',
      price: 149,
      quantity: 2,
      image: require('../../assets/Images/Image2.png')
    },
    {
      id: '3',
      name: 'LAMEREI',
      subtitle: 'RECYCLE BOUCLE KNIT CARDIGAN PINK',
      price: 259,
      quantity: 1,
      image: require('../../assets/Images/Image3.png')
    }
  ]);

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    // Navigation is now handled in BottomTabBar component
  };

  const updateQuantity = useCallback((itemId, action) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === itemId) {
          if (action === 'increase') {
            return { ...item, quantity: item.quantity + 1 };
          } else if (action === 'decrease' && item.quantity > 0) {
            return { ...item, quantity: item.quantity - 1 };
          }
        }
        return item;
      });
      
      // Remove items with quantity 0
      return updatedItems.filter(item => item.quantity > 0);
    });
  }, []);


  const removeItem = useCallback((itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  const total = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const renderCartItem = useCallback(({ item }) => (
    <View style={styles.cartItem}>
      <Image source={item.image} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <Text style={styles.itemBrand}>{item.name}</Text>
        <Text style={styles.itemTitle}>{item.subtitle}</Text>

        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.qtyBtnCircle} onPress={() => updateQuantity(item.id, 'decrease')}>
            <Text style={styles.qtyBtn}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.quantity}</Text>

          <TouchableOpacity style={styles.qtyBtnCircle} onPress={() => updateQuantity(item.id, 'increase')}>
            <Text style={styles.qtyBtn}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price}</Text>

          <TouchableOpacity onPress={() => removeItem(item.id)}>
            <Text style={styles.removeText}>Remove Item</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [updateQuantity, removeItem]);

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
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={
          showTabBar 
            ? [styles.scrollContent, styles.scrollContentWithTabBar]
            : styles.scrollContent
        }
      >
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add some items to get started</Text>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.cartList}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />

            {/* Address Section */}
            <View style={styles.addressBlock}>
              <Text style={styles.addressText}>
                606-3727 ULLAMCORPER. STREET{'\n'}
                ROSEVILLE NH 11523{'\n'}
                (786) 713-8616
              </Text>
              <ArrowTap width={20} height={20} />
            </View>

            {/* Delivery Section */}
            <View style={styles.deliveryRow}>
              <View style={styles.deliveryLeftSection}>
                <DeliveryIconCart width={19} height={24} />
                <Text style={styles.deliveryText}>DELIVERY</Text>
              </View>
              <Text style={styles.deliveryFree}>Free</Text>
            </View>

            {/* Total and Checkout Section */}
            {cartItems.length > 0 && (
              <View style={styles.bottomBar}>
                <View style={styles.totalSection}>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.totalValue}>₹ {total}</Text>
                </View>

                <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('AddAddressScreen')}>
                  <Text style={styles.checkoutText}>CHECKOUT</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cartList: {
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
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
});

export default CartScreen;
