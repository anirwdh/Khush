import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import FilterIcon from '../../assets/Icons/FilterIcon.jsx';
import SearchIcon from '../../assets/Icons/SearchIcon.jsx';
import FilterOptions from '../../Components/FilterOptions.jsx';

const recentSearches = ['Dress', 'Collection', 'Nike'];
const popularSearches = [
  'Trend',
  'Dress',
  'Bag',
  'Tshirt',
  'Beauty',
  'Accessories',
];

const SearchScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={22} height={22} />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <SearchIcon width={20} height={20} />
          <TextInput
            placeholder="Search Items"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9E9E9E"
            style={styles.searchInput}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.filterBtn}
          onPress={() => setFilterVisible(true)}
        >
          <FilterIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>

        {/* Recent Search */}
        <Text style={styles.sectionTitle}>Recent search</Text>

        <View style={styles.chipContainer}>
          {recentSearches.map(item => (
            <View key={item} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
              <Text style={styles.chipClose}>×</Text>
            </View>
          ))}
        </View>

        {/* Popular */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Popular search terms
        </Text>

        {popularSearches.map(item => (
          <TouchableOpacity key={item} style={styles.popularItem}>
            <Text style={styles.popularText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Modal */}
      <FilterOptions
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
};



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
    flexDirection: 'row',
    gap: 10,
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
});

export default SearchScreen;