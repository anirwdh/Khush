import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

// Type declarations for global objects
declare const window: any;
declare const global: any;

// Fallback UUID generator for environments without crypto support
const generateFallbackUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Safe UUID generation with fallback
const safeUUIDv4 = (): string => {
  try {
    return uuidv4();
  } catch (error) {
    console.warn('UUID generation failed, using fallback:', error);
    return generateFallbackUUID();
  }
};

// Check if we're in development with remote debugger
const isRemoteDebugger = typeof window !== 'undefined' && window.__DEV__;
const isHermes = typeof global !== 'undefined' && global.HermesInternal;
const isStorageAvailable = !isRemoteDebugger || isHermes;

// Fallback in-memory storage for development with remote debugger
const memoryStorage = {
  data: {} as Record<string, string>,
  set(key: string, value: string) {
    this.data[key] = value;
  },
  getString(key: string): string | null {
    return this.data[key] || null;
  },
  delete(key: string) {
    delete this.data[key];
  }
};

const DEVICE_ID_KEY = 'khush_device_id';

export const getDeviceId = async (): Promise<string> => {
  let deviceId: string | null;
  
  if (isStorageAvailable) {
    try {
      deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    } catch (error) {
      console.error('Error getting device ID from AsyncStorage:', error);
      deviceId = memoryStorage.getString(DEVICE_ID_KEY);
    }
  } else {
    deviceId = memoryStorage.getString(DEVICE_ID_KEY);
  }

  if (!deviceId) {
    deviceId = `ios_${safeUUIDv4()}`;
    
    if (isStorageAvailable) {
      try {
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      } catch (error) {
        console.error('Error setting device ID in AsyncStorage:', error);
        memoryStorage.set(DEVICE_ID_KEY, deviceId);
      }
    } else {
      memoryStorage.set(DEVICE_ID_KEY, deviceId);
    }
  }

  return deviceId;
};
