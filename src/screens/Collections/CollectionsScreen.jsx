import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import BottomTabBar from '../../Components/BottomTabBar.jsx';
import { getCategories } from '../../services/subcategoryService';

const { width, height } = Dimensions.get('window');

const CollectionsScreen = ({ route }) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(3); // Categories tab is active
  const [showTabBar, setShowTabBar] = useState(route?.params?.fromBottomTab || false);
  const [loadedImages, setLoadedImages] = useState({});

  // Fetch categories using Infinite Query for pagination
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['collections'],
    queryFn: ({ pageParam = 1 }) => getCategories({ page: pageParam, limit: 4 }),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.pagination?.totalPages ? nextPage : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    cacheTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch when app comes to foreground
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  // Flatten and transform API data to match UI structure
  const collectionData = useMemo(() => data?.pages?.flatMap(page => 
    page.categories?.map(category => ({
      id: category._id,
      title: category.name.toUpperCase(),
      image: { uri: category.imageUrl },
    })) || []
  ) || [], [data]);

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    // Navigation is now handled in BottomTabBar component
  };

  // Handle pagination on scroll end
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [hasNextPage, isLoading, fetchNextPage]);

  // Handle image load
  const handleImageLoad = useCallback((itemId) => {
    setLoadedImages(prev => ({ ...prev, [itemId]: true }));
  }, []);

  const renderCollectionItem = useCallback(({ item, index }) => {
    const isEven = index % 2 === 1;
    const isLoaded = loadedImages[item.id];

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.collectionCard}
        onPress={() => navigation.navigate('CollectionListingScreen', { collectionName: item.title, categoryId: item.id })}
      >
        <View style={styles.imageWrapper}>
          {!isLoaded && <View style={styles.placeholder} />}
          <Image 
            source={item.image} 
            style={styles.collectionImage}
            onLoad={() => handleImageLoad(item.id)}
          />
        </View>

        {/* Text Overlay */}
        <View
          style={[
            styles.textOverlay,
            isEven ? styles.textRight : styles.textLeft,
          ]}
        >
          <Text style={styles.titleTop}>{item.title}</Text>
          <Text style={styles.titleBottom}>COLLECTION</Text>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, loadedImages, handleImageLoad]);

  // Show loading skeleton while data is loading
  if (isLoading && (!data || data.pages.length === 0)) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.collectionsText}>COLLECTIONS</Text>
        </View>
        <ActivityIndicator size="large" style={styles.loadingIndicator} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.collectionsText}>COLLECTIONS</Text>
      </View>

      {/* Collections List */}
      <FlatList
        data={collectionData}
        renderItem={renderCollectionItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: height * 0.28 + 16,
          offset: (height * 0.28 + 16) * index,
          index,
        })}
      />

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
    paddingBottom: 15,
    paddingTop: Platform.OS === 'ios' ? 70 : 30,
    paddingHorizontal: 20,
  },
  collectionsText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  listContainer: {
    paddingBottom: 80,
  },
  collectionCard: {
    paddingHorizontal: 20,  
    width: width,
    height: height * 0.28,
    marginBottom: 16,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f2f2f2',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 30,
  },
  textLeft: {
    left: 40,
    alignItems: 'flex-start',
  },
  textRight: {
    right: 44,
    alignItems: 'flex-end',
  },
  titleTop: {
    fontWeight: '700',
    fontSize: 34,
    color: '#fff',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ?'TenorSans' : 'TenorSans-Regular',
  },
  titleBottom: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 3,
    marginTop: -4,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
});

export default CollectionsScreen;