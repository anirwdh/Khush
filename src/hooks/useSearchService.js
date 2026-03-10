import { useState, useEffect, useCallback } from 'react';
import { searchKeywordsService } from '../services/api/searchKeywordsService';
import { TokenStorage } from '../utils/tokenStorage';

export const useSearchService = () => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await TokenStorage.getAccessToken();
        console.log('Auth token found:', !!token);
        setIsAuthenticated(!!token);
      } catch (error) {
        console.log('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Fetch search data on mount and when auth status changes
  useEffect(() => {
    fetchSearchData();
  }, [isAuthenticated]);

  // Also fetch data after a short delay to ensure auth state is properly set
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchData();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchSearchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch popular searches (no auth required)
      const popularResponse = await searchKeywordsService.getPopularSearches(10, 'all');
      console.log('Popular searches response:', popularResponse);
      
      if (popularResponse.success && popularResponse.data && popularResponse.data.data && Array.isArray(popularResponse.data.data)) {
        // Handle the response format from the API - data.data is the array of objects
        const keywords = popularResponse.data.data.map(item => item.keyword);
        console.log('Extracted popular keywords:', keywords);
        setPopularSearches(keywords);
      } else {
        console.log('Popular searches - response structure:', {
          success: popularResponse.success,
          hasData: !!popularResponse.data,
          hasDataData: !!(popularResponse.data && popularResponse.data.data),
          dataType: typeof popularResponse.data,
          dataDataType: typeof (popularResponse.data && popularResponse.data.data),
          isArray: Array.isArray(popularResponse.data && popularResponse.data.data),
          dataKeys: popularResponse.data ? Object.keys(popularResponse.data) : 'no data'
        });
      }

      // Fetch recent searches only if authenticated
      if (isAuthenticated) {
        const recentResponse = await searchKeywordsService.getRecentSearches(10);
        console.log('Recent searches response:', recentResponse);
        
        if (recentResponse.success && recentResponse.data && recentResponse.data.data && Array.isArray(recentResponse.data.data)) {
          // Handle the response format from the API - data.data is the array of objects
          const keywords = recentResponse.data.data.map(item => item.keyword);
          console.log('Extracted recent keywords:', keywords);
          setRecentSearches(keywords);
        } else {
          console.log('Recent searches - response structure:', {
            success: recentResponse.success,
            hasData: !!recentResponse.data,
            hasDataData: !!(recentResponse.data && recentResponse.data.data),
            dataType: typeof recentResponse.data,
            dataDataType: typeof (recentResponse.data && recentResponse.data.data),
            isArray: Array.isArray(recentResponse.data && recentResponse.data.data),
            dataKeys: recentResponse.data ? Object.keys(recentResponse.data) : 'no data'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching search data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const trackSearch = useCallback(async (keyword) => {
    try {
      await searchKeywordsService.trackSearch(keyword);
      // Refresh recent searches if authenticated
      if (isAuthenticated) {
        const recentResponse = await searchKeywordsService.getRecentSearches(10);
        if (recentResponse.success && recentResponse.data && recentResponse.data.data && Array.isArray(recentResponse.data.data)) {
          const keywords = recentResponse.data.data.map(item => item.keyword);
          setRecentSearches(keywords);
        }
      }
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }, [isAuthenticated]);

  // Debug log to monitor state changes
  useEffect(() => {
    console.log('useSearchService state updated:', {
      loading,
      isAuthenticated,
      recentSearchesLength: recentSearches.length,
      popularSearchesLength: popularSearches.length,
      recentSearches,
      popularSearches
    });
  }, [loading, isAuthenticated, recentSearches, popularSearches]);

  const clearRecentSearch = useCallback(async (keyword) => {
    try {
      const response = await searchKeywordsService.deleteSearch(keyword);
      console.log('Delete search response:', response);
      
      // Update recent searches list
      setRecentSearches(prev => prev.filter(item => item !== keyword));
      
      // Refresh recent searches from server to ensure sync
      if (isAuthenticated) {
        const recentResponse = await searchKeywordsService.getRecentSearches(10);
        if (recentResponse.success && recentResponse.data && recentResponse.data.data && Array.isArray(recentResponse.data.data)) {
          const keywords = recentResponse.data.data.map(item => item.keyword);
          setRecentSearches(keywords);
        }
      }
    } catch (error) {
      console.error('Error clearing recent search:', error);
    }
  }, [isAuthenticated]);

  const clearAllRecentSearches = useCallback(async () => {
    try {
      const response = await searchKeywordsService.clearRecentSearches();
      console.log('Clear all searches response:', response);
      
      // Clear local state immediately
      setRecentSearches([]);
      
      // Refresh from server to ensure sync
      if (isAuthenticated) {
        const recentResponse = await searchKeywordsService.getRecentSearches(10);
        if (recentResponse.success && recentResponse.data && recentResponse.data.data && Array.isArray(recentResponse.data.data)) {
          const keywords = recentResponse.data.data.map(item => item.keyword);
          setRecentSearches(keywords);
        } else {
          // If response indicates success but no data, keep empty array
          setRecentSearches([]);
        }
      }
    } catch (error) {
      console.error('Error clearing all recent searches:', error);
    }
  }, [isAuthenticated]);

  return {
    recentSearches,
    popularSearches,
    loading,
    isAuthenticated,
    trackSearch,
    clearRecentSearch,
    clearAllRecentSearches,
    refreshSearchData: fetchSearchData,
  };
};
