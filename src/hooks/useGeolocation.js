import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import geolocationService from '../services/geolocationService';
import {
  setLocationStart,
  setLocationSuccess,
  setLocationFailure,
  setPermissionStatus,
} from '../redux/slices/locationSlice';

export const useGeolocation = () => {
  const dispatch = useDispatch();
  const { loading, error, permissionGranted, pincode, formattedAddress } = useSelector(
    (state) => state.location
  );

  const requestLocation = useCallback(async () => {
    try {
      dispatch(setLocationStart());
      const locationData = await geolocationService.getLocationWithAddress();
      dispatch(setLocationSuccess(locationData));
      return locationData;
    } catch (error) {
      dispatch(setLocationFailure(error.message));
      throw error;
    }
  }, [dispatch]);

  const handlePermissionRequest = useCallback(
    async (granted) => {
      dispatch(setPermissionStatus(granted));
      if (granted) {
        await requestLocation();
      }
    },
    [dispatch, requestLocation]
  );

  const requestLocationPermission = useCallback(() => {
    geolocationService.showLocationPermissionAlert(handlePermissionRequest);
  }, [handlePermissionRequest]);

  return {
    loading,
    error,
    permissionGranted,
    pincode,
    formattedAddress,
    requestLocation,
    requestLocationPermission,
  };
};
