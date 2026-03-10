import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '../services/api/wishlistService';
import { triggerLightHaptic } from '../utils/haptic';
import { wishlistEvents } from '../utils/wishlistEvents';

// Global query key for wishlist IDs - this ensures all components use the same cache
export const WISHLIST_IDS_QUERY_KEY = ['wishlistIds'];

// Custom hook for real-time wishlist synchronization
export const useWishlistSync = () => {
  const queryClient = useQueryClient();
  const [pendingOperations, setPendingOperations] = useState(new Set());

  // Set queryClient in event system for global access
  useEffect(() => {
    wishlistEvents.setQueryClient(queryClient);
  }, [queryClient]);

  // Fetch wishlist IDs with optimized settings for real-time sync
  const { data: wishlistIds = [], refetch: refetchWishlist } = useQuery({
    queryKey: WISHLIST_IDS_QUERY_KEY,
    queryFn: async () => {
      console.log('🔄 Fetching wishlist IDs from API...');
      const res = await wishlistService.getWishlistIds();

      if (res?.success && Array.isArray(res?.data?.data))
        return res.data.data;

      if (res?.success && Array.isArray(res?.data))
        return res.data;

      if (Array.isArray(res))
        return res;

      return [];
    },
    staleTime: 30 * 1000, // 30 seconds - short enough for real-time feel
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Prevent flickering
    refetchOnReconnect: true, // Refetch on reconnect to ensure consistency
    refetchInterval: 3 * 60 * 1000, // 3 minutes - balance between real-time and performance
    refetchIntervalInBackground: false, // Don't refetch in background
    keepPreviousData: true,
  });

  // Convert to Set for O(1) lookup and include pending operations
  const wishlistSet = new Set(wishlistIds);
  
  // Add pending operations to the set for immediate UI feedback across all screens
  pendingOperations.forEach(itemId => {
    if (wishlistSet.has(itemId)) {
      wishlistSet.delete(itemId); // Pending removal
    } else {
      wishlistSet.add(itemId); // Pending addition
    }
  });

  // Debug log to track wishlist state changes
  console.log('🛒 Wishlist state:', {
    wishlistIds,
    pendingOperations: Array.from(pendingOperations),
    finalWishlistSet: Array.from(wishlistSet)
  });

  // Toggle wishlist mutation with global synchronization
  const toggleWishlistMutation = useMutation({
    mutationFn: (itemId) => wishlistService.toggleWishlist(itemId),
    onMutate: async (itemId) => {
      console.log('🔄 Starting wishlist toggle for item:', itemId);
      
      // Add to pending operations immediately for real-time UI feedback
      setPendingOperations(prev => new Set(prev).add(itemId));
      
      // Emit event to notify all screens
      wishlistEvents.emit('WISHLIST_TOGGLE_START', { itemId });
      
      // NO optimistic updates to cache - let pending operations handle UI
      // This prevents cache inconsistencies across screens
    },
    onError: (err, itemId, context) => {
      console.log('❌ Error in wishlist toggle:', err);
      
      // Remove from pending operations on error
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      
      // Emit error event
      wishlistEvents.emit('WISHLIST_TOGGLE_ERROR', { itemId, error: err });
      
      // Refetch to ensure consistency across all screens
      refetchWishlist();
    },
    onSuccess: (data, itemId) => {
      console.log('✅ Wishlist toggle success for item:', itemId);
      
      // Remove from pending operations on success
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      
      // Update the global cache directly with response data
      if (data?.data?.wishlistIds) {
        queryClient.setQueryData(WISHLIST_IDS_QUERY_KEY, data.data.wishlistIds);
      } else if (data?.data) {
        // Fallback: update cache based on the operation
        queryClient.setQueryData(WISHLIST_IDS_QUERY_KEY, (old = []) => {
          if (old.includes(itemId)) {
            return old.filter(id => id !== itemId);
          } else {
            return [...old, itemId];
          }
        });
      }
      
      // Emit success event - this will trigger real-time sync across all screens
      wishlistEvents.emit('WISHLIST_TOGGLED', { 
        itemId, 
        isWishlisted: data?.data?.wishlistIds?.includes(itemId) || false,
        wishlistIds: data?.data?.wishlistIds || []
      });
    },
    onSettled: (data, error, itemId) => {
      // Ensure pending operation is cleared regardless of outcome
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      
      // Emit settled event
      wishlistEvents.emit('WISHLIST_TOGGLE_SETTLED', { itemId, error });
    }
  });

  // Enhanced toggle function with debouncing
  const toggleWishlist = useCallback(async (itemId) => {
    // Prevent multiple rapid taps
    if (pendingOperations.has(itemId)) {
      console.log('⚠️ Operation already pending for item:', itemId);
      return false;
    }
    
    triggerLightHaptic();
    toggleWishlistMutation.mutate(itemId);
    return true;
  }, [pendingOperations, toggleWishlistMutation]);

  // Force refresh all wishlist data across all screens
  const refreshWishlistGlobal = useCallback(() => {
    console.log('🔄 Global wishlist refresh triggered');
    setPendingOperations(new Set()); // Clear all pending operations
    refetchWishlist();
    
    // Emit global refresh event
    wishlistEvents.emit('WISHLIST_REFRESH', { timestamp: Date.now() });
  }, [refetchWishlist]);

  // Listen to global wishlist events for real-time sync
  useEffect(() => {
    const unsubscribe = wishlistEvents.subscribe((event, data) => {
      console.log('📨 Received wishlist event:', event, data);
      
      switch (event) {
        case 'WISHLIST_TOGGLED':
          // The query invalidation is handled by the event system
          // No additional action needed here
          break;
          
        case 'WISHLIST_REFRESH':
          // Force refetch on refresh event
          refetchWishlist();
          break;
          
        default:
          // Handle other events if needed
          break;
      }
    });

    return unsubscribe;
  }, [refetchWishlist]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setPendingOperations(new Set());
    };
  }, []);

  return {
    wishlistIds,
    wishlistSet,
    isWishlisted: (itemId) => wishlistSet.has(itemId),
    toggleWishlist,
    toggleWishlistMutation,
    refreshWishlistGlobal,
    pendingOperations,
    isLoading: toggleWishlistMutation.isPending,
  };
};
