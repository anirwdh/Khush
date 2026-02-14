import { API_CONFIG } from '../config/api.config';

export const handleApiError = (error) => {
  if (error.customMessage) {
    return error.customMessage;
  }
  
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case API_CONFIG.HTTP_STATUS.BAD_REQUEST:
        return data?.message || 'Invalid request. Please check your input.';
      case API_CONFIG.HTTP_STATUS.UNAUTHORIZED:
        return 'Authentication required. Please log in again.';
      case API_CONFIG.HTTP_STATUS.FORBIDDEN:
        return 'You do not have permission to perform this action.';
      case API_CONFIG.HTTP_STATUS.NOT_FOUND:
        return 'The requested resource was not found.';
      case API_CONFIG.HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'Server error. Please try again later.';
      default:
        return data?.message || `Request failed with status ${status}`;
    }
  }
  
  if (error.request) {
    return 'Network error. Please check your internet connection.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

export const createApiSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    data,
    message,
  };
};

export const createApiErrorResponse = (error, message = null) => {
  return {
    success: false,
    error: handleApiError(error),
    message: message || handleApiError(error),
  };
};

export const buildUrl = (endpoint, params = {}) => {
  let url = endpoint;
  
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url = url.replace(`:${key}`, encodeURIComponent(params[key]));
    }
  });
  
  return url;
};
