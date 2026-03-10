import apiClient from './apiClient';

export const sectionsService = {
  /**
   * Get sections data
   * @param {Object} params - Query parameters
   * @param {string} params.pinCode - Pincode for location-based content
   * @param {number} params.page - Page number for pagination
   * @param {number} params.limit - Number of items per page
   * @param {boolean} params.isWeb - Always false for mobile app
   * @param {string} params.type - Section type (e.g., 'MANUAL')
   * @returns {Promise} API response
   */
  getSections: async (params = {}) => {
    const {
      pinCode,
      page = 1,
      limit = 5,
      isWeb = false,
      type = 'MANUAL'
    } = params;

    const queryParams = new URLSearchParams({
      pinCode,
      page: page.toString(),
      limit: limit.toString(),
      isWeb: isWeb.toString(),
      type
    });

    try {
      const response = await apiClient.get(`/sections/get?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  },

  /**
   * Get sections by type
   * @param {string} type - Section type
   * @param {Object} params - Additional parameters
   * @returns {Promise} API response
   */
  getSectionsByType: async (type, params = {}) => {
    return sectionsService.getSections({ ...params, type });
  },

  /**
   * Get manual sections (type: MANUAL)
   * @param {Object} params - Additional parameters
   * @returns {Promise} API response
   */
  getManualSections: async (params = {}) => {
    return sectionsService.getSectionsByType('MANUAL', params);
  },

  /**
   * Get automated sections (type: AUTOMATED)
   * @param {Object} params - Additional parameters
   * @returns {Promise} API response
   */
  getAutomatedSections: async (params = {}) => {
    return sectionsService.getSectionsByType('AUTOMATED', params);
  },

  /**
   * Get category sections (type: CATEGORY)
   * @param {Object} params - Additional parameters
   * @returns {Promise} API response
   */
  getCategorySections: async (params = {}) => {
    return sectionsService.getSectionsByType('CATEGORY', params);
  }
};
