import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  latitude: null,
  longitude: null,
  accuracy: null,
  pincode: null,
  city: null,
  state: null,
  country: null,
  formattedAddress: null,
  road: null,
  houseNumber: null,
  loading: false,
  error: null,
  permissionGranted: null,
  lastUpdated: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setLocationSuccess: (state, action) => {
      state.loading = false;
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.accuracy = action.payload.accuracy;
      state.pincode = action.payload.pincode;
      state.city = action.payload.city;
      state.state = action.payload.state;
      state.country = action.payload.country;
      state.formattedAddress = action.payload.formattedAddress;
      state.road = action.payload.road;
      state.houseNumber = action.payload.houseNumber;
      state.permissionGranted = true;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },
    setLocationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.permissionGranted = false;
    },
    setPermissionStatus: (state, action) => {
      state.permissionGranted = action.payload;
    },
    clearLocationError: (state) => {
      state.error = null;
    },
    updateLocation: (state, action) => {
      return {
        ...state,
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
    },
    resetLocation: (state) => {
      return {
        ...initialState,
        permissionGranted: state.permissionGranted, // Keep permission status
      };
    },
  },
});

export const {
  setLocationStart,
  setLocationSuccess,
  setLocationFailure,
  setPermissionStatus,
  clearLocationError,
  updateLocation,
  resetLocation,
} = locationSlice.actions;

export default locationSlice.reducer;
