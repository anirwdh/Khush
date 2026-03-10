export const API_CONFIG = {
  BASE_URL: 'https://api.khushpehno.com/api',
  //BASE_URL: 'http://192.168.1.36:5000/api',
  
  TIMEOUT: 15000,
  
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/user/auth/register',
      LOGIN: '/user/auth/login',
      LOGOUT: '/user/auth/logout',
      REFRESH: '/user/auth/refresh-token',
      NEW_ACCESS_TOKEN: '/user/auth/newAccessToken',
      FORGOT_PASSWORD: '/user/auth/forgot-password',
      RESET_PASSWORD: '/user/auth/reset-password',
      VERIFY_OTP: '/user/auth/verify-otp',
      RESEND_OTP: '/user/auth/resend-otp',
      GET_PROFILE: '/user/auth/getProfile',
      UPDATE_PROFILE: '/user/auth/update-profile',
    },
    PRODUCTS: {
      GET_ALL: '/products',
      GET_BY_ID: '/products/:id',
      CREATE: '/products',
      UPDATE: '/products/:id',
      DELETE: '/products/:id',
    },
    CART: {
      GET: '/cart',
      ADD: '/cart/add',
      UPDATE: '/cart/update/:id',
      REMOVE: '/cart/remove/:id',
      CLEAR: '/cart/clear',
      // Quantity operations (matching API documentation)
      INCREASE_QUANTITY: '/cart/increaseqty/:sku',
      DECREASE_QUANTITY: '/cart/decreaseqty/:sku',
      REMOVE_BY_SKU: '/cart/remove/:sku',
      GET_MY_CART: '/cart/my',
      SET_DELIVERY_ADDRESS: '/cart/delivery-address',
      SELECT_DELIVERY: '/cart/select-delivery',
      GET_PRICE_SUMMARY: '/cart/price-summary',
      APPLY_COUPON: '/cart/apply-coupon',
    },
    CATEGORIES: {
      GET_ALL: '/categories/getAll',
    },
    SUBCATEGORIES: {
      GET_ALL: '/subcategories/getAll',
    },
  },
  
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
};

export default API_CONFIG;
