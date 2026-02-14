import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView, TextInput, Image, KeyboardAvoidingView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import DeleteIcon from '../../assets/Icons/DeleteIcon.jsx';
import EditIcon from '../../assets/Icons/EditIcon.jsx';
import AddressIcon from '../../assets/Icons/LocationIcon.jsx';
import EditAddressOverlay from '../../Components/EditAddressOverlay.jsx';

const { width, height } = Dimensions.get('window');

const AddAddressScreen = () => {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Current address - hardcoded to match screenshot (you can make this dynamic via props or API)
  const currentAddress = {
    street: '606-3727 ULLAMCORPORER. STREET',
    cityStateZip: 'ROSEVILLE NH 11523',
    phone: '(786) 713-8616',
  };

  // Additional addresses - now dynamic
  const [additionalAddresses, setAdditionalAddresses] = useState([
    {
      id: 2,
      street: '123-456 MAIN STREET',
      cityStateZip: 'NEW YORK NY 10001',
      phone: '(212) 555-1234',
    },
    {
      id: 3,
      street: '789-101 OAK AVENUE',
      cityStateZip: 'LOS ANGELES CA 90001',
      phone: '(310) 555-5678',
    },
    {
      id: 4,
      street: '456-789 ELM STREET',
      cityStateZip: 'CHICAGO IL 60601',
      phone: '(312) 555-9012',
    }
  ]);

  // State to track which address is selected for delivery
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState(2); // Default to address ID 2

  // Form data for new address
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    phone: '',
  });

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleConfirmAddress = useCallback(() => {
    // Validate fields
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.pinCode || !formData.phone) {
      alert('Please fill in all fields');
      return;
    }

    // Create new address object
    const newAddress = {
      id: Date.now(), // Simple unique ID
      name: formData.name,
      street: formData.address,
      cityStateZip: `${formData.city.toUpperCase()} ${formData.state} ${formData.pinCode}`,
      phone: formData.phone,
      isDeliveryAddress: false, // Default to not selected
    };

    // Add new address to the list
    setAdditionalAddresses(prev => [...prev, newAddress]);

    // Reset form
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      phone: '',
    });

    console.log('New address added:', newAddress);
  }, [formData]);

  const handleRemoveAddress = useCallback((addressId) => {
    setAdditionalAddresses(prev => prev.filter(addr => addr.id !== addressId));
    // If removing the selected delivery address, reset selection to current location (id: 1)
    if (selectedDeliveryAddressId === addressId) {
      setSelectedDeliveryAddressId(1);
    }
  }, [selectedDeliveryAddressId]);

  const handleEditCurrentAddress = useCallback(() => {
    setShowEditOverlay(true);
  }, []);

  const handleEditAddress = useCallback((address) => {
    setEditingAddress(address);
    setShowEditOverlay(true);
  }, []);

  const handleSaveEditedAddress = useCallback((editedData) => {
    if (editingAddress) {
      setAdditionalAddresses(prev => 
        prev.map(addr => 
          addr.id === editingAddress.id 
            ? { ...addr, ...editedData }
            : addr
        )
      );
    }
    setShowEditOverlay(false);
    setEditingAddress(null);
  }, [editingAddress]);

  const handleSelectDeliveryAddress = useCallback((addressId) => {
    setSelectedDeliveryAddressId(addressId);
  }, []);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
          <View style={styles.container}>
            {/* Header - matches screenshot layout */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <BackIcon width={26} height={26} />
              </TouchableOpacity>
              
              <Text style={styles.title}>ADD ADDRESS</Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView 
              ref={scrollRef}
              style={styles.scrollView} 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
            >
              {/* CURRENT LOCATION */}
              <View style={styles.currentAddressSection}>
                <Text style={styles.sectionTitle}>CURRENT LOCATION</Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.currentLocationPill,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => {
                    // TODO: Open map / detect location
                    console.log('Use current location');
                  }}
                >
                  {/* Icon */}
                  <View style={styles.locationIconWrap}>
                    <AddressIcon width={34} height={34} />
                  </View>

                  {/* Address text */}
                  <Text
                    style={styles.currentLocationText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    B-127, B BLOCK, SECTOR 69, NOIDA
                  </Text>
                </Pressable>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* ADDITIONAL ADDRESSES SECTION */}
              <View style={styles.additionalAddressesSection}>
               
                
                {/* Thin separator below section title */}
                {/* <View style={styles.sectionTitleSeparator} /> */}
                
                {additionalAddresses.map((address) => (
                  <View key={address.id} style={[
                    styles.addressContainer,
                    selectedDeliveryAddressId === address.id && styles.selectedAddressContainer
                  ]}>
                    <View style={styles.addressLine}>
                      <Text style={styles.addressText}>{address.street}</Text>
                      <View style={styles.iconRow}>
                        <Pressable onPress={() => handleRemoveAddress(address.id)} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                          <DeleteIcon width={15} height={17} />
                        </Pressable>
                        <Pressable style={[styles.editIcon, ({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })]} onPress={() => handleEditAddress(address)}>
                          <EditIcon width={16} height={16} />
                        </Pressable>
                      </View>
                    </View>
                    
                    <Text style={styles.addressText}>{address.cityStateZip}</Text>
                    <Text style={styles.phoneText}>{address.phone}</Text>
                    
                    <Pressable
                    style={({ pressed }) => [
                      styles.deliveryButton,
                      selectedDeliveryAddressId === address.id && styles.deliveryButtonSelected,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => handleSelectDeliveryAddress(address.id)}
                  >
                    <Text style={[styles.deliveryButtonText, selectedDeliveryAddressId === address.id && styles.deliveryButtonTextSelected]}>
                      {selectedDeliveryAddressId === address.id ? 'SELECTED AS DELIVERY ADDRESS' : 'SET AS DELIVERY ADDRESS'}
                    </Text>
                  </Pressable>
               
                  
                  {/* Thin separator below each address */}
                  <View style={styles.addressSeparator} />
                  </View>
                ))}
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* NEW ADDRESS SECTION */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>NEW ADDRESS</Text>
                
                {/* Name */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholder="Name"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Address */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    value={formData.address}
                    onChangeText={(value) => handleInputChange('address', value)}
                    placeholder="Address"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* City */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    value={formData.city}
                    onChangeText={(value) => handleInputChange('city', value)}
                    placeholder="City"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* State and PIN CODE - side by side */}
                <View style={styles.rowInputGroup}>
                  <View style={styles.halfInput}>
                    <TextInput
                      style={styles.input}
                      value={formData.state}
                      onChangeText={(value) => handleInputChange('state', value)}
                      placeholder="State"
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.halfInput}>
                    <TextInput
                      style={styles.input}
                      value={formData.pinCode}
                      onChangeText={(value) => handleInputChange('pinCode', value)}
                      placeholder="Pin code"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                </View>

                {/* Phone Number */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    placeholder="Phone number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Extra padding at bottom for button space */}
              <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Bottom Confirm Button - Fixed at bottom */}
            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmAddress}>
                <Text style={styles.confirmText}>CONFIRM ADDRESS</Text>
              </TouchableOpacity>
            </View>
          </View>
      </KeyboardAvoidingView>

      {showEditOverlay && (
        <EditAddressOverlay
          visible={showEditOverlay}
          onClose={() => {
            setShowEditOverlay(false);
            setEditingAddress(null);
          }}
          onSave={handleSaveEditedAddress}
          address={editingAddress}
        />
      )}
    </>
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
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
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
  title: {
    flex: 1,
    textAlign: 'right',
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
   // marginRight: 40, // to center it accounting for back button
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  section: {
    top:20,
    paddingHorizontal: width * 0.05,
    paddingVertical: 12,
  },
  currentAddressSection: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: width * 0.05,
    paddingVertical: 10,
  },
  sectionTitle: {
    
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  currentAddressContainer: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  // Current Location Pill Styles
  currentLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
  //  backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentLocationText: {
    flex: 1,
    fontSize: 15,
    color: '#777',
    fontWeight: '500',
  },
  addressLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  editIcon: {
    marginLeft: 5,
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  phoneText: {
    fontSize: 15,
    color: '#333',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: width * 0.05,
  },
  inputGroup: {
    marginBottom: 15,
    paddingVertical: 10,
  },
  rowInputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bottomBar: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bottomPadding: {
    height: 80, // Optimal padding to ensure content doesn't get hidden behind button
  },
  confirmBtn: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Additional Addresses Styles
  additionalAddressesSection: {
    paddingHorizontal: width * 0.05,
    paddingVertical: 15,
  },
  sectionTitleSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  addressContainer: {
  
    borderRadius: 8,
    marginBottom: 20,
    padding: 12,
  },
  selectedAddressContainer: {
    backgroundColor: '#fafafa',
  },
 
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addressSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 0,
  },
  // Delivery Button Styles
  deliveryButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  deliveryButtonSelected: {
    backgroundColor: '#000',
  },
  deliveryButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  deliveryButtonTextSelected: {
    color: '#fff',
  },
});

export default AddAddressScreen;