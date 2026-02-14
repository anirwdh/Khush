import apiClient from './apiClient.production';
import { API_CONFIG } from '../../config/api.config';
import { createApiSuccessResponse, createApiErrorResponse } from '../../utils/apiHelpers';

export const categoriesService = {
  // Get all categories with optional filters
  getAllCategories: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add default parameters
      if (params.isActive !== undefined) {
        queryParams.append('isActive', params.isActive);
      }
      if (params.page) {
        queryParams.append('page', params.page);
      }
      if (params.limit) {
        queryParams.append('limit', params.limit);
      }
      
      const endpoint = `${API_CONFIG.ENDPOINTS.CATEGORIES.GET_ALL}?${queryParams.toString()}`;
      const response = await apiClient.get(endpoint);
      
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  // Get subcategories by category ID
  getSubcategoriesByCategory: async (categoryId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add default parameters
      if (params.isActive !== undefined) {
        queryParams.append('isActive', params.isActive);
      }
      if (params.page) {
        queryParams.append('page', params.page);
      }
      if (params.limit) {
        queryParams.append('limit', params.limit);
      }
      
      const endpoint = `${API_CONFIG.ENDPOINTS.SUBCATEGORIES.GET_ALL}/${categoryId}?${queryParams.toString()}`;
      const response = await apiClient.get(endpoint);
      
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  }
};
