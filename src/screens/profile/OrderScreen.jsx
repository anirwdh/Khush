import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import DeliverDot from '../../assets/Icons/DeliverDot.jsx';

const { width } = Dimensions.get('window');

const Stars = ({ count = 0 }) => {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{ fontSize: 18, marginRight: 4 }}>
          {i <= count ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
};

const OrderCard = ({ item }) => {
  return (
    <View style={styles.card}>
      {/* Top Row */}
      <View style={styles.row}>
        <Image source={item.image} style={styles.productImage} />

        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.title}>{item.title}</Text>

          <Text style={styles.tracking}>
            Tracking ID : <Text style={styles.bold}>{item.trackingId}</Text>
          </Text>

          {!item.cancelled && (
            <View style={styles.deliveredRow}>
              <DeliverDot width={8} height={8} />
              <Text style={styles.delivered}>
                Delivered On {item.deliveredOn}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Review Row */}
      {!item.cancelled && (
        <View style={styles.reviewRow}>
          <Stars count={item.rating} />
          <Text style={styles.reviewText}>LEAVE A REVIEW</Text>
        </View>
      )}

      {/* Invoice Button */}
      {!item.cancelled && (
        <TouchableOpacity style={styles.invoiceBtn}>
          <Text style={styles.invoiceText}>GET INVOICE</Text>
        </TouchableOpacity>
      )}

      {/* Cancelled */}
      {item.cancelled && (
        <View style={styles.cancelledBtn}>
          <Text style={styles.cancelledText}>ORDER CANCELLED</Text>
        </View>
      )}
    </View>
  );
};

const OrderScreen = ({ route }) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(4); // Orders tab is active

  // Updated data structure to match UI
  const orders = [
    {
      id: '1',
      brand: 'LAMEREI',
      title: 'RECYCLE BOUCLE KNIT CARDIGAN PINK',
      trackingId: '#AS123ZA',
      deliveredOn: '12/02/2024',
      image: require('../../assets/Images/image.png'),
      rating: 3,
      cancelled: false,
    },
    {
      id: '2',
      brand: 'LAMEREI',
      title: 'RECYCLE BOUCLE KNIT CARDIGAN PINK',
      trackingId: '#AS123ZA',
      deliveredOn: '12/02/2024',
      image: require('../../assets/Images/Image2.png'),
      rating: 3,
      cancelled: false,
    },
    {
      id: '3',
      brand: 'LAMEREI',
      title: 'RECYCLE BOUCLE KNIT CARDIGAN PINK',
      trackingId: '#AS123ZA',
      deliveredOn: '12/02/2024',
      image: require('../../assets/Images/Image3.png'),
      cancelled: true,
    },
  ];

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
        
        <Text style={styles.detailsText}>ORDERS</Text>
      </View>

      {/* Orders Content */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: width * 0.05, paddingTop: 20 }}>
            {orders.map(item => (
              <OrderCard key={item.id} item={item} />
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // New Order Card Styles
  card: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  productImage: {
    width: 90,
    height: 120,
    marginRight: 15,
  },
  brand: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 1,
  },
  title: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
    letterSpacing: 1,
  },
  tracking: {
    top:6,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  bold: {
    fontWeight: '500',
    color: '#000',
  },
  deliveredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },
  delivered: {
    top:-0.4,
    fontSize: 10,
    color: '#888',
    marginLeft: 6,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewText: {
    fontSize: 16,
    letterSpacing: 1,
    fontWeight: '400',
  },
  invoiceBtn: {
    backgroundColor: '#eee',
    paddingVertical: 14,
    alignItems: 'center',
  },
  invoiceText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 1,
  },
  cancelledBtn: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelledText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 1,
  },
});

export default OrderScreen;