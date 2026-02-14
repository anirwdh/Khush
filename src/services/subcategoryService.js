import apiClient from './api/apiClient.production';

export const getSubcategories = async ({ categoryId, page = 1, limit = 20 }) => {
  const response = await apiClient.get(
    `/subcategories/getAll/${categoryId}?isActive=true&page=${page}&limit=${limit}`
  );
  return response.data.data;
};

export const getCategories = async ({ page = 1, limit = 10 }) => {
  const response = await apiClient.get(
    `/categories/getAll?isActive=true&page=${page}&limit=${limit}`
  );
  return response.data.data;
};
