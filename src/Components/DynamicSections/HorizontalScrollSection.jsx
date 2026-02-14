import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import Rating from '../../assets/Icons/Rating.jsx';
import LikeIcon from '../../assets/Icons/LikeIcons.jsx';
import Forwardarrow from '../../assets/Icons/Forwardarrow.jsx';
import HeadingArrow from '../../assets/Icons/HeadingArrow.jsx';
import { getFontFamily } from '../../utils/fontLoader';

const { width, height } = Dimensions.get('window');

const HorizontalScrollSection = React.memo(({ section }) => {
  const navigation = useNavigation();

  const renderProductItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        <Image source={item.image} style={styles.productImage} resizeMode="cover" />
        <TouchableOpacity style={styles.likeButton} activeOpacity={0.8}>
          <LikeIcon width={34} height={34} />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfoContainer}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>{item.price}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            <Rating width={14} height={14} />
          </View>
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <HeadingArrow width={130} height={18} />
      </View>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={section.data}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={styles.horizontalContainer}
        snapToInterval={width * 0.4 + width * 0.02}
        decelerationRate="fast"
        snapToAlignment="center"
        windowSize={5}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        removeClippedSubviews={Platform.OS === 'android'}
        getItemLayout={(data, index) => ({
          length: width * 0.4,
          offset: index * (width * 0.4 + width * 0.02),
          index,
        })}
      />
      
      {section.showExploreMore && (
        <TouchableOpacity 
          style={styles.exploreMoreButton} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate(section.exploreMoreRoute, { section: section.id })}
        >
          <View style={styles.exploreMoreContent}>
            <Text style={styles.exploreMoreText}>EXPLORE MORE</Text>
            <Forwardarrow width={28} height={20} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.04,
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
    top: -13,
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  horizontalContainer: {
    paddingRight: width * 0.05,
  },
  productItem: {
    width: width * 0.4,
    backgroundColor: '#fff',
    marginRight: width * 0.02,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: height * 0.01,
  },
  productImage: {
    width: '100%',
    height: width * 0.5,
  },
  likeButton: {
    position: 'absolute',
    top: '80%',
    right: 3,
    padding: 4,
  },
  productInfoContainer: {
    marginTop: height * 0.01,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000',
    fontFamily: getFontFamily(),
    lineHeight: 16,
    letterSpacing: 0,
    marginBottom: height * 0.005,
  },
  priceContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '400',
    color: '#C0914B',
    fontFamily: getFontFamily(),
    lineHeight: 24,
    letterSpacing: 0,
  },
  ratingContainer: {
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: width * 0.01,
  },
  ratingText: {
    fontSize: width * 0.03,
    fontWeight: '400',
    color: '#666',
    fontFamily: getFontFamily(),
  },
  exploreMoreButton: {
    borderWidth: 0.8,
    borderColor: '#000',
    backgroundColor: 'transparent',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.03,
    alignSelf: 'center',
  },
  exploreMoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: width * 0.01,
  },
  exploreMoreText: {
    fontSize: width * 0.032,
    fontWeight: '500',
    color: '#000',
    fontFamily: getFontFamily(),
    letterSpacing: 1.5,
  },
});

export default HorizontalScrollSection;
