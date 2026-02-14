import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Dimensions, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import BackIcon from '../assets/Icons/BackIcon.jsx';

const { width, height } = Dimensions.get('window');

const EditAddressOverlay = ({ visible, onClose, onSave, address }) => {
  const scrollRef = useRef(null);
  const [formData, setFormData] = useState({
    name: address?.name || '',
    address: address?.address || '',
    city: address?.city || '',
    state: address?.state || '',
    pinCode: address?.pinCode || '',
    phone: address?.phone || '',
  });

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSave = useCallback(() => {
    onSave(formData);
    onClose();
  }, [formData, onSave, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} 
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onClose}
            activeOpacity={0.8}
          >
            <BackIcon width={26} height={26} />
          </TouchableOpacity>
          
          <Text style={styles.title}>EDIT ADDRESS</Text>
        </View>

        {/* Form Content */}
        <ScrollView 
          ref={scrollRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
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
              onFocus={() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              }}
            />
          </View>
        </View>
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>SAVE ADDRESS</Text>
          </TouchableOpacity>
        </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
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
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginRight: 40, // to center it accounting for back button
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  formContainer: {
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 15,
    paddingVertical: 10,
  },
  rowInputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
  },
  halfInput: {
    width: '48%',
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default EditAddressOverlay;