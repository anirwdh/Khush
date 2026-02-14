import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

// ICONS (replace with your own)
import OrdersIcon from '../../assets/Icons/OrderIcon';
import TruckIcon from '../../assets/Icons/TruckIcon';
import AddressIcon from '../../assets/Icons/AddressIcon';
import ReturnIcon from '../../assets/Icons/Return';
import ContactIcon from '../../assets/Icons/ContactIcon';
import TermsIcon from '../../assets/Icons/TermsIcon';
import ArrowTapIcon from '../../assets/Icons/ArroowwTap';
import DefaultIcon from '../../assets/Icons/DefualtIcon';
import BottomTabBar from '../../Components/BottomTabBar.jsx';
import { authService } from '../../services/api/authService';
import { TokenStorage } from '../../utils/tokenStorage';


const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = React.useState(5); // Profile tab is active
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status and fetch user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        console.log('👤 PROFILE SCREEN: Checking authentication status');
        const isAuth = await authService.isAuthenticated();
        console.log('👤 Authentication status:', isAuth);
        
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          console.log('👤 User is authenticated, fetching profile');
          const result = await authService.getCurrentUser();
          
          if (result.success && result.data) {
            console.log('✅ Profile data received:', result.data);
            console.log('👤 Setting userProfile to:', result.data);
            console.log('👤 userProfile.name:', result.data.name);
            setUserProfile(result.data.data); // Fix: Store only the data part
            console.log('✅ userProfile state should be updated now');
          } else {
            console.error('❌ Failed to fetch profile:', result.message);
            // If profile fetch fails, user might not be properly authenticated
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('❌ Error loading user profile:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            
            try {
              console.log('🚪 PROFILE SCREEN: Starting logout process');
              
              // Call logout API
              const result = await authService.logout();
              console.log('🚪 Logout API response:', result);
              
              if (result.success) {
                console.log('✅ Logout successful');
                
                // Clear local storage
                console.log('🗑️ Clearing local tokens');
                TokenStorage.clear();
                
                // Clear Redux state
                console.log('🗑️ Clearing Redux auth state');
                dispatch({ type: 'auth/logout' });
                
                // Reset navigation to Login screen
                console.log('🔄 Resetting navigation to Login screen');
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'LoginScreen' }],
                  })
                );
                
                Alert.alert(
                  'Success',
                  'Logged out successfully',
                  [{ text: 'OK' }]
                );
              } else {
                console.error('❌ Logout failed:', result.message);
                Alert.alert(
                  'Error',
                  result.message || 'Logout failed. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('❌ Logout error:', error);
              
              // Even if API fails, clear local storage and navigate to login
              console.log('🗑️ API failed, clearing local tokens anyway');
              TokenStorage.clear();
              
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'LoginScreen' }],
                })
              );
              
              Alert.alert(
                'Logged Out',
                'Logged out locally. Some server cleanup may not have completed.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { title: 'ORDERS', icon: <OrdersIcon />, requiresAuth: true },
    { title: 'TRACKORDERS', icon: <TruckIcon />, requiresAuth: true },
    { title: 'ADDRESS', icon: <AddressIcon />, requiresAuth: true },
    { title: 'RETURN/EXCHANGE ORDER', icon: <ReturnIcon />, requiresAuth: true },
    { title: 'CONTACT US', icon: <ContactIcon />, requiresAuth: false },
    { title: 'TERMS & CONDITIONS', icon: <TermsIcon />, requiresAuth: false },
  ];

  // Filter menu items based on authentication status
  const visibleMenuItems = menuItems.filter(item => !item.requiresAuth || isAuthenticated);

  const handleLogin = () => {
    navigation.navigate('LoginScreen');
  };

  const handleSignup = () => {
    navigation.navigate('SignUpScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.headerTitle}>PROFILE</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Black Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <DefaultIcon width={88} height={88} top={3} />
            </View>

            <View>
              <Text style={styles.name}>
                {isAuthenticated && userProfile?.name ? userProfile.name.toUpperCase() : 'HELLO USER!'}
              </Text>
              <Text style={styles.subtitle}>
                {isAuthenticated && userProfile?.email ? userProfile.email : 'Style Preference Here'}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {isAuthenticated ? (
              <>
                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>UPDATE PROFILE</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={handleLogout}
                  disabled={isLoggingOut}
                >
                  <Text style={styles.secondaryButtonText}>
                    {isLoggingOut ? 'LOGGING OUT...' : 'LOG OUT'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                  <Text style={styles.primaryButtonText}>LOGIN</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={handleSignup}>
                  <Text style={styles.secondaryButtonText}>SIGN UP</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Menu List */}
          {visibleMenuItems.length > 0 && (
            <View style={styles.menuContainer}>
              {visibleMenuItems.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.menuItem}
                  onPress={() => {
                    switch (item.title) {
                      case 'ORDERS':
                        navigation.navigate('OrderScreen');
                        break;
                      case 'ADDRESS':
                        navigation.navigate('AddAddressScreen');
                        break;
                      case 'TRACKORDERS':
                        // TODO: Navigate to TrackOrderScreen when created
                        navigation.navigate('TrackOrdersScreen');
                        console.log('Navigate to Track Orders');
                        break;
                      case 'RETURN/EXCHANGE ORDER':
                        // TODO: Navigate to ReturnExchangeScreen when created
                        console.log('Navigate to Return/Exchange Order');
                        break;
                      case 'CONTACT US':
                        // TODO: Navigate to ContactScreen when created
                        console.log('Navigate to Contact Us');
                        break;
                      case 'TERMS & CONDITIONS':
                        // TODO: Navigate to TermsScreen when created
                        console.log('Navigate to Terms & Conditions');
                        break;
                      default:
                        break;
                    }
                  }}
                >
                  <View style={styles.menuLeft}>
                    {item.icon}
                    <Text style={styles.menuText}>{item.title}</Text>
                  </View>
                  <ArrowTapIcon />
                </TouchableOpacity>
              ))}
            </View>
          )}

        </ScrollView>
      </View>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
    paddingBottom: 70, // Space for bottom tab bar
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#000',
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },

  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },

  subtitle: {
    fontSize: 14,
    color: '#BFBFBF',
    marginTop: 4,
  },

  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },

  primaryButton: {
    backgroundColor: '#000',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    letterSpacing: 1.5,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#000',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#000',
    fontSize: 16,
    letterSpacing: 1.5,
  },

  menuContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  menuText: {
    fontSize: 15,
    letterSpacing: 2,
    color: '#000',
  },
});

export default ProfileScreen;
