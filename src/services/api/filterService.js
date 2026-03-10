import apiClient from './apiClient';
import { createApiSuccessResponse, createApiErrorResponse } from '../../utils/apiHelpers';

export const filterService = {
  getAllFilters: async (params = {}) => {
    try {
      const response = await apiClient.get('/filters/all', { params });
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  getFiltersByCategory: async (categoryId) => {
    try {
      const response = await apiClient.get(`/filters/category/${categoryId}`);
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  getFilterByKey: async (filterKey) => {
    try {
      const response = await apiClient.get(`/filters/${filterKey}`);
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  },

  applyFilters: async (filters) => {
    try {
      const response = await apiClient.post('/filters/apply', { filters });
      return createApiSuccessResponse(response.data);
    } catch (error) {
      return createApiErrorResponse(error);
    }
  }
};
