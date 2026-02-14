# Redux Integration Guide

This Redux setup is optimized for production with AsyncStorage persistence, providing reliable state management for the Khush React Native app.

## Architecture Overview

- **Redux Toolkit**: Modern Redux with built-in best practices
- **AsyncStorage Storage**: Reliable persistence with React Native's storage solution
- **Slices**: Modular state management for different features
- **Custom Hooks**: Easy access to state and dispatch

## Store Structure

```javascript
{
  auth: {
    user: User | null,
    token: string | null,
    refreshToken: string | null,
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null,
  },
  cart: {
    items: CartItem[],
    total: number,
    itemCount: number,
    loading: boolean,
    error: string | null,
    coupon: Coupon | null,
    discount: number,
  },
  product: {
    products: Product[],
    featuredProducts: Product[],
    loading: boolean,
    error: string | null,
  },
  ui: {
    loading: boolean,
    refreshing: boolean,
    theme: 'light' | 'dark' | 'auto',
    isOnline: boolean,
    modals: object,
    activeTab: string,
    notifications: Notification[],
    globalError: string | null,
    appState: 'active' | 'background' | 'inactive',
  }
}
```

## Usage Examples

### Using Custom Hooks

```javascript
import { useAuth, useCart, useUI } from '../redux/hooks';

// In your component
function ProfileScreen() {
  const { user, isAuthenticated, loading, dispatch } = useAuth();
  const { itemCount } = useCart();
  const { setTheme, addNotification } = useUI();
  
  const handleLogout = () => {
    dispatch({ type: 'auth/logout' });
    addNotification({ type: 'success', message: 'Logged out successfully' });
  };
  
  return (
    // Your JSX
  );
}
```

### Direct Redux Usage

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice';

function LoginScreen() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  
  const handleLogin = async (credentials) => {
    dispatch({ type: 'auth/loginStart' });
    
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        dispatch(loginSuccess(result.data));
      } else {
        dispatch({ type: 'auth/loginFailure', payload: result.message });
      }
    } catch (error) {
      dispatch({ type: 'auth/loginFailure', payload: error.message });
    }
  };
}
```

## AsyncStorage Persistence

The store automatically persists critical data to AsyncStorage:

- **Auth State**: User info and tokens
- **Cart State**: Items, totals, and coupons

### Manual Persistence

```javascript
// Rehydrate state on app startup
import { useAppInitialization } from '../redux/hooks';

function App() {
  const { initializeApp } = useAppInitialization();
  
  useEffect(() => {
    initializeApp();
  }, []);
}
```

## Performance Optimizations

1. **No redux-persist**: Direct AsyncStorage integration for better compatibility
2. **Selective Persistence**: Only essential data is persisted
3. **Async Operations**: AsyncStorage provides reliable storage access
4. **Minimal Re-renders**: Proper selector usage with hooks

## Best Practices

1. **Use Custom Hooks**: Prefer `useAuth`, `useCart`, etc. over direct selectors
2. **Batch Updates**: Multiple dispatch calls are automatically batched
3. **Error Handling**: Centralized error state in each slice
4. **Loading States**: Consistent loading management across features

## Development Tools

- **Redux DevTools**: Available in development mode
- **Hot Reload**: State persists during development
- **Debugging**: Comprehensive state inspection in DevTools
