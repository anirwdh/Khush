// Global event system for wishlist synchronization
export class WishlistEventSystem {
  constructor() {
    this.listeners = new Set();
    this.isInitialized = false;
    this.queryClient = null;
  }

  // Set query client instance (called from useWishlistSync hook)
  setQueryClient(queryClient) {
    this.queryClient = queryClient;
  }

  // Initialize the event system
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('🔄 Wishlist Event System initialized');
  }

  // Subscribe to wishlist changes
  subscribe(callback) {
    this.listeners.add(callback);
    console.log('👂 New listener subscribed to wishlist events');
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      console.log('👋 Listener unsubscribed from wishlist events');
    };
  }

  // Emit wishlist change event
  emit(event, data) {
    console.log(`📢 Emitting wishlist event: ${event}`, data);
    
    // Notify all listeners
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in wishlist event listener:', error);
      }
    });

    // Invalidate relevant queries for real-time sync
    this.invalidateQueries(event, data);
  }

  // Invalidate queries based on event type
  invalidateQueries(event, data) {
    if (!this.queryClient) {
      console.warn('Query client not set, skipping query invalidation');
      return;
    }

    switch (event) {
      case 'WISHLIST_TOGGLED':
        // Invalidate all wishlist-related queries
        this.queryClient.invalidateQueries({
          queryKey: ['wishlistIds'],
          exact: true,
        });
        
        this.queryClient.invalidateQueries({
          queryKey: ['wishlistItems'],
          exact: false,
        });
        
        console.log('🔄 Invalidated wishlist queries after toggle');
        break;
        
      case 'WISHLIST_REFRESH':
        // Force refresh all wishlist data
        this.queryClient.invalidateQueries({
          queryKey: ['wishlistIds'],
          exact: true,
        });
        
        this.queryClient.invalidateQueries({
          queryKey: ['wishlistItems'],
          exact: false,
        });
        
        console.log('🔄 Force refreshed all wishlist queries');
        break;
        
      default:
        console.log('Unknown wishlist event:', event);
    }
  }

  // Cleanup
  destroy() {
    this.listeners.clear();
    this.queryClient = null;
    this.isInitialized = false;
    console.log('🗑️ Wishlist Event System destroyed');
  }
}

// Create singleton instance
export const wishlistEvents = new WishlistEventSystem();

// Auto-initialize
wishlistEvents.init();
