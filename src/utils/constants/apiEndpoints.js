export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PRODUCTS: {
    GET_ALL: '/products',
    GET_BY_ID: '/products/:id',
    SEARCH: '/products/search',
    FEATURED: '/products/featured',
    BY_CATEGORY: '/products/category/:categoryId',
  },
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE_ITEM: '/cart/item/:itemId',
    REMOVE_ITEM: '/cart/item/:itemId',
    CLEAR: '/cart',
    APPLY_COUPON: '/cart/apply-coupon',
  },
  ORDERS: {
    GET_ALL: '/orders',
    GET_BY_ID: '/orders/:id',
    CREATE: '/orders',
    CANCEL: '/orders/:id/cancel',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    ADDRESSES: '/user/addresses',
    PAYMENT_METHODS: '/user/payment-methods',
  }
};
