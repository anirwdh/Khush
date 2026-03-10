import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Bottom1 from '../assets/Icons/BottomNavbar/Bottom1';
import Bottom2 from '../assets/Icons/BottomNavbar/Bottom2';
import Bottom3 from '../assets/Icons/BottomNavbar/Bottom3';
import Bottom4 from '../assets/Icons/BottomNavbar/Bottom4';
import Bottom5 from '../assets/Icons/BottomNavbar/Bottom5';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { TokenStorage } from '../utils/tokenStorage';

const BottomTabBar = ({ activeTab, onTabPress }) => {
  const navigation = useNavigation();
  const { requireAuth } = useAuthGuard();
  const [previousTab, setPreviousTab] = useState(activeTab);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await TokenStorage.getAccessToken();
        setIsLoggedIn(!!token);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Calculate actual active tab - wishlist (tab 2) and cart (tab 4) should only be active if logged in
  const actualActiveTab = (activeTab === 2 || activeTab === 4) && !isLoggedIn ? previousTab : activeTab;
  
  const tabs = [
    { id: 1, icon: Bottom1, label: 'Home' },
    { id: 2, icon: Bottom2, label: 'Favorites' },
    { id: 3, icon: Bottom3, label: 'Categories' },
    { id: 4, icon: Bottom4, label: 'Cart' },
    { id: 5, icon: Bottom5, label: 'Profile' },
  ];

  const handleTabPress = async (tabId) => {
    // Update previous tab before changing tabs (only if not wishlist or cart)
    if (tabId !== activeTab && tabId !== 2 && tabId !== 4) {
      setPreviousTab(activeTab);
    }
    
    // Call the original onTabPress if provided
    if (onTabPress) {
      onTabPress(tabId);
    }
    
    // Navigate to different screens based on tab
    switch(tabId) {
      case 1: // Home
        navigation.navigate('HomeScreen', { fromBottomTab: true });
        break;
      case 2: // Favorites - requires authentication
        const isAllowed = await requireAuth(
          'WishlistScreen', // Current screen name
          { fromBottomTab: true }, // Preserve bottom tab state
          'wishlist', // Pending action
          previousTab // Pass previous tab for "do it later" functionality
        );
        
        if (isAllowed) {
          navigation.navigate('WishlistScreen', { fromBottomTab: true });
        }
        break;
      case 3: // Categories
        navigation.navigate('CollectionsScreen', { fromBottomTab: true });
        break;
      case 4: // Cart - requires authentication
        const isCartAllowed = await requireAuth(
          'CartScreen', // Current screen name
          { fromBottomTab: true }, // Preserve bottom tab state
          'cart', // Pending action
          previousTab // Pass previous tab for "do it later" functionality
        );
        
        if (isCartAllowed) {
          navigation.navigate('CartScreen', { fromBottomTab: true });
        }
        break;
      case 5: // Profile
         navigation.navigate('ProfileScreen', { fromBottomTab: true }); // Uncomment when ProfileScreen is available
        break;
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = actualActiveTab === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, isActive && styles.activeTab]}
            onPress={() => handleTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <Icon 
              width={26} 
              height={26} 
              style={[styles.icon, isActive && styles.activeIcon]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    paddingBottom: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Optional: Add active state styling if needed
  },
  icon: {
    opacity: 0.6,
  },
  activeIcon: {
    opacity: 1,
  },
});

export default BottomTabBar;