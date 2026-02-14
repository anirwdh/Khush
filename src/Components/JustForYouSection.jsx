import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LikeIcon from '../assets/Icons/LikeIcons.jsx';
import Rating from '../assets/Icons/Rating.jsx';
import HeadingArrow from '../assets/Icons/HeadingArrow.jsx';
import { getFontFamily } from '../utils/fontLoader';

const { width, height } = Dimensions.get('window');

const JustForYouSection = React.memo(() => {
  const navigation = useNavigation();
  const [likedItems, setLikedItems] = useState(new Set());

  const justForYouData = useMemo(() => [
    { id: '1', image: require('../assets/Images/image.png'), title: 'Summer Collection', price: '$149', rating: 4.5 },
    { id: '2', image: require('../assets/Images/Image2.png'), title: 'Casual Wear', price: '$199', rating: 3.8 },
    { id: '3', image: require('../assets/Images/Image3.png'), title: 'Formal Suit', price: '$499', rating: 4.2 },
    { id: '4', image: require('../assets/Images/image.png'), title: 'Party Dress', price: '$259', rating: 4.7 },
    { id: '5', image: require('../assets/Images/Image2.png'), title: 'Winter Jacket', price: '$399', rating: 4.1 },
  ], []);

  const handleLikePress = useCallback((itemId) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.justForYouItem} 
      onPress={() => navigation.navigate('ProductDetail', { productId: `product-${item.id}` })}
      activeOpacity={0.8}
    >
      <View style={styles.justForYouImageContainer}>
        <Image source={item.image} style={styles.justForYouImage} resizeMode="cover" />
        <TouchableOpacity 
          style={styles.likeButton} 
          onPress={() => handleLikePress(item.id)}
          activeOpacity={0.7}
        >
          <LikeIcon 
            width={34} 
            height={34} 
            fill={likedItems.has(item.id) ? '#FF0000' : 'none'}
            stroke={likedItems.has(item.id) ? '#FF0000' : '#000'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.justForYouInfoContainer}>
        <Text style={styles.justForYouTitle}>{item.title}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.justForYouPrice}>{item.price}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            <Rating width={14} height={14} />
          </View>
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [likedItems, handleLikePress, navigation]);

  return (
    <View style={styles.justForYouSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>JUST FOR YOU</Text>
      </View>
      <View style={styles.arrowContainer}>
        <HeadingArrow width={130} height={18} />
      </View>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={justForYouData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.justForYouContainer}
        snapToInterval={width * 0.65 + 10}
        decelerationRate="fast"
        snapToAlignment="center"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  justForYouSection: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: '400',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 4,
  },
  arrowContainer: {
    alignItems: 'center',
    marginBottom: height * 0.03,
    top: -13,
  },
  justForYouContainer: {
    paddingRight: width * 0.05,
  },
  justForYouItem: {
    width: width * 0.65,
    marginRight: width * 0.03,
    backgroundColor: '#fff',
  },
  justForYouImageContainer: {
    position: 'relative',
    marginBottom: height * 0.01,
  },
  justForYouImage: {
    width: '100%',
    height: width * 0.8,
    borderRadius: 0,
  },
  likeButton: {
    position: 'absolute',
    top:'84%',
    right: 10,
  //  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  //  borderRadius: 17,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  justForYouInfoContainer: {
    marginTop: height * 0.01,
    paddingHorizontal: width * 0.01,
  },
  justForYouTitle: {
    fontSize: width * 0.04,
    fontWeight: '500',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    lineHeight: 18,
    letterSpacing: 0.5,
    marginBottom: height * 0.005,
  },
  justForYouPrice: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#C0914B',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  priceContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
  },
  ratingContainer: {
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  starsContainer: {
    marginRight: 5,
  },
  ratingText: {
    fontSize: width * 0.03,
    fontWeight: '400',
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
  },
});

export default JustForYouSection;
