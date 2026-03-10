import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { filterService } from '../services/api/filterService';

const CheckboxList = ({
  data = [],
  selectedValues = [],
  onToggle,
  isColorFilter = false,
}) => {
  return (
    <View>
      {data.map(item => {
        // Normalize the item value for consistent comparison
        const normalizedValue = item.value.toLowerCase().trim();
        const selected = selectedValues.includes(normalizedValue);

        return (
          <TouchableOpacity
            key={item.value}
            style={styles.checkboxRow}
            onPress={() => onToggle(item.value)}
          >
            <View style={[
              styles.checkbox,
              selected && styles.checkboxSelected
            ]} />

            {isColorFilter && item.value && item.value.startsWith('#') ? (
              <View style={styles.colorItemContainer}>
                <View 
                  style={[
                    styles.colorCircle,
                    { backgroundColor: item.value }
                  ]} 
                />
                <Text style={styles.checkboxLabel}>
                  {item.label}
                </Text>
              </View>
            ) : (
              <Text style={styles.checkboxLabel}>
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const FilterOptions = ({ visible, onClose, onApplyFilters, onResetFilters }) => {
  const [activeSection, setActiveSection] = useState('');
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch filters from API
  const fetchFilters = async () => {
    try {
      setLoading(true);
      const response = await filterService.getAllFilters({ isActive: true });
      
      console.log('Filter API Response:', response);
      
      if (response.success && response.data && response.data.data && response.data.data.filters) {
        console.log('Setting filters:', response.data.data.filters);
        setFilters(response.data.data.filters);
        // Initialize selected filters state for each filter key
        const initialSelectedFilters = {};
        response.data.data.filters.forEach(filter => {
          initialSelectedFilters[filter.key] = [];
        });
        setSelectedFilters(initialSelectedFilters);
        
        // Set first filter as active section
        if (response.data.data.filters.length > 0) {
          console.log('Setting active section to:', response.data.data.filters[0].label);
          setActiveSection(response.data.data.filters[0].label);
        }
      } else {
        console.log('Invalid response structure:', response);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchFilters();
    }
  }, [visible]);

  const toggleValue = (filterKey, value) => {
    // Normalize the value to ensure consistency
    const normalizedValue = value.toLowerCase().trim();
    
    setSelectedFilters(prev => {
      const currentSelected = prev[filterKey] || [];
      if (currentSelected.includes(normalizedValue)) {
        return {
          ...prev,
          [filterKey]: currentSelected.filter(v => v !== normalizedValue)
        };
      } else {
        return {
          ...prev,
          [filterKey]: [...currentSelected, normalizedValue]
        };
      }
    });
  };

  const resetFilters = () => {
    const resetSelectedFilters = {};
    filters.forEach(filter => {
      resetSelectedFilters[filter.key] = [];
    });
    setSelectedFilters(resetSelectedFilters);
    
    // Call parent reset callback if provided
    if (onResetFilters) {
      onResetFilters();
    }
    
    // Close the modal after reset - same behavior as filter tabs
    onClose();
  };

  const applyFilters = () => {
    // Clean up filters - remove empty arrays and normalize values
    const cleanedFilters = {};
    
    Object.keys(selectedFilters).forEach(key => {
      const values = selectedFilters[key];
      if (values && values.length > 0) {
        // Convert all values to lowercase and trim to match backend storage
        cleanedFilters[key] = values.map(v => v.toLowerCase().trim());
      }
    });
    
    console.log('Applying cleaned filters:', cleanedFilters);
    
    // Call parent apply callback with cleaned filters
    if (onApplyFilters) {
      onApplyFilters(cleanedFilters);
    }
    onClose();
  };

  const getFilterByKey = (key) => {
    return filters.find(filter => filter.key === key);
  };

  const getFilterByLabel = (label) => {
    return filters.find(filter => filter.label === label);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Filter
          </Text>

          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>

          {/* Left Sidebar */}
          <View style={styles.sidebar}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#000" />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {filters.map(filter => (
                  <TouchableOpacity
                    key={filter._id}
                    style={[
                      styles.sidebarItem,
                      activeSection === filter.label && styles.sidebarItemActive
                    ]}
                    onPress={() => setActiveSection(filter.label)}
                  >
                    <Text
                      style={[
                        styles.sidebarText,
                        activeSection === filter.label && styles.sidebarTextActive
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Right Content */}
          <View style={styles.rightContent}>
            <ScrollView>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#000" />
                  <Text style={styles.loadingText}>Loading filters...</Text>
                </View>
              ) : (
                filters.map(filter => (
                  activeSection === filter.label && (
                    <CheckboxList
                      key={filter._id}
                      isColorFilter={filter.key === 'color'}
                      data={filter.values.map(value => ({
                        label: value.label,
                        value: value.value,
                        count: 0 // API doesn't provide count, set to 0 for now
                      }))}
                      selectedValues={selectedFilters[filter.key] || []}
                      onToggle={(val) => toggleValue(filter.key, val)}
                    />
                  )
                ))
              )}
            </ScrollView>
          </View>

        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomBar}>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={resetFilters}
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={applyFilters}
          >
            <Text style={styles.applyText}>Apply Filter</Text>
          </TouchableOpacity>

        </View>

      </SafeAreaView>
    </Modal>
  );
};

export default FilterOptions;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  back: {
    fontSize: 30,
    width: 24,
  },

  headerTitle: {
    left:10,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },

  content: {
    flex: 1,
    flexDirection: 'row',
  },

  sidebar: {
    width: 130,
    backgroundColor: '#f2f2f2',
  },

  sidebarItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },

  sidebarItemActive: {
    backgroundColor: '#fff',
  },

  sidebarText: {
    fontSize: 15,
    color: '#555',
  },

  sidebarTextActive: {
    fontWeight: '600',
    color: '#000',
  },

  rightContent: {
    flex: 1,
    padding: 16,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#999',
    borderRadius: 4,
    marginRight: 14,
  },

  checkboxSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },

  checkboxLabel: {
    fontSize: 16,
  },

  colorItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },

  placeholderText: {
    fontSize: 16,
    color: '#999',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },


  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  resetBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 6,
  },

  applyBtn: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    alignItems: 'center',
    borderRadius: 6,
  },

  resetText: {
    fontWeight: '600',
  },

  applyText: {
    color: '#fff',
    fontWeight: '600',
  },

});