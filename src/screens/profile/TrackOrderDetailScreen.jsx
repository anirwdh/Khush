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
import TruckIconWhite from '../../assets/Icons/TruckIconWhite.jsx';
import DeliverDot from '../../assets/Icons/DeliverDot.jsx';

const { width } = Dimensions.get('window');

const TrackOrderDetailScreen = () => {
  const navigation = useNavigation();

  const timeline = [
    { status: 'Order Placed', date: 'On 12/02/2024' },
    { status: 'Waiting for delivery partner', date: 'On 12/02/2024' },
    { status: 'Item Picked', date: 'On 12/02/2024' },
    { status: 'Out for delivery', date: 'On 12/02/2024' }
  ];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>TRACK ORDER</Text>

       
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PRODUCT */}
        <View style={styles.productSection}>
          <View style={styles.row}>
            <Image
              source={require('../../assets/Images/image.png')}
              style={styles.image}
            />

            <View style={styles.info}>
              <Text style={styles.brand}>LAMEREI</Text>
              <Text style={styles.title}>
                RECYCLE BOUCLE KNIT CARDIGAN PINK
              </Text>

              <Text style={styles.tracking}>
                Tracking ID : <Text style={styles.bold}>#AS123ZA</Text>
              </Text>

              <View style={styles.deliveryRow}>
                <DeliverDot width={8} height={8} />
                <Text style={styles.delivery}>
                  Delivery by 12/02/2024
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* DELIVER TO */}
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>DELIVER TO</Text>
          <Text style={styles.address}>
            606-3727 ULLAMCORPER. STREET ROSEVILLE
          </Text>
          <Text style={styles.address}>NH 11523</Text>
          <Text style={styles.address}>(786) 713-8616</Text>
        </View>

        {/* TIMELINE */}
        <View style={styles.timelineSection}>
          {timeline.map((item, index) => (
            <View key={index} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.square} />

                {index !== timeline.length - 1 && (
                  <View style={styles.dashContainer}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <View key={i} style={styles.dash} />
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.timelineRight}>
                <Text style={styles.timelineTitle}>{item.status}</Text>
                <View style={styles.timelineDateRow}>
                  <DeliverDot width={10} height={10} />
                  <Text style={styles.timelineDate}>{item.date}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* CANCEL */}
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>CANCEL ORDER</Text>
        </TouchableOpacity>

        {/* TRACK ORDER BUTTON */}
        <TouchableOpacity style={styles.trackOrderBtn}>
          <TruckIconWhite width={22} height={22} />
          <Text style={styles.trackOrderText}>TRACK ORDER</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 55 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },



  productSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
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
    letterSpacing: 2,
  },

  title: {
    fontSize: 13,
    color: '#666',
    marginVertical: 6,
    lineHeight: 18,
  },

  tracking: {
    fontSize: 14,
    color: '#666',
  },

  bold: {
    fontWeight: '600',
    color: '#000',
  },

  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginRight: 12,
  },

  delivery: {
left:6,
    fontSize: 10,
    color: '#999',
  },

  addressSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  address: {
    fontSize: 15,
    color: '#666',
    marginBottom: 6,
  },

  timelineSection: {
    
    padding: 20,
  },

  timelineRow: {

    flexDirection: 'row',
    marginBottom: 6,
  },

  timelineLeft: {
    alignItems: 'center',
    width: 40,
  },

  square: {
    width: 50,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#000',
    backgroundColor: '#fff',
    zIndex: 2,
  },

  lineWrapper: {
    position: 'absolute',
    top: 40, // EXACTLY square height
    alignItems: 'center',
  },

  dashContainer: {
    marginTop: 0,
    alignItems: 'center',
  },

  dash: {
    width: 2,
    height: 4,
    backgroundColor: '#000',
    marginVertical: 3,
  },

  timelineRight: {
    marginLeft: 20,
    paddingTop: 4,
  },

  timelineTitle: {
    
    opacity:0.7,
    top:5,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },

  timelineDate: {
    top:0,
    left:6,
    fontSize: 10,
    color: '#9a9a9a',
  },

  timelineDateRow: {
    top:0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  smallDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginRight: 8,
  },

  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },

  trackOrderBtn: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },

  trackOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
    letterSpacing: 1,
  },
});


export default TrackOrderDetailScreen;
