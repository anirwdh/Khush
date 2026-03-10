import apiClient from './api/apiClient.production';

export const getFeaturedVideos = async ({ page = 'bottom' }) => {
  const response = await apiClient.get(
    `/featuredImages/get-all?page=${page}`
  );
  return response.data.data.data;
};
