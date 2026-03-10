import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView, TextInput, Image, KeyboardAvoidingView, Pressable, ActivityIndicator, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../../assets/Icons/BackIcon.jsx';
import DeleteIcon from '../../assets/Icons/DeleteIcon.jsx';
import EditIcon from '../../assets/Icons/EditIcon.jsx';
import AddressIcon from '../../assets/Icons/LocationIcon.jsx';
import EditAddressOverlay from '../../Components/EditAddressOverlay.jsx';
import { useGeolocation } from '../../hooks/useGeolocation';
import apiClient from '../../services/api/apiClient';
import AddressService from '../../services/addressService';
import { triggerMediumHaptic, triggerWaterDropletHaptic } from '../../utils/haptic';

const { width, height } = Dimensions.get('window');

const AddAddressScreen = () => {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Geolocation hook
  const { 
    loading: locationLoading, 
    error: locationError, 
    permissionGranted, 
    pincode, 
    formattedAddress,
    requestLocation 
  } = useGeolocation();

  // State for addresses from API
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressesError, setAddressesError] = useState(null);
  
  // Animation values for smooth selection
  const selectedAddressScale = useRef(new Animated.Value(1)).current;
  const [animatingAddressId, setAnimatingAddressId] = useState(null);
  
  // Current address - hardcoded to match screenshot (you can make this dynamic via props or API)
  const currentAddress = {
    street: '606-3727 ULLAMCORPORER. STREET',
    cityStateZip: 'ROSEVILLE NH 11523',
    phone: '(786) 713-8616',
  };

  // Additional addresses - now from API
  const additionalAddresses = addresses.map(addr => ({
    id: addr._id,
    street: addr.addressLine,
    cityStateZip: `${addr.city} ${addr.state} ${addr.pinCode}`,
    phone: `${addr.countryCode} ${addr.phoneNumber}`,
    isDefault: addr.isDefault,
    name: addr.name,
    addressType: addr.addressType,
    // Add individual fields for edit modal
    city: addr.city,
    state: addr.state,
    pinCode: addr.pinCode.toString(),
    phoneNumber: addr.phoneNumber,
    countryCode: addr.countryCode,
    addressLine: addr.addressLine,
  }));

  // State to track which address is selected for delivery
  const defaultAddress = additionalAddresses.find(addr => addr.isDefault);
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState(defaultAddress?.id || null);

  // Form data for new address
  const [formData, setFormData] = useState({
    name: '',
    address: '', // Empty for new address input
    city: '',
    state: '',
    pinCode: pincode || '', // Keep pincode if available
    phone: '',
    addressType: 'HOME', // Default to HOME
  });

  // Update form when location data changes (only pincode, not address)
  useEffect(() => {
    if (pincode) {
      setFormData(prev => ({
        ...prev,
        pinCode: pincode, // Only update pincode, keep address empty
      }));
    }
  }, [pincode]);

  // Fetch addresses from API
  const fetchAddresses = useCallback(async () => {
    try {
      setLoadingAddresses(true);
      setAddressesError(null);
      
      // Use AddressService to get addresses
      const data = await AddressService.getAllAddresses();
      
      if (data.success) {
        setAddresses(data.data.addresses);
        
        // Set default address if available
        const defaultAddr = data.data.addresses.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedDeliveryAddressId(defaultAddr._id);
          console.log('📍 Default address set:', defaultAddr._id);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch addresses');
      }
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      let errorMessage = 'Failed to fetch addresses';
      
      if (error.customMessage) {
        errorMessage = error.customMessage;
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please login again.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setAddressesError(errorMessage);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Update selected delivery address when addresses change
  useEffect(() => {
    const defaultAddr = additionalAddresses.find(addr => addr.isDefault);
    if (defaultAddr && !selectedDeliveryAddressId) {
      setSelectedDeliveryAddressId(defaultAddr.id);
    }
  }, [additionalAddresses, selectedDeliveryAddressId]);

  // Handle location refetch
  const handleRefetchLocation = async () => {
    try {
      console.log('📍 ADD ADDRESS: Refetching location...');
      await requestLocation();
      console.log('📍 ADD ADDRESS: Location refetched successfully');
    } catch (error) {
      console.error('❌ ADD ADDRESS: Location refetch failed:', error);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleConfirmAddress = useCallback(async () => {
    // Validate fields
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.pinCode || !formData.phone) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Create new address object for API
      const newAddressData = {
        name: formData.name.trim(),
        phoneNumber: formData.phone.trim(),
        countryCode: '+91',
        addressLine: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pinCode: formData.pinCode.trim(),
        country: 'India',
        addressType: formData.addressType,
        isDefault: false,
      };

      console.log('🚀 Creating new address:', newAddressData);

      // Use AddressService to create address
      const result = await AddressService.createAddress(newAddressData);
      
      if (result.success) {
        // Refresh addresses list
        await fetchAddresses();
        
        // Reset form
        setFormData({
          name: '',
          address: '', // Keep empty for new address input
          city: '',
          state: '',
          pinCode: pincode || '', // Keep current pincode if available
          phone: '',
          addressType: 'HOME', // Reset to default
        });

        alert('Address added successfully!');
        console.log('✅ Address created successfully');
      } else {
        throw new Error(result.message || 'Failed to create address');
      }
    } catch (error) {
      console.error('❌ Error creating address:', error);
      
      let errorMessage = 'Failed to create address';
      
      if (error.customMessage) {
        errorMessage = error.customMessage;
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please login again.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid data. Please check all fields.';
      } else if (error.response?.status === 500 && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      alert(errorMessage);
    }
  }, [formData, fetchAddresses]);

  const handleRemoveAddress = useCallback(async (addressId) => {
    try {
      // Trigger haptic feedback for delete
      triggerMediumHaptic();
      
      // Use AddressService to delete address
      const result = await AddressService.deleteAddress(addressId);
      
      if (result.success) {
        // Remove from local state immediately for better UX
        setAddresses(prev => prev.filter(addr => addr._id !== addressId));
        
        // If removing the selected delivery address, reset selection to default address
        if (selectedDeliveryAddressId === addressId) {
          const defaultAddr = addresses.find(addr => addr.isDefault && addr._id !== addressId);
          setSelectedDeliveryAddressId(defaultAddr?._id || null);
        }
        
        // Refresh addresses to get updated list
        await fetchAddresses();
        alert('Address deleted successfully!');
        console.log('✅ Address deleted successfully');
      } else {
        throw new Error(result.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('❌ Error deleting address:', error);
      
      let errorMessage = 'Failed to delete address';
      
      if (error.customMessage) {
        errorMessage = error.customMessage;
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please login again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Address not found.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      alert(errorMessage);
    }
  }, [addresses, selectedDeliveryAddressId, fetchAddresses]);

  const handleEditCurrentAddress = useCallback(() => {
    setShowEditOverlay(true);
  }, []);

  const handleEditAddress = useCallback((address) => {
    setEditingAddress(address);
    setShowEditOverlay(true);
  }, []);

  const handleSaveEditedAddress = useCallback(async (editedData) => {
    try {
      // Trigger haptic feedback for save
      triggerMediumHaptic();
      
      // Use AddressService to update address
      const result = await AddressService.updateAddress(editingAddress.id, editedData);
      
      if (result.success) {
        // Update local state immediately for better UX
        setAddresses(prev => 
          prev.map(addr => 
            addr._id === editingAddress.id 
              ? { ...addr, ...editedData }
              : addr
          )
        );
        
        // Refresh addresses to get updated list
        await fetchAddresses();
        
        alert('Address updated successfully!');
        console.log('✅ Address updated successfully');
      } else {
        throw new Error(result.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('❌ Error updating address:', error);
      
      let errorMessage = 'Failed to update address';
      
      if (error.customMessage) {
        errorMessage = error.customMessage;
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please login again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Address not found.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid data. Please check all fields.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      alert(errorMessage);
    }
  }, [editingAddress, fetchAddresses]);

  const handleSelectDeliveryAddress = useCallback(async (addressId) => {
    // Prevent multiple rapid selections
    if (animatingAddressId === addressId) return;
    
    try {
      // Trigger haptic feedback for selection
      triggerMediumHaptic();
      
      // Set animating state
      setAnimatingAddressId(addressId);
      
      // Animate selection with smooth scale
      Animated.sequence([
        Animated.timing(selectedAddressScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(selectedAddressScale, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(selectedAddressScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // First set local state for immediate UI update
      setSelectedDeliveryAddressId(addressId);
      
      // Use AddressService to set as default address
      const result = await AddressService.setDefaultAddress(addressId);
      
      if (result.success) {
        // Success haptic
        triggerWaterDropletHaptic();
        
        // Refresh addresses to get updated default status
        await fetchAddresses();
        alert('Address set as default successfully!');
        console.log('✅ Address set as default successfully');
      } else {
        throw new Error(result.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('❌ Error setting default address:', error);
      
      let errorMessage = 'Failed to set default address';
      
      if (error.customMessage) {
        errorMessage = error.customMessage;
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please login again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Address not found.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      alert(errorMessage);
      
      // Revert selection if API call failed
      const defaultAddr = additionalAddresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedDeliveryAddressId(defaultAddr.id);
      }
    } finally {
      // Clear animating state
      setAnimatingAddressId(null);
    }
  }, [additionalAddresses, fetchAddresses, animatingAddressId]);

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
                  onPress={handleRefetchLocation}
                >
                  {/* Icon */}
                  <View style={styles.locationIconWrap}>
                    {locationLoading ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <AddressIcon width={34} height={34} />
                    )}
                  </View>

                  {/* Address text */}
                  <Text
                    style={styles.currentLocationText}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {locationLoading ? 'Getting location...' : 
                     locationError ? 'Location error' :
                     formattedAddress || 'Tap to get location'}
                  </Text>
                </Pressable>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* ADDITIONAL ADDRESSES SECTION */}
              <View style={styles.additionalAddressesSection}>
                {loadingAddresses ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#000" />
                    <Text style={styles.loadingText}>Loading addresses...</Text>
                  </View>
                ) : addressesError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{addressesError}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchAddresses}>
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : additionalAddresses.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No saved addresses</Text>
                  </View>
                ) : (
                  additionalAddresses.map((address) => (
                    <View key={address.id} style={[
                      styles.addressContainer,
                      selectedDeliveryAddressId === address.id && styles.selectedAddressContainer
                    ]}>
                      <View style={styles.addressLine}>
                        <View style={styles.addressTextWrapper}>
                          <Text style={styles.addressText}>{address.street}</Text>
                          <Text style={styles.addressText}>{address.cityStateZip}</Text>
                          <Text style={styles.phoneText}>{address.phone}</Text>
                        </View>
                        <View style={styles.iconRow}>
                          <Pressable onPress={() => handleRemoveAddress(address.id)} style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.7 : 1 }]}>
                            <DeleteIcon width={15} height={17} />
                          </Pressable>
                          <Pressable style={[styles.editIcon, ({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })]} onPress={() => handleEditAddress(address)}>
                            <EditIcon width={16} height={16} />
                          </Pressable>
                        </View>
                      </View>
                      
                      <Pressable
                        style={({ pressed }) => [
                          styles.deliveryButton,
                          selectedDeliveryAddressId === address.id && styles.deliveryButtonSelected,
                          pressed && { opacity: 0.8 },
                        ]}
                        onPress={() => handleSelectDeliveryAddress(address.id)}
                      >
                        <Animated.View style={{
                          transform: [{ scale: selectedDeliveryAddressId === address.id ? selectedAddressScale : 1 }]
                        }}>
                          <Text style={[styles.deliveryButtonText, selectedDeliveryAddressId === address.id && styles.deliveryButtonTextSelected]}>
                            {selectedDeliveryAddressId === address.id ? 'SELECTED AS DELIVERY ADDRESS' : 'SET AS DELIVERY ADDRESS'}
                          </Text>
                        </Animated.View>
                      </Pressable>
                    
                      
                      {/* Thin separator below each address */}
                      <View style={styles.addressSeparator} />
                    </View>
                  ))
                )}
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
                      maxLength={6}
                    />
                  </View>
                </View>

                {/* Country */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    value="India"
                    editable={false}
                    placeholder="Country"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Address Type */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    value={formData.addressType}
                    onChangeText={(value) => handleInputChange('addressType', value)}
                    placeholder="Address Type (e.g., HOME, WORK, OTHER)"
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                  />
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

                {/* Add New Address Button */}
                <TouchableOpacity style={styles.addNewAddressBtn} onPress={handleConfirmAddress}>
                  <Text style={styles.addNewAddressBtnText}>ADD NEW ADDRESS</Text>
                </TouchableOpacity>
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
          onSave={async (editedData) => {
            await handleSaveEditedAddress(editedData);
            setShowEditOverlay(false);
            setEditingAddress(null);
          }}
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
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  addressTextWrapper: {
    flex: 1,
    marginRight: 10,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  editIcon: {
    padding: 4,
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
    marginBottom: 8,
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
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedAddressContainer: {
    backgroundColor: '#f8fdfeff',
    borderColor: '#eef2f5ff',
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
  // Add New Address Button Styles
  addNewAddressBtn: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  addNewAddressBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Loading and error states
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default AddAddressScreen;