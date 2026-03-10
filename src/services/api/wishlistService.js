import apiClient from './apiClient.production';
import { createApiSuccessResponse, createApiErrorResponse } from '../../utils/apiHelpers';

export const wishlistService = {
  // Get all wishlist product IDs
  getWishlistIds: async () => {
    try {
      const response = await apiClient.get('/wishlist/ids');
      return createApiSuccessResponse(response.data, 'Wishlist IDs fetched successfully');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  // Get all wishlist items with product details
  getWishlistItems: async (pincode, page = 1, limit = 9) => {
    try {
      const queryParams = new URLSearchParams();
      if (pincode) queryParams.append('pincode', pincode);
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      const response = await apiClient.get(`/wishlist/items?${queryParams.toString()}`);
      return createApiSuccessResponse(response.data, 'Wishlist items fetched successfully');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  // Toggle wishlist status for a product
  toggleWishlist: async (itemId) => {
    try {
      const response = await apiClient.post('/wishlist/toggle', { itemId });
      return createApiSuccessResponse(response.data, 'Wishlist toggled successfully');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  }
};
