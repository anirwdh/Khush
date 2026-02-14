import apiClient from './apiClient';
import { API_CONFIG } from '../../config/api.config';
import { createApiSuccessResponse, createApiErrorResponse, buildUrl } from '../../utils/apiHelpers';

export const productService = {
  getAllProducts: async (params = {}) => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.PRODUCTS.GET_ALL, { params });
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  getProductById: async (productId) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS.GET_BY_ID, { id: productId });
      const response = await apiClient.get(url);
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  searchProducts: async (query, filters = {}) => {
    try {
      const response = await apiClient.get('/products/search', {
        params: { q: query, ...filters }
      });
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  getFeaturedProducts: async () => {
    try {
      const response = await apiClient.get('/products/featured');
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  getProductsByCategory: async (categoryId) => {
    try {
      const response = await apiClient.get(`/products/category/${categoryId}`);
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  }
};
