import { addressSyncService } from '../services/addressSyncService';

/**
 * User Bootstrap Service
 * Handles all first-time user data synchronization after login
 * This keeps HomeScreen clean and makes the architecture scalable
 */

export const userBootstrap = {
  /**
   * Bootstrap user data after login
   * This function handles all the initial data sync for a newly logged-in user
   * @param {Object} locationData - User's location data
   * @returns {Promise<Object>} - Bootstrap results
   */
  bootstrapUser: async (locationData) => {
    console.log('🚀 USER BOOTSTRAP: Starting user data sync');
    
    const results = {
      addressSynced: false,
      addressId: null,
      errors: []
    };

    try {
      // 1. Sync address to backend (first-time login only)
      if (locationData && locationData.pinCode) {
        console.log('🏠 BOOTSTRAP: Syncing user address');
        const addressSyncResult = await addressSyncService.syncAddressIfFirstLogin(locationData);
        results.addressSynced = addressSyncResult;
        
        if (addressSyncResult) {
          results.addressId = await addressSyncService.getSyncedAddressId();
          console.log('✅ BOOTSTRAP: Address sync completed, ID:', results.addressId);
        } else {
          console.log('⚠️ BOOTSTRAP: Address sync failed or not needed');
        }
      } else {
        console.log('⚠️ BOOTSTRAP: No location data available, skipping address sync');
        results.errors.push('No location data available for address sync');
      }

      // Future bootstrap operations can be added here:
      // - Cart sync
      // - Wishlist sync  
      // - User preferences sync
      // - Payment methods sync
      
      console.log('✅ USER BOOTSTRAP: Completed successfully', results);
      return results;

    } catch (error) {
      console.error('❌ USER BOOTSTRAP: Error during bootstrap:', error);
      results.errors.push(error.message);
      return results;
    }
  },

  /**
   * Reset all bootstrap data (for logout)
   */
  resetBootstrap: async () => {
    console.log('🗑️ USER BOOTSTRAP: Resetting all bootstrap data');
    
    try {
      // Reset address sync
      await addressSyncService.resetAddressSync();
      
      // Future reset operations can be added here
      
      console.log('✅ USER BOOTSTRAP: Reset completed');
    } catch (error) {
      console.error('❌ USER BOOTSTRAP: Error during reset:', error);
    }
  },

  /**
   * Check if user is fully bootstrapped
   * @returns {Promise<Object>} - Bootstrap status
   */
  getBootstrapStatus: async () => {
    try {
      const addressSynced = await addressSyncService.isAddressSynced();
      const addressId = await addressSyncService.getSyncedAddressId();

      return {
        isBootstrapped: addressSynced,
        addressSynced,
        addressId,
        // Future status checks can be added here
      };
    } catch (error) {
      console.error('❌ USER BOOTSTRAP: Error getting status:', error);
      return {
        isBootstrapped: false,
        addressSynced: false,
        addressId: null,
        error: error.message
      };
    }
  }
};
