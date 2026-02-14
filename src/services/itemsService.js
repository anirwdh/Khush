import apiClient from './api/apiClient.production';

export const getItemsByCategory = async (categoryId, pincode) => {
  console.log('getItemsByCategory called with:', { categoryId, pincode });
  
  let url = `/items/search`;
  const params = new URLSearchParams();
  
  if (pincode) {
    params.append('pinCode', pincode);
  }
  if (categoryId) {
    params.append('categoryId', categoryId);
  }
  
  url += `?${params.toString()}`;
  
  console.log('Final API URL:', url);
  
  const response = await apiClient.get(url);
  return response.data;
};

export const getItemById = async (itemId) => {
  console.log('getItemById called with:', { itemId });
  
  const response = await apiClient.get(`/items/single/${itemId}`);
  return response.data;
};
