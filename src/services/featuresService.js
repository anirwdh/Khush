import apiClient from './api/apiClient.production';
import { createApiSuccessResponse, createApiErrorResponse } from '../utils/apiHelpers';

export const featuresService = {
  getAllFeatures: async (page = 1, limit = 6) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      const response = await apiClient.get(`/features/getAll?${queryParams.toString()}`);
      return createApiSuccessResponse(response.data, 'Features fetched successfully');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  }
};
