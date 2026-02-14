import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const FilterOptions = ({ visible, onClose }) => {
  const [selectedSize, setSelectedSize] = useState('XS');
  const [selectedColor, setSelectedColor] = useState('Green');
  const [selectedPrice, setSelectedPrice] = useState(null);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Green', value: '#2FA84F' },
    { name: 'Purple', value: '#7B3FA1' },
    { name: 'Red', value: '#F44336' },
    { name: 'Yellow', value: '#FFC107' },
    { name: 'Blue', value: '#03A9F4' },
    { name: 'White', value: '#FFFFFF' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.sheet}>
          <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.filterText}>FILTER</Text>
          <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
            <Text style={styles.applyText}>APPLY</Text>
          </TouchableOpacity>
        </View>

        {/* PRICE */}
        <Text style={styles.sectionTitle}>PRICE</Text>

        <View style={styles.priceGrid}>
          {['Under 1000', 'Under 5000', 'Under 10000', 'Under 20000'].map((priceRange, index) => (
            <TouchableOpacity
              key={priceRange}
              style={[
                styles.priceChip,
                selectedPrice === priceRange && styles.priceChipSelected
              ]}
              onPress={() => setSelectedPrice(priceRange)}
            >
              <Text style={[
                styles.priceChipText,
                selectedPrice === priceRange && styles.priceChipTextSelected
              ]}>
                {priceRange}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* COLOR */}
        <Text style={styles.sectionTitle}>COLOR</Text>

        <View style={styles.colorGrid}>
          {colors.map(c => (
            <TouchableOpacity
              key={c.name}
              style={styles.colorRow}
              onPress={() => setSelectedColor(c.name)}
            >
              <View style={styles.radio}>
                {selectedColor === c.name && <View style={styles.radioFill} />}
              </View>
              <Text style={styles.colorLabel}>{c.name}</Text>
              <View style={[styles.colorBox, { backgroundColor: c.value }]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* SIZE */}
        <Text style={styles.sectionTitle}>SIZE</Text>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.sizeScrollView}
          contentContainerStyle={styles.sizeScrollContent}
        >
          {sizes.map(size => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeBox,
                selectedSize === size && styles.sizeBoxActive,
              ]}
              onPress={() => setSelectedSize(size)}
            >
              <Text
                style={[
                  styles.sizeText,
                  selectedSize === size && styles.sizeTextActive,
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: height * 0.65,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 24 : 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },

  filterText: {
    fontSize: 18,
    letterSpacing: 2,
    fontWeight: '500',
  },

  applyBtn: {
    backgroundColor: '#000',
    paddingHorizontal: 22,
    paddingVertical: 10,
  },

  applyText: {
    color: '#fff',
    letterSpacing: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 16,
  },

  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },

  priceChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },

  priceChipSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },

  priceChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  priceChipTextSelected: {
    color: '#fff',
  },

  sizeScrollView: {
    marginTop: 0,
    height: 48,
  },

  sizeScrollContent: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 0,
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 20,
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },

  colorLabel: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
  },

  colorBox: {
    width: 22,
    height: 22,
    borderWidth: 1,
  },

  sizeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 0,
  },

  sizeBox: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 18,
    height: 48,
  },

  sizeBoxActive: {
    backgroundColor: '#000',
  },

  sizeText: {
    fontSize: 16,
  },

  sizeTextActive: {
    color: '#fff',
  },
});


export default FilterOptions;
