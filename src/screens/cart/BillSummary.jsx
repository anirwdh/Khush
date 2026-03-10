import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import Coupon from '../../assets/Icons/Coupon.jsx';

const { width } = Dimensions.get('window');

const BillSummary = () => {
  const navigation = useNavigation();
  const [couponCode, setCouponCode] = useState('');

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BILL SUMMARY</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={{width: 24, height: 24}} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* COUPON */}
        <View style={styles.couponWrapper}>
          <View style={styles.couponInput}>
            <Coupon width={22} height={16} left={50}/>
            <TextInput
              placeholder="ENTER COUPON CODE HERE"
              placeholderTextColor="#999"
              style={styles.input}
              value={couponCode}
              onChangeText={setCouponCode}
            />
          </View>
          <TouchableOpacity style={styles.applyBtn}>
            <Text style={styles.applyText}>APPLY</Text>
          </TouchableOpacity>
        </View>

        {/* BILL SUMMARY */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bill Summary</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Item Total</Text>
            <View style={styles.priceRow}>
              <Text style={styles.strike}>Rs 65</Text>
              <Text style={styles.value}>Rs 315</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Platform Fee</Text>
            <View style={styles.priceRow}>
              <Text style={styles.strike}>Rs 15</Text>
              <Text style={styles.free}>Free</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Discount</Text>
            <View style={styles.priceRow}>
              <Text style={styles.strike}>Rs 12</Text>
              <Text style={styles.free}>Free</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={styles.priceRow}>
              <Text style={styles.strike}>Rs 65</Text>
              <Text style={styles.total}>Rs 315</Text>
            </View>
          </View>
        </View>

        {/* SAVINGS */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>Savings on this order</Text>
            <Text style={styles.total}>Rs 146</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.label}>Discount on MRP</Text>
            <Text style={styles.value}>Rs 121</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>FREE Delivery savings</Text>
            <Text style={styles.value}>Rs 15</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Savings on Handling fee</Text>
            <Text style={styles.value}>Rs 12</Text>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM CHECKOUT BAR */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.bottomPrice}>₹240</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn}>
          <Text style={styles.checkoutText}>CHECKOUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 2
  },
  couponWrapper: {
    paddingHorizontal: 20,
    marginTop: 10
  },
  couponInput: {


    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 15,
    height: 50
  },
  input: {
    flex: 1,
    marginLeft: 60,
    fontSize: 14
  },
  applyBtn: {
    backgroundColor: "#000",
    marginTop: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center"
  },
  applyText: {
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 1
  },
  card: {
    backgroundColor: "#f3f3f3",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14
  },
  label: {
    fontSize: 14,
    color: "#666"
  },
  value: {
    fontSize: 14
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  strike: {
    textDecorationLine: "line-through",
    color: "#999",
    marginRight: 6
  },
  free: {
    color: "#1e9b4f",
    fontWeight: "500"
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginTop: 16
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600"
  },
  total: {
    fontSize: 16,
    fontWeight: "600"
  },
  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff"
  },
  totalContainer: {
    alignItems: "center",
    marginBottom: 15
  },
  bottomPrice: {
    fontSize: 22,
    color: "#d36b44",
    fontWeight: "600"
  },
  checkoutBtn: {
    backgroundColor: "#000",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%"
  },
  checkoutText: {
    color: "#fff",
    letterSpacing: 1,
    fontWeight: "600"
  }
});

export default BillSummary;