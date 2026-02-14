import apiClient from './api/apiClient.production';

export const getFeaturedImages = async ({ page = 'lock' }) => {
  const response = await apiClient.get(
    `/featuredImages/get-all?page=${page}`
  );
  return response.data.data;
};
