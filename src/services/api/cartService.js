import apiClient from './apiClient';
import { API_CONFIG } from '../../config/api.config';
import { createApiSuccessResponse, createApiErrorResponse, buildUrl } from '../../utils/apiHelpers';

export const cartService = {
  getCart: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CART.GET);
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CART.ADD, {
        productId,
        quantity
      });
      return createApiSuccessResponse(response.data, 'Product added to cart');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  updateCartItem: async (itemId, quantity) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.CART.UPDATE, { id: itemId });
      const response = await apiClient.put(url, {
        quantity
      });
      return createApiSuccessResponse(response.data, 'Cart updated');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  removeFromCart: async (itemId) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.CART.REMOVE, { id: itemId });
      const response = await apiClient.delete(url);
      return createApiSuccessResponse(response.data, 'Product removed from cart');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  clearCart: async () => {
    try {
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.CART.CLEAR);
      return createApiSuccessResponse(response.data, 'Cart cleared');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  applyCoupon: async (couponCode) => {
    try {
      const response = await apiClient.post('/cart/apply-coupon', {
        couponCode
      });
      return createApiSuccessResponse(response.data, 'Coupon applied');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  }
};
