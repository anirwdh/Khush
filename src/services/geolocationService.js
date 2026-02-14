import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

class GeolocationService {
  constructor() {
    this.OSM_REVERSE_GEOCODING_URL = 'https://nominatim.openstreetmap.org/reverse';
  }

  // Request location permission for Android
  async requestAndroidLocationPermission() {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Access Required',
          message: 'This app needs to access your location to show relevant content',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  }

  // Get current position with error handling
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      };

      Geolocation.getCurrentPosition(
        async (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let errorMessage = 'Unable to fetch location';
          
          switch (error.code) {
            case 1:
              errorMessage = 'Location permission denied. Please enable location access in settings.';
              break;
            case 2:
              errorMessage = 'Location unavailable. Please check your GPS settings.';
              break;
            case 3:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = error.message;
          }
          
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  // Reverse geocoding using OpenStreetMap Nominatim API
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await axios.get(this.OSM_REVERSE_GEOCODING_URL, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
          zoom: 18,
        },
        headers: {
          'User-Agent': 'KhushApp/1.0', // Required by Nominatim usage policy
        },
        timeout: 10000,
      });

      if (response.data && response.data.address) {
        const address = response.data.address;
        return {
          formattedAddress: response.data.display_name || '',
          pincode: address.postcode || '',
          city: address.city || address.town || address.village || '',
          state: address.state || '',
          country: address.country || '',
          road: address.road || '',
          houseNumber: address.house_number || '',
          raw: response.data,
        };
      }
      
      throw new Error('No address data found');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to get address from coordinates');
    }
  }

  // Complete flow: get location and reverse geocode
  async getLocationWithAddress() {
    try {
      // Request permission if needed
      if (Platform.OS === 'android') {
        const hasPermission = await this.requestAndroidLocationPermission();
        if (!hasPermission) {
          throw new Error('Location permission is required');
        }
      }

      // Get current position
      const position = await this.getCurrentPosition();
      
      // Reverse geocode to get address
      const address = await this.reverseGeocode(position.latitude, position.longitude);
      
      return {
        ...position,
        ...address,
      };
    } catch (error) {
      console.error('Get location with address error:', error);
      throw error;
    }
  }

  // Show location permission alert
  showLocationPermissionAlert(callback) {
    Alert.alert(
      'Location Access Required',
      'This app needs location access to provide personalized content and services. Please enable location access in your device settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => callback(false),
        },
        {
          text: 'Enable',
          onPress: () => callback(true),
        },
      ]
    );
  }
}

export default new GeolocationService();
