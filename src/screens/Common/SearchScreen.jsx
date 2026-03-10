import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import FilterIcon from '../../assets/Icons/FilterIcon.jsx';
import SearchIcon from '../../assets/Icons/SearchIcon.jsx';
import FilterOptions from '../../Components/FilterOptions.jsx';
import { triggerLightHaptic } from '../../utils/haptic';
import { useSearchService } from '../../hooks/useSearchService';

const SearchScreen = React.memo(() => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  
  // Use the search service hook
  const {
    recentSearches,
    popularSearches,
    loading,
    isAuthenticated,
    trackSearch,
    clearRecentSearch,
    clearAllRecentSearches,
  } = useSearchService();

  // Memoize search handlers to prevent re-renders
  const handleSearch = useCallback((query) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      triggerLightHaptic();
      
      // Track the search keyword
      trackSearch(trimmedQuery);
      
      navigation.navigate('CollectionListingScreen', {
        collectionName: trimmedQuery,
        searchQuery: trimmedQuery,
        categoryId: null,
        subcategoryId: null,
        targetSubcategoryId: null
      });
    }
  }, [trackSearch, navigation]);

  const handleSubmit = useCallback(() => {
    handleSearch(searchQuery);
  }, [handleSearch, searchQuery]);

  const handleRecentSearchPress = useCallback((term) => {
    handleSearch(term);
  }, [handleSearch]);

  const handlePopularSearchPress = useCallback((term) => {
    handleSearch(term);
  }, [handleSearch]);

  const handleClearRecentSearch = useCallback((keyword) => {
    clearRecentSearch(keyword);
  }, [clearRecentSearch]);

  const handleClearAllRecentSearches = useCallback(() => {
    clearAllRecentSearches();
  }, [clearAllRecentSearches]);

  // Memoize clear button visibility to prevent re-renders
  const shouldShowClearButton = useMemo(() => searchQuery.length > 0, [searchQuery]);

  // Memoize recent search visibility to prevent re-renders
  const shouldShowRecentSearches = useMemo(() => 
    isAuthenticated && recentSearches.length > 0, 
    [isAuthenticated, recentSearches.length]
  );

  // Memoize popular search items to prevent re-renders
  const popularSearchItems = useMemo(() => 
    popularSearches.map(item => ({
      key: item,
      item,
      onPress: () => handlePopularSearchPress(item)
    })), 
    [popularSearches, handlePopularSearchPress]
  );

  // Memoize recent search items to prevent re-renders
  const recentSearchItems = useMemo(() => 
    recentSearches.map(item => ({
      key: item,
      item,
      onPress: () => handleRecentSearchPress(item),
      onDelete: () => handleClearRecentSearch(item)
    })), 
    [recentSearches, handleRecentSearchPress, handleClearRecentSearch]
  );

  // Memoize recent search render item to prevent re-renders
  const renderRecentSearchItem = useCallback(({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.chip}
        onPress={() => handleRecentSearchPress(item)}
      >
        <Text style={styles.chipText}>{item}</Text>
        <TouchableOpacity 
          style={styles.chipCloseButton}
          onPress={() => handleClearRecentSearch(item)}
        >
          <Text style={styles.chipClose}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [handleRecentSearchPress, handleClearRecentSearch]);

  // Memoize recent search skeleton items to prevent re-renders
  const recentSearchSkeletons = useMemo(() => 
    Array(5).fill(null).map((_, index) => `skeleton-${index}`), 
    []
  );

  // Memoize recent search skeleton render item to prevent re-renders
  const renderRecentSearchSkeleton = useCallback(() => {
    return (
      <View style={styles.skeletonChip} />
    );
  }, []);

  // Memoize popular search visibility to prevent re-renders
  const shouldShowPopularSearches = useMemo(() => 
    popularSearches.length > 0, 
    [popularSearches.length]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon width={28} height={28} />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <SearchIcon width={20} height={20} />
          <TextInput
            placeholder="Search Items"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSubmit}
            placeholderTextColor="#9E9E9E"
            style={styles.searchInput}
            returnKeyType="search"
          />

          {shouldShowClearButton && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Recent Search - Only show if authenticated and has recent searches */}
        {shouldShowRecentSearches && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent search</Text>
              <TouchableOpacity onPress={handleClearAllRecentSearches}>
                <Text style={styles.clearAllText}>Clear all</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chipContainer}>
              <FlatList
                data={recentSearches}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipListContainer}
                keyExtractor={(item) => item}
                renderItem={renderRecentSearchItem}
                removeClippedSubviews={Platform.OS === 'android'}
                initialNumToRender={recentSearches.length}
                maxToRenderPerBatch={10}
                windowSize={20}
              />
            </View>
          </>
        )}

        {/* Recent Search Skeleton - Show while loading and authenticated */}
        {loading && isAuthenticated && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonClearButton} />
            </View>

            <View style={styles.chipContainer}>
              <FlatList
                data={recentSearchSkeletons}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipListContainer}
                keyExtractor={(item) => item}
                renderItem={renderRecentSearchSkeleton}
                removeClippedSubviews={Platform.OS === 'android'}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={10}
              />
            </View>
          </>
        )}

        {/* Popular */}
        {shouldShowPopularSearches && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: shouldShowRecentSearches ? 24 : 0 }]}>
                  Popular search terms
                </Text>

                {popularSearchItems.map(({key, item, onPress}) => (
                  <TouchableOpacity 
                    key={key} 
                    style={styles.popularItem}
                    onPress={onPress}
                  >
                    <Text style={styles.popularText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
      </View>

      {/* Filter Modal */}
      <FilterOptions
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
});





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  backButton: {
    borderWidth: 1,
    borderColor: '#000',
    width: 44,
    height: 44,
    borderRadius: 0,
  
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 1,
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    height: 44,
    marginHorizontal: 12,
    paddingHorizontal: 14,
  },

  searchInput: {
    left: 10,
    flex: 1,
    fontSize: 16,
    color: '#000',
  },

  clearText: {
    fontSize: 22,
    color: '#000',
    paddingLeft: 8,
  },

  searchBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  filterBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  sectionTitle: {
    fontSize: 16,
    color: '#9E9E9E',
    marginBottom: 12,
  },

  chipContainer: {
    marginBottom: 12,
  },

  chipListContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20, // Add padding to the right for better scroll experience
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  chipText: {
    fontSize: 14,
    color: '#000',
  },

  chipClose: {
    fontSize: 18,
    marginLeft: 6,
    color: '#000',
  },

  popularItem: {
    paddingVertical: 12,
  },

  popularText: {
    fontSize: 18,
    color: '#000',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  clearAllText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },

  skeletonChip: {
    width: 100,
    height: 36,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },

  skeletonTitle: {
    width: 120,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },

  skeletonClearButton: {
    width: 60,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },
});

export default SearchScreen;