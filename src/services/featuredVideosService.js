import apiClient from './api/apiClient.production';

export const getFeaturedVideos = async ({ page = 'home' }) => {
  const response = await apiClient.get(
    `/featuredImages/get-all?page=${page}`
  );
  return response.data.data;
};
