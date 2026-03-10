import apiClient from './apiClient.production';
import { createApiSuccessResponse, createApiErrorResponse } from '../../utils/apiHelpers';

export const searchKeywordsService = {
  // Track search keyword
  trackSearch: async (keyword) => {
    try {
      const response = await apiClient.post('/search-keywords/track', { keyword });
      return createApiSuccessResponse(response.data, 'Search keyword tracked');
    } catch (error) {
      console.error('Track search error:', error);
      return createApiErrorResponse(error);
    }
  },

  // Get recent searches for authenticated user
  getRecentSearches: async (limit = 10) => {
    try {
      const response = await apiClient.get('/search-keywords/recent', {
        params: { limit }
      });
      return createApiSuccessResponse(response.data, 'Recent searches fetched');
    } catch (error) {
      console.error('Get recent searches error:', error);
      return createApiErrorResponse(error);
    }
  },

  // Get popular searches
  getPopularSearches: async (limit = 10, timeRange = 'all') => {
    try {
      const response = await apiClient.get('/search-keywords/popular', {
        params: { limit, timeRange }
      });
      return createApiSuccessResponse(response.data, 'Popular searches fetched');
    } catch (error) {
      console.error('Get popular searches error:', error);
      return createApiErrorResponse(error);
    }
  },

  // Clear all recent searches for authenticated user
  clearRecentSearches: async () => {
    try {
      const response = await apiClient.delete('/search-keywords/recent');
      return createApiSuccessResponse(response.data, 'Recent searches cleared');
    } catch (error) {
      console.error('Clear recent searches error:', error);
      return createApiErrorResponse(error);
    }
  },

  // Delete specific search keyword for authenticated user
  deleteSearch: async (keyword) => {
    try {
      const response = await apiClient.delete(`/search-keywords/${encodeURIComponent(keyword)}`);
      return createApiSuccessResponse(response.data, 'Search keyword removed');
    } catch (error) {
      console.error('Delete search error:', error);
      return createApiErrorResponse(error);
    }
  }
};
