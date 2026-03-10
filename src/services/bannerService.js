import apiClient from './api/apiClient.production';
import { createApiSuccessResponse, createApiErrorResponse } from '../utils/apiHelpers';

export const bannerService = {
  getAllBanners: async (page = 1, limit = 10, isActive = true) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      queryParams.append('isActive', isActive);
      
      const response = await apiClient.get(`/banner/getAll?${queryParams.toString()}`);
      return createApiSuccessResponse(response.data, 'Banners fetched successfully');
    } catch (error) {
      return createApiErrorResponse(error);
    }
  }
};
