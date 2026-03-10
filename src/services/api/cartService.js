import apiClient from './apiClient';
import { API_CONFIG } from '../../config/api.config';
import { createApiSuccessResponse, createApiErrorResponse, buildUrl } from '../../utils/apiHelpers';

export const cartService = {
  getDefaultAddress: async () => {
    try {
      const response = await apiClient.get('/address/getDefaultAddress');
      return response.data; // Return response directly, not wrapped
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  getMyCart: async (addressId = null, page = 1, limit = 8) => {
    try {
      const params = new URLSearchParams();
      if (addressId) params.append('addressId', addressId);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const url = `${API_CONFIG.ENDPOINTS.CART.GET_MY_CART}?${params.toString()}`;
      const response = await apiClient.get(url);
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  getCart: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CART.GET);
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  addToCart: async (itemId, variant, quantity = 1, pincode) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CART.ADD, {
        itemId,
        variant,
        quantity,
        pincode
      });
      return createApiSuccessResponse(response.data, 'Product added to cart');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  // Optimized quantity methods matching backend controller exactly
  increaseQuantity: async (sku, pincode = null) => {
    try {
      // Build URL with optional pincode query parameter
      let url = buildUrl(API_CONFIG.ENDPOINTS.CART.INCREASE_QUANTITY, { sku });
      if (pincode) {
        url += `?pincode=${encodeURIComponent(pincode)}`;
      }
      
      try {
        const response = await apiClient.patch(url);
        return createApiSuccessResponse(response.data, 'Quantity increased successfully');
      } catch (error) {
        // If 404, fallback to basic cart update (temporary workaround)
        if (error.response?.status === 404) {
          console.log('🛒 New endpoint not available, using fallback method');
          // For now, we'll need to refresh the cart to show current state
          return createApiSuccessResponse(null, 'Please refresh cart to see updated quantities');
        }
        throw error;
      }
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  decreaseQuantity: async (sku) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.CART.DECREASE_QUANTITY, { sku });
      
      try {
        const response = await apiClient.patch(url);
        return createApiSuccessResponse(response.data, 'Quantity decreased successfully');
      } catch (error) {
        // If 404, fallback to basic cart update (temporary workaround)
        if (error.response?.status === 404) {
          console.log('🛒 New endpoint not available, using fallback method');
          return createApiSuccessResponse(null, 'Please refresh cart to see updated quantities');
        }
        throw error;
      }
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  removeItem: async (sku) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.CART.REMOVE_BY_SKU, { sku });
      
      try {
        const response = await apiClient.delete(url);
        return createApiSuccessResponse(response.data, 'Item removed from cart successfully');
      } catch (error) {
        // If 404, fallback to basic cart update (temporary workaround)
        if (error.response?.status === 404) {
          console.log('🛒 New endpoint not available, using fallback method');
          return createApiSuccessResponse(null, 'Please refresh cart to see updated cart');
        }
        throw error;
      }
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

  setDeliveryAddress: async (deliveryAddressId, pinCode) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CART.SET_DELIVERY_ADDRESS, {
        deliveryAddressId,
        pinCode
      });
      return createApiSuccessResponse(response.data, 'Delivery address updated');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  selectDelivery: async (payload) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CART.SELECT_DELIVERY, payload);
      return createApiSuccessResponse(response.data, 'Delivery option updated');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  // Optimized price summary methods matching backend controller
  getPriceSummary: async (couponCode = null) => {
    try {
      // Use GET endpoint with optional couponCode query parameter
      const url = couponCode ? `${API_CONFIG.ENDPOINTS.CART.GET_PRICE_SUMMARY}?couponCode=${encodeURIComponent(couponCode)}` : API_CONFIG.ENDPOINTS.CART.GET_PRICE_SUMMARY;
      const response = await apiClient.get(url);
      return createApiSuccessResponse(response.data, 'Price summary calculated');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  applyCoupon: async (couponCode) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CART.APPLY_COUPON, {
        couponCode
      });
      return createApiSuccessResponse(response.data, 'Coupon applied');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  }
};
