import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // UI State
  loading: false,
  refreshing: false,
  
  // Theme
  theme: 'light', // 'light' | 'dark' | 'auto'
  
  // Network
  isOnline: true,
  lastSyncTime: null,
  
  // Modals
  modals: {
    cart: false,
    filters: false,
    search: false,
  },
  
  // Navigation
  activeTab: 'home',
  
  // Notifications
  notifications: [],
  
  // Errors
  globalError: null,
  
  // App State
  appState: 'active', // 'active' | 'background' | 'inactive'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
    
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    
    updateLastSync: (state) => {
      state.lastSyncTime = new Date().toISOString();
    },
    
    openModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = true;
      }
    },
    
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = false;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
    },
    
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    
    setAppState: (state, action) => {
      state.appState = action.payload;
    },
  },
});

export const {
  setLoading,
  setRefreshing,
  setTheme,
  setOnlineStatus,
  updateLastSync,
  openModal,
  closeModal,
  closeAllModals,
  setActiveTab,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalError,
  clearGlobalError,
  setAppState,
} = uiSlice.actions;

export default uiSlice.reducer;
