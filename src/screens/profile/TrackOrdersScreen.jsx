import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import TruckIcon from '../../assets/Icons/TruckIconWhite.jsx';
import DeliverDot from '../../assets/Icons/DeliverDot.jsx';

const { width } = Dimensions.get('window');

const orders = [
  {
    id: '1',
    brand: 'LAMEREI',
    title: 'RECYCLE BOUCLE KNIT CARDIGAN PINK',
    trackingId: '#AS123ZA',
    deliveryDate: '12/02/2024',
    image: require('../../assets/Images/image.png'),
  },
  {
    id: '2',
    brand: 'LAMEREI',
    title: 'RECYCLE BOUCLE KNIT CARDIGAN PINK',
    trackingId: '#AS123ZA',
    deliveryDate: '12/02/2024',
    image: require('../../assets/Images/Image2.png'),
  },
];

const TrackOrdersScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>TRACK ORDER</Text>

     
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {orders.map(item => (
          <View key={item.id} style={styles.orderBlock}>
            {/* Product Row */}
            <View style={styles.row}>
              <Image source={item.image} style={styles.image} />

              <View style={styles.info}>
                <Text style={styles.brand}>{item.brand}</Text>
                <Text style={styles.title}>{item.title}</Text>

                <Text style={styles.tracking}>
                  Tracking ID : <Text style={styles.bold}>{item.trackingId}</Text>
                </Text>

                <View style={styles.deliveryRow}>
                  <DeliverDot width={8} height={8} />
                  <Text style={styles.delivery}>
                    Delivery by {item.deliveryDate}
                  </Text>
                </View>
              </View>
            </View>

            {/* Track Button */}
            <TouchableOpacity 
              style={styles.trackBtn} 
              activeOpacity={0.9}
              onPress={() => navigation.navigate('TrackOrderDetailScreen', { order: item })}
            >
              <TruckIcon width={20} height={20} color="#fff" />
              <Text style={styles.trackText}>TRACK ORDER</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default TrackOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 55 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },

  orderBlock: {
    paddingHorizontal: 14,
    paddingTop: 25,
  },

  row: {
    flexDirection: 'row',
  },

  image: {
    width: 95,
    height: 125,
    marginRight: 15,
  },

  info: {
    flex: 1,
  },

  brand: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 2,
  },

  title: {
    fontSize: 13,
    color: '#666',
    marginVertical: 6,
    lineHeight: 18,
    letterSpacing: 1,
  },

  tracking: {
    fontWeight:600,
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },

  bold: {
    fontWeight: '600',
    color: '#000',
  },

  deliveryRow: {
    top:8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  delivery: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
  },

  trackBtn: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 25,
  },

  trackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 10,
    letterSpacing: 1,
  },
});