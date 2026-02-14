import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authSlice from '../slices/authSlice';
import cartSlice from '../slices/cartSlice';
import productSlice from '../slices/productSlice';
import uiSlice from '../slices/uiSlice';
import locationSlice from '../slices/locationSlice';

// Persist configuration
const persistConfig = {
  key: 'khush',
  storage: AsyncStorage,
  whitelist: ['auth', 'cart', 'location'], // Persist auth, cart, and location slices
  debug: __DEV__,
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  cart: cartSlice,
  product: productSlice,
  ui: uiSlice,
  location: locationSlice,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export { persistedReducer, persistStore };
