import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import LikeIcon from '../../assets/Icons/LikeIcons.jsx';
import Rating from '../../assets/Icons/Rating.jsx';

const { width, height } = Dimensions.get('window');

const ProductListScreen = () => {
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14; // 7 rows × 2 columns

  // Mock product data with same structure as HomeScreen
  const allProducts = [
    { id: '1', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹120', rating: '4.5', image: require('../../assets/Images/image.png') },
    { id: '2', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹149', rating: '4.2', image: require('../../assets/Images/Image2.png') },
    { id: '3', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹259', rating: '4.8', image: require('../../assets/Images/Image3.png') },
    { id: '4', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹189', rating: '4.1', image: require('../../assets/Images/image.png') },
    { id: '5', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹299', rating: '4.6', image: require('../../assets/Images/Image2.png') },
    { id: '6', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹399', rating: '4.9', image: require('../../assets/Images/Image3.png') },
    { id: '7', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹159', rating: '4.3', image: require('../../assets/Images/image.png') },
    { id: '8', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹219', rating: '4.7', image: require('../../assets/Images/Image2.png') },
    { id: '9', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹349', rating: '4.4', image: require('../../assets/Images/Image3.png') },
    { id: '10', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹179', rating: '4.0', image: require('../../assets/Images/image.png') },
    { id: '11', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹279', rating: '4.5', image: require('../../assets/Images/Image2.png') },
      { id: '12', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹419', rating: '4.8', image: require('../../assets/Images/Image3.png') },
      { id: '13', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹199', rating: '4.2', image: require('../../assets/Images/image.png') },
    { id: '14', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹239', rating: '4.6', image: require('../../assets/Images/Image2.png') },
    { id: '15', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹329', rating: '4.1', image: require('../../assets/Images/Image3.png') },
    { id: '16', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹169', rating: '4.7', image: require('../../assets/Images/image.png') },
    { id: '17', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹289', rating: '4.3', image: require('../../assets/Images/Image2.png') },
      { id: '18', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹209', rating: '4.4', image: require('../../assets/Images/image.png') },
    { id: '20', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹259', rating: '4.6', image: require('../../assets/Images/Image2.png') },
    { id: '21', title: 'LAMEREI', subtitle: 'Recycle Boucle Knit Cardigan Pink', price: '₹349', rating: '4.8', image: require('../../assets/Images/Image3.png') },
  ];

  // Calculate current page products
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = allProducts.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);

  const renderProduct = ({ item, index }) => (
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
        <Text style={styles.productSubtitle} numberOfLines={1} ellipsizeMode="tail">{item.subtitle}</Text>
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
  );

  const renderPaginationButton = (pageNumber) => (
    <TouchableOpacity
      key={pageNumber}
      style={[
        styles.paginationButton,
        currentPage === pageNumber && styles.paginationButtonActive
      ]}
      onPress={() => setCurrentPage(pageNumber)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.paginationButtonText,
        currentPage === pageNumber && styles.paginationButtonTextActive
      ]}>
        {pageNumber}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <BackIcon width={26} height={26} />
        </TouchableOpacity>
        
        <Text style={styles.detailsText}>NEW ARRIVALS</Text>
      </View>

      {/* Product Grid */}
      <FlatList
        data={currentProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        ListFooterComponent={
          <View style={styles.paginationContainer}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(renderPaginationButton)}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 7,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5ff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
    letterSpacing: 1,
  },
  productList: {
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  productItem: {
    width: width * 0.44,
    backgroundColor: '#fff',
    marginBottom: height * 0.02,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: height * 0.01,
  },
  productImage: {
    width: '100%',
    height: width * 0.55,
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
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 0,
    marginBottom: height * 0.007,
  },
  productSubtitle: {
    fontSize: 9,
    fontWeight: '400',
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 0,
    marginBottom: height * 0.009,
  },
  priceContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '400',
    color: '#C0914B',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
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
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  paginationButton: {
    width: 35,
    height: 35,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  paginationButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#666',
  },
  paginationButtonTextActive: {
    color: '#fff',
  },
});

export default ProductListScreen;
