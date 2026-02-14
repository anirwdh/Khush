export const APP_CONSTANTS = {
  APP_NAME: 'Khush',
  APP_VERSION: '1.0.0',
  
  STORAGE_KEYS: {
    AUTH_TOKEN: 'khush_token',
    REFRESH_TOKEN: 'khush_refresh_token',
    USER_DATA: 'khush_user',
    CART_DATA: 'khush_cart',
    WISHLIST_DATA: 'khush_wishlist',
  },
  
  SCREEN_NAMES: {
    LOGIN: 'Login',
    REGISTER: 'Register',
    HOME: 'Home',
    PRODUCT_LIST: 'ProductList',
    PRODUCT_DETAIL: 'ProductDetail',
    CART: 'Cart',
    CHECKOUT: 'Checkout',
    PROFILE: 'Profile',
    ORDERS: 'Orders',
    WISHLIST: 'Wishlist',
    SEARCH: 'Search',
  },
  
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  
  CURRENCY: {
    SYMBOL: '$',
    CODE: 'USD',
  },
  
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
  }
};
