# API Services Integration Guide

This directory contains the optimized API integration setup using Axios for the Khush React Native app.

## Setup Overview

- **Axios**: HTTP client with interceptors for auth and error handling
- **AsyncStorage**: Secure token storage for React Native
- **Centralized Configuration**: All API endpoints and settings in one place
- **Error Handling**: Consistent error responses with user-friendly messages
- **Type Safety**: Structured response format

## Usage Examples

### Authentication

```javascript
import { authService } from '../services/api';

// Login
const loginResult = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

if (loginResult.success) {
  console.log('Login successful:', loginResult.data);
  // Token is automatically stored
} else {
  console.error('Login failed:', loginResult.message);
}

// Get current user
const userResult = await authService.getCurrentUser();
if (userResult.success) {
  console.log('User data:', userResult.data);
}
```

### Products

```javascript
import { productService } from '../services/api';

// Get all products
const productsResult = await productService.getAllProducts();
if (productsResult.success) {
  console.log('Products:', productsResult.data);
}

// Get product by ID
const productResult = await productService.getProductById('123');
if (productResult.success) {
  console.log('Product:', productResult.data);
}

// Search products
const searchResult = await productService.searchProducts('laptop', {
  category: 'electronics',
  minPrice: 500
});
```

### Cart

```javascript
import { cartService } from '../services/api';

// Add to cart
const addResult = await cartService.addToCart('product123', 2);
if (addResult.success) {
  console.log('Added to cart:', addResult.message);
}

// Get cart
const cartResult = await cartService.getCart();
if (cartResult.success) {
  console.log('Cart items:', cartResult.data);
}

// Update cart item
const updateResult = await cartService.updateCartItem('item123', 3);
```

## Response Format

All API calls return a consistent response format:

```javascript
{
  success: boolean,
  data: any,           // Only if success: true
  message: string,     // Success or error message
  error?: string       // Only if success: false
}
```

## Configuration

API settings are managed in `src/config/api.config.js`:

- Base URLs for development and production
- API endpoints
- Timeout settings
- HTTP status codes

## Error Handling

The system automatically handles:
- Network errors
- Authentication failures (auto-logout)
- Server errors
- Invalid requests

All errors are converted to user-friendly messages.
