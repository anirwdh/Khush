import apiClient from './api/apiClient.production';

export const getItemsByCategory = async (categoryId, pincode, filters = {}) => {
  console.log('getItemsByCategory called with:', { categoryId, pincode, filters });
  console.log('🔍 DEBUG - Raw filters object:', JSON.stringify(filters, null, 2));
  
  // Debug filter structure
  if (filters && Object.keys(filters).length > 0) {
    console.log('📊 Filter breakdown:');
    Object.keys(filters).forEach(key => {
      const values = filters[key];
      console.log(`  - ${key}:`, values, `(type: ${typeof values}, length: ${Array.isArray(values) ? values.length : 'N/A'})`);
      if (Array.isArray(values)) {
        values.forEach((value, index) => {
          console.log(`    [${index}]: "${value}" (type: ${typeof value})`);
        });
      }
    });
  } else {
    console.log('📊 No filters provided or empty filters object');
  }
  
  try {
    let url = `/items/search`;
    const params = new URLSearchParams();
    
    if (pincode) {
      params.append('pinCode', pincode);
    }
    if (categoryId) {
      params.append('categoryId', categoryId);
    }
    
    // Add filters as JSON string if provided
    if (filters && Object.keys(filters).length > 0) {
      console.log('🚀 Sending filters to backend (getItemsByCategory):', JSON.stringify(filters));
      params.append('filters', JSON.stringify(filters));
    }
    
    url += `?${params.toString()}`;
    
    console.log('🌐 Final API URL:', url);
    
    const response = await apiClient.get(url);
    
    // Validate response structure
    if (!response) {
      console.error('❌ No response received from API');
      throw new Error('No response received from API');
    }
    
    if (!response.data) {
      console.error('❌ No data in response:', response);
      throw new Error('No data received from API');
    }
    
    // Log response for debugging
    console.log('📦 API Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error in getItemsByCategory:', error);
    // Return a safe default response instead of throwing
    return {
      success: false,
      message: error.message || 'Failed to fetch items',
      data: {
        items: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      }
    };
  }
};

export const searchItemsBySubcategory = async (subcategoryId, pincode, page = 1, limit = 10, filters = {}) => {
  console.log('searchItemsBySubcategory called with:', { subcategoryId, pincode, page, limit, filters });
  console.log('🔍 DEBUG - Raw filters object:', JSON.stringify(filters, null, 2));
  
  // Debug filter structure
  if (filters && Object.keys(filters).length > 0) {
    console.log('📊 Filter breakdown:');
    Object.keys(filters).forEach(key => {
      const values = filters[key];
      console.log(`  - ${key}:`, values, `(type: ${typeof values}, length: ${Array.isArray(values) ? values.length : 'N/A'})`);
      if (Array.isArray(values)) {
        values.forEach((value, index) => {
          console.log(`    [${index}]: "${value}" (type: ${typeof value})`);
        });
      }
    });
  } else {
    console.log('📊 No filters provided or empty filters object');
  }
  
  try {
    let url = `/items/search`;
    const params = new URLSearchParams();
    
    if (pincode) {
      params.append('pinCode', pincode);
    }
    if (subcategoryId) {
      params.append('subcategoryId', subcategoryId);
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    // Add filters as JSON string if provided
    if (filters && Object.keys(filters).length > 0) {
      console.log('🚀 Sending filters to backend (searchItemsBySubcategory):', JSON.stringify(filters));
      params.append('filters', JSON.stringify(filters));
    }
    
    url += `?${params.toString()}`;
    
    console.log('🌐 Final API URL for subcategory search:', url);
    
    const response = await apiClient.get(url);
    
    // Validate response structure
    if (!response) {
      console.error('❌ No response received from API');
      throw new Error('No response received from API');
    }
    
    if (!response.data) {
      console.error('❌ No data in response:', response);
      throw new Error('No data received from API');
    }
    
    // Log response for debugging
    console.log('API Response for subcategory search:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error in searchItemsBySubcategory:', error);
    // Return a safe default response instead of throwing
    return {
      success: false,
      message: error.message || 'Failed to fetch items',
      data: {
        items: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      }
    };
  }
};

export const searchItems = async (searchQuery, pincode, page = 1, limit = 10, filters = {}) => {
  console.log('searchItems called with:', { searchQuery, pincode, page, limit, filters });
  console.log('🔍 DEBUG - Raw filters object:', JSON.stringify(filters, null, 2));
  
  // Debug filter structure
  if (filters && Object.keys(filters).length > 0) {
    console.log('📊 Filter breakdown:');
    Object.keys(filters).forEach(key => {
      const values = filters[key];
      console.log(`  - ${key}:`, values, `(type: ${typeof values}, length: ${Array.isArray(values) ? values.length : 'N/A'})`);
      if (Array.isArray(values)) {
        values.forEach((value, index) => {
          console.log(`    [${index}]: "${value}" (type: ${typeof value})`);
        });
      }
    });
  } else {
    console.log('📊 No filters provided or empty filters object');
  }
  
  try {
    let url = `/items/search`;
    const params = new URLSearchParams();
    
    if (pincode) {
      params.append('pinCode', pincode);
    }
    if (searchQuery && searchQuery.trim()) {
      params.append('keyword', searchQuery.trim());
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    // Add filters as JSON string if provided
    if (filters && Object.keys(filters).length > 0) {
      console.log('🚀 Sending filters to backend (searchItems):', JSON.stringify(filters));
      params.append('filters', JSON.stringify(filters));
    }
    
    url += `?${params.toString()}`;
    
    console.log('🌐 Final API URL for search:', url);
    
    const response = await apiClient.get(url);
    
    // Validate response structure
    if (!response) {
      console.error('❌ No response received from API');
      throw new Error('No response received from API');
    }
    
    if (!response.data) {
      console.error('❌ No data in response:', response);
      throw new Error('No data received from API');
    }
    
    // Log response for debugging
    console.log('📦 API Response for search:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error in searchItems:', error);
    // Return a safe default response instead of throwing
    return {
      success: false,
      message: error.message || 'Failed to search items',
      data: {
        items: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      }
    };
  }
};

export const getItemById = async (itemId) => {
  console.log('getItemById called with:', { itemId });
  
  try {
    const response = await apiClient.get(`/items/single/${itemId}`);
    
    // Validate response structure
    if (!response) {
      console.error('No response received from API');
      throw new Error('No response received from API');
    }
    
    if (!response.data) {
      console.error('No data in response:', response);
      throw new Error('No data received from API');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error in getItemById:', error);
    // Return a safe default response instead of throwing
    return {
      success: false,
      message: error.message || 'Failed to fetch item',
      data: null
    };
  }
};
