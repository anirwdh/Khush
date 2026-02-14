import { useState, useEffect } from 'react';
import { productService } from '../../services/api/productService';
import { useApi } from './useApi';

export const useProducts = (initialParams = {}) => {
  const [params, setParams] = useState(initialParams);
  
  const {
    data: products,
    loading,
    error,
    execute: fetchProducts
  } = useApi(() => productService.getAllProducts(params), [params]);

  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    updateParams,
    params
  };
};

export const useProduct = (productId) => {
  const {
    data: product,
    loading,
    error,
    execute: fetchProduct
  } = useApi(() => productService.getProductById(productId), [productId]);

  return {
    product,
    loading,
    error,
    fetchProduct
  };
};

export const useFeaturedProducts = () => {
  const {
    data: featuredProducts,
    loading,
    error,
    execute: fetchFeaturedProducts
  } = useApi(productService.getFeaturedProducts);

  return {
    featuredProducts,
    loading,
    error,
    fetchFeaturedProducts
  };
};
