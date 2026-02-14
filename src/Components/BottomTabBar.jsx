import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Bottom1 from '../assets/Icons/BottomNavbar/Bottom1';
import Bottom2 from '../assets/Icons/BottomNavbar/Bottom2';
import Bottom3 from '../assets/Icons/BottomNavbar/Bottom3';
import Bottom4 from '../assets/Icons/BottomNavbar/Bottom4';
import Bottom5 from '../assets/Icons/BottomNavbar/Bottom5';

const BottomTabBar = ({ activeTab, onTabPress }) => {
  const navigation = useNavigation();
  
  const tabs = [
    { id: 1, icon: Bottom1, label: 'Home' },
    { id: 2, icon: Bottom2, label: 'Favorites' },
    { id: 3, icon: Bottom3, label: 'Categories' },
    { id: 4, icon: Bottom4, label: 'Cart' },
    { id: 5, icon: Bottom5, label: 'Profile' },
  ];

  const handleTabPress = (tabId) => {
    // Call the original onTabPress if provided
    if (onTabPress) {
      onTabPress(tabId);
    }
    
    // Navigate to different screens based on tab
    switch(tabId) {
      case 1: // Home
        navigation.navigate('HomeScreen', { fromBottomTab: true });
        break;
      case 2: // Favorites
        navigation.navigate('WishlistScreen', { fromBottomTab: true });
        break;
      case 3: // Categories
        navigation.navigate('CollectionsScreen', { fromBottomTab: true });
        break;
      case 4: // Cart
        navigation.navigate('CartScreen', { fromBottomTab: true });
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
        const isActive = activeTab === tab.id;
        
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