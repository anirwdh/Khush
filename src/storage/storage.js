import AsyncStorage from '@react-native-async-storage/async-storage';

// Create AsyncStorage instance
const storage = AsyncStorage;

// Fallback in-memory storage for development with remote debugger
const memoryStorage = {
  data: {},
  set(key, value) {
    this.data[key] = value;
  },
  getString(key) {
    return this.data[key] || null;
  },
  delete(key) {
    delete this.data[key];
  },
  clearAll() {
    this.data = {};
  }
};

// Check if we're in development with remote debugger
const isRemoteDebugger = typeof window !== 'undefined' && window.__DEV__;
const isHermes = typeof global !== 'undefined' && global.HermesInternal;

// Only initialize storage if not using remote debugger
const isStorageAvailable = !isRemoteDebugger || isHermes;

// AsyncStorage-based storage service
export const storageService = {
  // Token management
  setToken: async (token) => {
    if (isStorageAvailable) {
      try {
        await storage.setItem('khush_token', token);
        console.log('✅ Token stored in AsyncStorage');
      } catch (error) {
        console.error('❌ Error storing token:', error);
      }
    } else {
      memoryStorage.set('khush_token', token);
    }
  },
  
  getToken: async () => {
    if (isStorageAvailable) {
      try {
        const token = await storage.getItem('khush_token');
        console.log('🔍 Token retrieved from AsyncStorage:', !!token);
        return token;
      } catch (error) {
        console.error('❌ Error retrieving token:', error);
        return null;
      }
    } else {
      return memoryStorage.getString('khush_token');
    }
  },
  
  removeToken: async () => {
    if (isStorageAvailable) {
      try {
        await storage.removeItem('khush_token');
        console.log('✅ Token removed from AsyncStorage');
      } catch (error) {
        console.error('❌ Error removing token:', error);
      }
    } else {
      memoryStorage.delete('khush_token');
    }
  },
  
  // User data
  setUser: async (user) => {
    if (isStorageAvailable) {
      try {
        const userStr = JSON.stringify(user);
        await storage.setItem('khush_user', userStr);
        console.log('✅ User stored in AsyncStorage');
      } catch (error) {
        console.error('❌ Error storing user:', error);
      }
    } else {
      const userStr = JSON.stringify(user);
      memoryStorage.set('khush_user', userStr);
    }
  },
  
  getUser: async () => {
    if (isStorageAvailable) {
      try {
        const userStr = await storage.getItem('khush_user');
        const user = userStr ? JSON.parse(userStr) : null;
        console.log('🔍 User retrieved from AsyncStorage:', !!user);
        return user;
      } catch (error) {
        console.error('❌ Error retrieving user:', error);
        return null;
      }
    } else {
      const userStr = memoryStorage.getString('khush_user');
      try {
        return userStr ? JSON.parse(userStr) : null;
      } catch {
        return null;
      }
    }
  },
  
  removeUser: async () => {
    if (isStorageAvailable) {
      try {
        await storage.removeItem('khush_user');
        console.log('✅ User removed from AsyncStorage');
      } catch (error) {
        console.error('❌ Error removing user:', error);
      }
    } else {
      memoryStorage.delete('khush_user');
    }
  },
  
  // Generic storage methods
  setItem: async (key, value) => {
    if (isStorageAvailable) {
      try {
        const processedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        await storage.setItem(`khush_${key}`, processedValue);
        console.log('✅ Item stored in AsyncStorage:', key);
      } catch (error) {
        console.error('❌ Error storing item:', error);
      }
    } else {
      const processedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      memoryStorage.set(`khush_${key}`, processedValue);
    }
  },
  
  getItem: async (key) => {
    if (isStorageAvailable) {
      try {
        const value = await storage.getItem(`khush_${key}`);
        if (value && (value.startsWith('{') || value.startsWith('['))) {
          return JSON.parse(value);
        }
        console.log('🔍 Item retrieved from AsyncStorage:', key, !!value);
        return value;
      } catch (error) {
        console.error('❌ Error retrieving item:', error);
        return null;
      }
    } else {
      const value = memoryStorage.getString(`khush_${key}`);
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
  },
  
  removeItem: async (key) => {
    if (isStorageAvailable) {
      try {
        await storage.removeItem(`khush_${key}`);
        console.log('✅ Item removed from AsyncStorage:', key);
      } catch (error) {
        console.error('❌ Error removing item:', error);
      }
    } else {
      memoryStorage.delete(`khush_${key}`);
    }
  },
  
  clearAll: async () => {
    if (isStorageAvailable) {
      try {
        const keys = await storage.getAllKeys();
        const khushKeys = keys.filter(key => key.startsWith('khush_'));
        await storage.multiRemove(khushKeys);
        console.log('✅ All khush items cleared from AsyncStorage');
      } catch (error) {
        console.error('❌ Error clearing storage:', error);
      }
    } else {
      memoryStorage.clearAll();
    }
  },
  
  // Address sync management
  setAddressSyncedId: async (addressId) => {
    if (isStorageAvailable) {
      try {
        await storage.setItem('khush_address_synced', addressId);
        console.log('✅ Address sync ID stored:', addressId);
      } catch (error) {
        console.error('❌ Error storing address sync ID:', error);
      }
    } else {
      memoryStorage.set('khush_address_synced', addressId);
    }
  },
  
  getAddressSyncedId: async () => {
    if (isStorageAvailable) {
      try {
        const addressId = await storage.getItem('khush_address_synced');
        console.log('🔍 Address sync ID:', addressId);
        return addressId;
      } catch (error) {
        console.error('❌ Error getting address sync ID:', error);
        return null;
      }
    } else {
      return memoryStorage.getString('khush_address_synced');
    }
  },
  
  clearAddressSyncedId: async () => {
    if (isStorageAvailable) {
      try {
        await storage.removeItem('khush_address_synced');
        console.log('✅ Address sync ID cleared');
      } catch (error) {
        console.error('❌ Error clearing address sync ID:', error);
      }
    } else {
      memoryStorage.delete('khush_address_synced');
    }
  },

  // Legacy methods for backward compatibility
  setAddressSynced: async (synced) => {
    if (synced) {
      console.warn('⚠️ setAddressSynced is deprecated, use setAddressSyncedId instead');
    }
  },
  
  isAddressSynced: async () => {
    try {
      const addressId = await this.getAddressSyncedId();
      return !!addressId;
    } catch (error) {
      console.error('❌ Error checking address sync status:', error);
      return false;
    }
  },
  
  clearAddressSynced: async () => {
    console.warn('⚠️ clearAddressSynced is deprecated, use clearAddressSyncedId instead');
    await this.clearAddressSyncedId();
  },

  // Debug method
  debugStorage: async () => {
    if (isStorageAvailable) {
      try {
        const keys = await storage.getAllKeys();
        const khushKeys = keys.filter(key => key.startsWith('khush_'));
        console.log('🔍 AsyncStorage khush keys:', khushKeys);
        for (const key of khushKeys) {
          const value = await storage.getItem(key);
          console.log(`🔍 ${key}:`, value ? 'EXISTS' : 'NULL');
        }
      } catch (error) {
        console.error('🔍 Error debugging storage:', error);
      }
    } else {
      const keys = Object.keys(memoryStorage.data).filter(key => key.startsWith('khush_'));
      console.log('🔍 MemoryStorage khush keys:', keys);
      for (const key of keys) {
        console.log(`🔍 ${key}:`, memoryStorage.data[key] ? 'EXISTS' : 'NULL');
      }
    }
  }
};

export default storageService;
