import apiClient from './api/apiClient';
import { storageService } from '../storage/storage';

// Sync lock to prevent multiple simultaneous calls
let isSyncing = false;

/**
 * Sync user address to backend for first-time login only
 * This function checks if address has been synced before and only calls API once
 */
export const addressSyncService = {
  /**
   * Sync address if it's the first time login
   * @param {Object} locationData - Location data with pinCode, city, state, latitude, longitude
   * @returns {Promise<boolean>} - Returns true if sync was successful or already synced
   */
  syncAddressIfFirstLogin: async (locationData) => {
    try {
      console.log('🏠 ADDRESS SYNC: Starting address sync check');
      
      // Prevent multiple simultaneous sync attempts
      if (isSyncing) {
        console.log('🏠 ADDRESS SYNC: Already syncing, skipping');
        return true;
      }

      // Check if address was already synced
      const syncedAddressId = await storageService.getAddressSyncedId();
      if (syncedAddressId) {
        console.log('✅ ADDRESS SYNC: Address already synced, ID:', syncedAddressId);
        return true;
      }

      // Validate location data
      if (!locationData || !locationData.pinCode) {
        console.warn('⚠️ ADDRESS SYNC: Invalid location data', locationData);
        return false;
      }

      // Get user data for name and phone
      const userData = await storageService.getUser();
      const userName = userData?.name || 'User';
      const userPhone = userData?.phoneNumber || userData?.phone || '';
      const userCountryCode = userData?.countryCode || '+91';

      console.log('🏠 ADDRESS SYNC: Creating address for first-time user');
      console.log('📍 Location data:', {
        pinCode: locationData.pinCode,
        city: locationData.city,
        state: locationData.state,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        userName: userName,
        userPhone: userPhone,
        userCountryCode: userCountryCode
      });

      // Set sync lock
      isSyncing = true;

      // Call address create API with exact structure
      const response = await apiClient.post('/address/create', {
        name: userName,
        phoneNumber: userPhone,
        countryCode: userCountryCode,
        addressLine: locationData.formattedAddress || `${locationData.city || 'Unknown'}, ${locationData.state || 'Unknown'} - ${locationData.pinCode}`,
        city: locationData.city || 'Unknown',
        state: locationData.state || 'Unknown',
        pinCode: locationData.pinCode,
        country: locationData.country || 'India',
        addressType: 'HOME',
        isDefault: true,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      });

      console.log('🏠 ADDRESS SYNC: API response:', response.data);

      if (response.data?.success && response.data?.data?._id) {
        // Store the address ID instead of boolean
        await storageService.setAddressSyncedId(response.data.data._id);
        console.log('✅ ADDRESS SYNC: Address created and stored ID:', response.data.data._id);
        return true;
      } else {
        console.error('❌ ADDRESS SYNC: API returned failure:', response.data?.message);
        return false;
      }

    } catch (error) {
      console.error('❌ ADDRESS SYNC: Error during address sync:', error);
      
      // Don't mark as synced on error, so it can retry next time
      return false;
    } finally {
      // Always release the sync lock
      isSyncing = false;
    }
  },

  /**
   * Reset address sync flag (for logout)
   */
  resetAddressSync: async () => {
    try {
      await storageService.clearAddressSyncedId();
      console.log('✅ ADDRESS SYNC: Sync ID cleared');
    } catch (error) {
      console.error('❌ ADDRESS SYNC: Error clearing sync ID:', error);
    }
  },

  /**
   * Check if address is already synced
   */
  isAddressSynced: async () => {
    try {
      const addressId = await storageService.getAddressSyncedId();
      return !!addressId;
    } catch (error) {
      console.error('❌ ADDRESS SYNC: Error checking sync status:', error);
      return false;
    }
  },

  /**
   * Get synced address ID
   */
  getSyncedAddressId: async () => {
    try {
      return await storageService.getAddressSyncedId();
    } catch (error) {
      console.error('❌ ADDRESS SYNC: Error getting sync ID:', error);
      return null;
    }
  }
};
