import apiClient from './api/apiClient';

class AddressService {
  // Get all addresses
  static async getAllAddresses(page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`/address/getAll?page=${page}&limit=${limit}`);
      console.log('📦 Addresses API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      throw error;
    }
  }

  // Create new address
  static async createAddress(addressData) {
    try {
      const response = await apiClient.post('/address/create', addressData);
      console.log('📦 Create Address Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating address:', error);
      throw error;
    }
  }

  // Set address as default
  static async setDefaultAddress(addressId) {
    try {
      const response = await apiClient.patch(`/address/default/${addressId}`);
      console.log('📦 Set Default Address Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error setting default address:', error);
      throw error;
    }
  }

  // Update address
  static async updateAddress(addressId, addressData) {
    try {
      const response = await apiClient.patch(`/address/update/${addressId}`, addressData);
      console.log('📦 Update Address Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating address:', error);
      throw error;
    }
  }

  // Delete address
  static async deleteAddress(addressId) {
    try {
      // Use correct endpoint without /api prefix (BASE_URL already includes it): /address/delete/:id
      const response = await apiClient.delete(`/address/delete/${addressId}`);
      console.log('📦 Delete Address Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting address:', error);
      
      // If we get HTML response (404 with HTML), endpoint might not exist
      if (error.response?.status === 404) {
        console.log('🚨 Delete endpoint might not exist or server not configured for DELETE requests');
        throw new Error('Delete address feature not available. Please contact support.');
      }
      
      throw error;
    }
  }

  // Get address by ID
  static async getAddressById(addressId) {
    try {
      const response = await apiClient.get(`/address/${addressId}`);
      console.log('📦 Get Address Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting address:', error);
      throw error;
    }
  }
}

export default AddressService;
