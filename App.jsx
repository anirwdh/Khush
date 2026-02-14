/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from './src/redux/store/store';

import SplashScreen from './src/screens/Common/SplashScreen';
import SplashScreen2 from './src/screens/Common/SplashScreen2';
import OnboardingScreen from './src/screens/Common/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import VerificationScreen from './src/screens/auth/VerificationScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import ProductDetailScreen from './src/screens/product/ProductDetailScreen';
import ProductReviewsScreen from './src/screens/product/ProductReviewsScreen';
import CartScreen from './src/screens/cart/CartScreen';
import AddAddressScreen from './src/screens/profile/AddAddressScreen';
import ProductListScreen from './src/screens/product/ProductListScreen';
import WishlistScreen from './src/screens/Wishlist/WishlistScreen';
import CollectionsScreen from './src/screens/Collections/CollectionsScreen';
import CollectionListingScreen from './src/screens/Collections/CollectionListingScreen';
import OptionsScreen from './src/screens/home/OptionsScreen';
import SearchScreen from './src/screens/Common/SearchScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import OrderScreen from './src/screens/profile/OrderScreen'; 
import TrackOrdersScreen from './src/screens/profile/TrackOrdersScreen';
import TrackOrderDetailScreen from './src/screens/profile/TrackOrderDetailScreen';


const Stack = createNativeStackNavigator();

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="SplashScreen"
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="SplashScreen2" component={SplashScreen2} />
          <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} options={{ animation: 'slide_from_bottom'}}/>
          <Stack.Screen name="LoginScreen" component={LoginScreen}options={{ animation: 'slide_from_right'}} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ animation: 'slide_from_right'}}/>
          <Stack.Screen name="VerificationScreen" component={VerificationScreen} options={{ animation: 'slide_from_right'}}/>
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ gestureEnabled: false, headerBackVisible: false }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ animation: 'slide_from_right'}}/>
          <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} />
          <Stack.Screen name="CartScreen" component={CartScreen} />
          <Stack.Screen name="AddAddressScreen" component={AddAddressScreen} />
          <Stack.Screen name="ProductListScreen" component={ProductListScreen} options={{ animation: 'slide_from_right'}}/>
          <Stack.Screen name="WishlistScreen" component={WishlistScreen} options={{ gestureEnabled: false, headerBackVisible: false }}/>
          <Stack.Screen name="CollectionsScreen" component={CollectionsScreen} options={{ gestureEnabled: false, headerBackVisible: false }}/>
          <Stack.Screen name="CollectionListingScreen" component={CollectionListingScreen}  options={{ animation: 'slide_from_right'}} />
          <Stack.Screen name="OptionsScreen" component={OptionsScreen} options={{ animation: 'slide_from_left'}}/>
          <Stack.Screen name="SearchScreen" component={SearchScreen} options={{ animation: 'slide_from_right'}}/>
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{gestureEnabled: false, headerBackVisible: false }}/>
          <Stack.Screen name="OrderScreen" component={OrderScreen}options={{ animation: 'slide_from_right'}} />
          <Stack.Screen name="TrackOrdersScreen" component={TrackOrdersScreen}options={{ animation: 'slide_from_right'}} />
          <Stack.Screen name="TrackOrderDetailScreen" component={TrackOrderDetailScreen}options={{ animation: 'slide_from_right'}} /> 
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

