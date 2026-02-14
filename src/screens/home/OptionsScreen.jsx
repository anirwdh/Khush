import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import LogoIcon from '../../assets/Icons/logoicon.jsx';
import MainLogo from '../../assets/Icons/MainLogo.jsx';
import { getCategories, getSubcategories } from '../../services/subcategoryService';
import { triggerLightHaptic } from '../../utils/haptic';
import { TabsSkeleton, ListSkeleton } from '../../Components/SkeletonComponents';

const OptionsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(null);

  const translateY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Fetch categories using React Query
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories({ page: 1, limit: 10 }),
  });

  // Filter categories for navbar
  const categories = categoriesData?.categories?.filter(cat => cat.isNavbar === true) || [];

  // Fetch subcategories using React Query
  const { data: subcategoriesData, isLoading: isLoadingSubcategories } = useQuery({
    queryKey: ['subcategories', activeTab],
    queryFn: () => getSubcategories({ categoryId: activeTab, page: 1, limit: 20 }),
    enabled: !!activeTab,
  });

  // Filter subcategories for navbar
  const subcategories = subcategoriesData?.subcategories?.filter(sub => sub.isNavbar === true) || [];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Set first category as active when categories are loaded
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0]._id);
    }
  }, [categories, activeTab]);

  const handleTabPress = (categoryId) => {
    triggerLightHaptic();
    setActiveTab(categoryId);
  };

  // Memoized render item for subcategories
  const SubcategoryItem = React.memo(({ item }) => (
    <TouchableOpacity style={styles.listItem}>
      <Text style={styles.listText}>{item.name}</Text>
    </TouchableOpacity>
  ));

  const renderSubcategoryItem = ({ item }) => <SubcategoryItem item={item} />;

  return (
    <Animated.View
      style={{
        paddingTop: insets.top,
        flex: 1,
        opacity,
        transform: [{ translateY }],
      }}
    >
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
          data={isLoadingCategories ? Array.from({ length: 4 }) : categories}
          keyExtractor={(item, index) => isLoadingCategories ? `skeleton-${index}` : item._id}
          renderItem={({ item: category, index }) => {
            if (isLoadingCategories) {
              return <TabsSkeleton tabCount={1} />;
            }
            
            const isActive = category._id === activeTab;
            return (
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => handleTabPress(category._id)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {category.name.toUpperCase()}
                </Text>

                {isActive && (
                  <View style={styles.tabIndicator}>
                    <View style={styles.indicatorLine} />
                    <View style={styles.diamond} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={!isLoadingCategories ? <Text style={styles.tabText}>No categories</Text> : null}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Category List */}
      <View style={styles.listContainer}>
        {isLoadingSubcategories ? (
          <ListSkeleton itemCount={6} />
        ) : (
          <FlatList
            data={subcategories}
            keyExtractor={(item) => item._id}
            renderItem={renderSubcategoryItem}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={5}
            removeClippedSubviews
            ListEmptyComponent={<Text style={styles.emptyText}>No subcategories available</Text>}
          />
        )}
      </View>

      {/* Bottom Logo */}
      <View style={styles.logoContainer}>
          <MainLogo width={50} height={60} />
        <LogoIcon width={120} height={80} />
      
      </View>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeText: {
    fontSize: 26,
    color: '#000',
  },

  tabsContainer: {
    paddingTop: 10,
  },
  tabsScrollContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
    minWidth: 80,
    justifyContent: 'flex-start',
    minHeight: 50, // Ensure consistent height for all tabs
  },
  tabText: {
    fontSize: 12,
    color: '#bbb',
    letterSpacing: 2,
    fontFamily: 'TenorSans',
  },
  tabTextActive: {
    color: '#000',
  },

  tabIndicator: {
    marginTop: 10,
    width: 60,              // controls line length
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },

  indicatorLine: {
    position: 'absolute',
    height: 1, // Same height as divider
    width: '100%',
    backgroundColor: '#000',
    zIndex: 2,
  },

  diamond: {
    width: 7,
    height: 7,
    backgroundColor: '#000',
    transform: [{ rotate: '45deg' }],
    zIndex: 3,
  },

  divider: {
    height: 1,
   // backgroundColor: '#eee',
    marginTop: 10, // Same spacing as indicator
    zIndex: 0, // Ensure it's behind
  },

  listContainer: {
    paddingTop: 30,
    paddingHorizontal: 30,
    flex: 1,
  },
  listItem: {
    paddingVertical: 14,
  },
  listText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'TenorSans',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'TenorSans',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'TenorSans',
    textAlign: 'center',
    paddingVertical: 20,
  },

  logoContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
  },
});


export default OptionsScreen;
