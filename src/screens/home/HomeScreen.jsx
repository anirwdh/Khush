import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, Dimensions, Pressable, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Video from 'react-native-video';
import MenuIcon from '../../assets/Icons/MenuIcon';
import SearchIcon from '../../assets/Icons/SearchIcon';
import LogoIcon from '../../assets/Icons/logoicon.jsx';
import MainLogo from '../../assets/Icons/MainLogo.jsx';
import Meeting from '../../assets/Icons/Meeting.jsx';
import Delievry from '../../assets/Icons/Delievry.jsx';
import Return from '../../assets/Icons/Return.jsx';
import Assistance from '../../assets/Icons/Assistance.jsx';
import BottomTabBar from '../../Components/BottomTabBar.jsx';
import JustForYouSection from '../../Components/JustForYouSection.jsx';
import LocationIcon from '../../assets/Icons/LocationIcon.jsx';
import { getFontFamily } from '../../utils/fontLoader';
import { featuresService } from '../../services/featuresService';
import { useGeolocation } from '../../hooks/useGeolocation';
import { clearLocationError } from '../../redux/slices/locationSlice';
import { getAllSections } from '../../config/sections.config';
import SectionRenderer from '../../Components/DynamicSections/SectionRenderer';
import { useFocusEffect } from '@react-navigation/native';
import { getFeaturedVideos } from '../../services/featuredVideosService';
import { getCategories } from '../../services/subcategoryService';
import { bannerService } from '../../services/bannerService';
import { userBootstrap } from '../../services/userBootstrap';

const { width, height } = Dimensions.get('window');

// Memoized Collection Section Component
const CollectionSection = React.memo(() => {
  const navigation = useNavigation();
  const [loadedImages, setLoadedImages] = useState({});

  // Fetch collections using React Query
  const { data: collectionsData, isLoading: loading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => getCategories({ page: 1, limit: 10 }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000,
  });

  // Transform collections data
  const collections = useMemo(() => {
    if (!collectionsData?.categories) return [];
    return collectionsData.categories.map(category => ({
      id: category._id,
      title: category.name.toUpperCase(),
      image: { uri: category.imageUrl },
    }));
  }, [collectionsData]);

  // Handle image load
  const handleImageLoad = useCallback((itemId) => {
    setLoadedImages(prev => ({ ...prev, [itemId]: true }));
  }, []);

  const renderCollectionItem = useCallback(({ item, index }) => {
    const isEven = index % 2 === 1;
    const isLoaded = loadedImages[item.id];

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.collectionItem}
        onPress={() => navigation.navigate('CollectionListingScreen', { collectionName: item.title, categoryId: item.id })}
      >
        <View style={styles.collectionImageWrapper}>
          {!isLoaded && <View style={styles.collectionPlaceholder} />}
          <Image 
            source={item.image} 
            style={styles.collectionImage}
            onLoad={() => handleImageLoad(item.id)}
            progressiveRenderingEnabled={true}
            fadeDuration={300}
          />
        </View>

        {/* Text Overlay */}
        <View
          style={[
            styles.collectionOverlay,
            isEven ? styles.textRight : styles.textLeft,
          ]}
        >
          <Text style={styles.titleTop}>{item.title}</Text>
          <Text style={styles.titleBottom}>COLLECTION</Text>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, loadedImages, handleImageLoad]);

  // Skeleton loading component for Collection Section
  const CollectionSkeleton = useMemo(() => (
    <View style={styles.collectionSection}>
      <Text style={styles.sectionTitle}>COLLECTIONS</Text>
      <View style={styles.collectionList}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.collectionItem}>
            <View style={styles.collectionImageWrapper}>
              <View style={styles.collectionSkeletonImage} />
            </View>
            <View style={[styles.collectionOverlay, item % 2 === 1 ? styles.textRight : styles.textLeft]}>
              <View style={styles.collectionSkeletonTitle} />
              <View style={styles.collectionSkeletonSubtitle} />
            </View>
          </View>
        ))}
      </View>
    </View>
  ), []);

  // Show skeleton loading state
  if (loading) {
    return CollectionSkeleton;
  }

  return (
    <View style={styles.collectionSection}>
      <Text style={styles.sectionTitle}>COLLECTIONS</Text>
      <FlatList
        data={collections}
        renderItem={renderCollectionItem}
        keyExtractor={(item) => item.id}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.collectionList}
        getItemLayout={(data, index) => ({
          length: height * 0.28 + 16,
          offset: (height * 0.28 + 16) * index,
          index,
        })}
        windowSize={10}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        removeClippedSubviews={Platform.OS === 'android'}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
});

// Memoized Services Section Component
const ServicesSection = React.memo(({ featuresData, featuresLoading }) => {
  if (featuresLoading) {
    return (
      <View style={styles.servicesSection}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  const features = featuresData?.success ? (featuresData?.data?.data?.features || []) : [];

  const iconMap = {
    'VIRTUAL APPOINTMENT': Meeting,
    'GLOBAL SHIPPING': Delievry,
    'Global Shipping': Delievry,
    'Global Shippingss': Delievry,
    'RISK-FREE PURCHASE': Return,
    'ONLINE ASSISTANCE': Assistance,
  };

  const renderServiceItem = useCallback(({ item }) => {
    // Defensive check to prevent undefined errors
    if (!item || !item.featureName) {
      return null;
    }
    
    const IconComponent = iconMap[item.featureName] || Assistance;

    return (
      <View key={item._id || Math.random()} style={styles.serviceItem}>
        <View style={styles.iconContainer}>
          {item.icon?.imageUrl ? (
            <Image 
              source={{ uri: item.icon.imageUrl }} 
              style={styles.serviceIcon} 
              resizeMode="contain"
            />
          ) : (
            <IconComponent width={48} height={48} />
          )}
        </View>
        <View style={styles.serviceContent}>
          <Text style={styles.serviceTitle}>{item.featureName}</Text>
          <Text style={styles.serviceDesc}>{item.description || ''}</Text>
        </View>
      </View>
    );
  }, [iconMap]);

  return (
    <View style={styles.servicesSection}>
      
      {/* Brand */}
      <View style={styles.brandBlock}>
        <MainLogo width={48} height={48} />
        <LogoIcon width={120} height={40} />
      </View>

      {/* Services */}
      <View style={styles.servicesList}>
        {features && Array.isArray(features) && features
          .filter(feature => feature && feature.featureName)
          .map((item) => React.cloneElement(renderServiceItem({ item }), { key: item._id || item.featureName }))}
      </View>
    </View>
  );
});

// Memoized Video Section Component
const VideoSection = React.memo(({ isVisible, videoData }) => {
  const videoSource = videoData?.url ? { uri: videoData.url } : require('../../assets/Videos/vIDEO.mp4');
  
  return (
    <View style={styles.videoSection}>
      <Video
        source={videoSource}
        style={styles.videoPlayer}
        controls={false}
        repeat={true}
        resizeMode="cover"
        muted={true}
        autoplay={true}
        poster={require('../../assets/Images/image.png')}
        paused={!isVisible}
        pointerEvents="none"
        playWhenInactive={false}
        ignoreSilentSwitch={true}
      />
    </View>
  );
});

// Memoized Hero Banner Component
const HeroBanner = React.memo(({ bannerData, currentBannerIndex, scrollViewRef, handleBannerScroll, navigation, isLoading }) => {
  const setFlatListRef = useCallback((ref) => {
    if (ref && scrollViewRef) {
      scrollViewRef.current = ref;
    }
  }, [scrollViewRef]);

  // Transform banner data for display
  const bannerImages = useMemo(() => {
    // Handle the wrapped response structure from createApiSuccessResponse
    const actualData = bannerData?.data?.data || bannerData?.data;
    
    if (!bannerData?.success || !actualData?.banners) {
      return [];
    }
    return actualData.banners.map(banner => ({
      id: banner._id,
      uri: banner.mobileBanner?.url,
      title: banner.title,
      text: banner.text,
      navigateTo: banner.navigation?.navigate
    }));
  }, [bannerData]);

  // Handle banner press
  const handleBannerPress = useCallback((banner) => {
    if (banner.navigateTo) {
      navigation.navigate('CollectionListingScreen', { categoryId: banner.navigateTo });
    }
  }, [navigation]);

  // Skeleton loading component for Hero Banner
  const HeroBannerSkeleton = useMemo(() => (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerSkeleton} />
      <View style={styles.exploreButtonOverlay}>
        <View style={styles.exploreButtonSkeleton} />
      </View>
      <View style={styles.indicatorContainer}>
        {[1, 2, 3].map((index) => (
          <View key={index} style={styles.indicatorSkeleton} />
        ))}
      </View>
    </View>
  ), []);

  if (isLoading || !bannerData || bannerImages.length === 0) {
    return HeroBannerSkeleton;
  }
  
  return (
    <View style={styles.bannerContainer}>
      <FlatList
        ref={setFlatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleBannerScroll}
        data={bannerImages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.bannerSlide}
            onPress={() => handleBannerPress(item)}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: item.uri }} 
              style={styles.bannerImage}
              resizeMode="cover"
              progressiveRenderingEnabled={true}
              fadeDuration={300}
            />
          </TouchableOpacity>
        )}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        removeClippedSubviews={Platform.OS === 'android'}
        updateCellsBatchingPeriod={50}
        scrollEventThrottle={16}
        decelerationRate="fast"
      />
      
      <View style={styles.exploreButtonOverlay}>
        <TouchableOpacity 
          style={styles.exploreButton} 
          onPress={() => navigation.navigate('CollectionListing', { collectionName: "All" })}
          activeOpacity={0.8}
        >
          <Text style={styles.exploreButtonText}>EXPLORE COLLECTION</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.indicatorContainer}>
        {bannerImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentBannerIndex === index && styles.activeIndicator
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(route?.params?.activeTab || 1); // Home tab is active
  
  // Debug: Log when activeTab is set from route params
  useEffect(() => {
    if (route?.params?.activeTab) {
      console.log('HomeScreen: Received activeTab from route:', route.params.activeTab);
    }
  }, [route?.params?.activeTab]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [videoVisible, setVideoVisible] = useState(false);
  const scrollViewRef = useRef(null);
  const mainListRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const isRestoringScrollRef = useRef(false);
  const insets = useSafeAreaInsets();
  
  // Geolocation hook
  const {
    loading: locationLoading,
    error: locationError,
    permissionGranted,
    pincode,
    formattedAddress,
    requestLocation,
    requestLocationPermission,
  } = useGeolocation();

  // Fetch features using React Query
  const { data: featuresData, isLoading: featuresLoading } = useQuery({
    queryKey: ['features'],
    queryFn: () => featuresService.getAllFeatures(1, 6),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get location state from Redux
  const location = useSelector((state) => state.location);
  
  // Get auth state from Redux
  const auth = useSelector((state) => state.auth);

  // Fetch featured videos using React Query
  const { data: featuredVideos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['featuredVideos', 'bottom'],
    queryFn: () => getFeaturedVideos({ page: 'bottom' }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000,
  });

  // Fetch banners using React Query
  const { data: bannerData, isLoading: bannerLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannerService.getAllBanners(1, 10, true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000,
  });

  // Request location on first mount if not already available
  useEffect(() => {
    if (!location.latitude && !location.longitude && !locationLoading) {
      // Check if this is first time by checking if location was never set
      const isFirstTime = !location.lastUpdated;
      if (isFirstTime) {
        requestLocationPermission();
      }
    }
  }, [location.latitude, location.longitude, locationLoading, location.lastUpdated, requestLocationPermission]);

  // Bootstrap user data when location is available and user is authenticated
  useEffect(() => {
    const bootstrapUserData = async () => {
      // Only bootstrap if user is authenticated and location is available
      if (auth.isAuthenticated && (location.pinCode || pincode)) {
        console.log('🏠 HomeScreen: User authenticated and location available, bootstrapping user data');
        
        const locationData = {
          pinCode: pincode || location.pinCode,
          city: location.city,
          state: location.state,
          latitude: location.latitude,
          longitude: location.longitude,
          formattedAddress: location.formattedAddress
        };

        try {
          const bootstrapResult = await userBootstrap.bootstrapUser(locationData);
          console.log('✅ HomeScreen: User bootstrap completed:', bootstrapResult);
        } catch (error) {
          console.error('❌ HomeScreen: User bootstrap failed:', error);
        }
      }
    };

    bootstrapUserData();
  }, [auth.isAuthenticated, location.pinCode, pincode, location.city, location.state, location.latitude, location.longitude, location.formattedAddress]);

  // Handle location errors
  useEffect(() => {
    if (locationError) {
      Alert.alert('Location Error', locationError, [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Retry',
          onPress: () => {
            dispatch(clearLocationError());
            requestLocationPermission();
          },
        },
      ]);
    }
  }, [locationError, dispatch, requestLocationPermission]);

  // Optimized scroll position management - only save during navigation, not on app refresh
  const saveScrollPosition = useCallback(async (position) => {
    try {
      // Only save if we're not restoring and position is meaningful
      // Also ensure we're not in the initial app load phase
      if (!isRestoringScrollRef.current && position > 50) {
        const hasMountedBefore = await AsyncStorage.getItem('homeScreenMounted');
        // Only save position if we're past the initial mount phase (navigation scenario)
        if (hasMountedBefore === 'true') {
          scrollPositionRef.current = position;
          await AsyncStorage.setItem('homeScreenScrollPosition', position.toString());
        }
      }
    } catch (error) {
      console.log('Error saving scroll position:', error);
    }
  }, []);

  // Load scroll position
  const loadScrollPosition = useCallback(async () => {
    try {
      const savedPosition = await AsyncStorage.getItem('homeScreenScrollPosition');
      if (savedPosition !== null) {
        const position = parseFloat(savedPosition);
        // Only restore if position is meaningful
        if (position > 100) {
          return position;
        }
      }
    } catch (error) {
      console.log('Error loading scroll position:', error);
    }
    return 0;
  }, []);

  // Clear scroll position on app refresh detection - ALWAYS start from top
  useEffect(() => {
    const detectAppRefresh = async () => {
      try {
        // Always clear scroll position on mount to ensure app starts from top
        console.log('🏠 HomeScreen: Clearing scroll position for fresh start');
        await AsyncStorage.removeItem('homeScreenScrollPosition');
        await AsyncStorage.removeItem('homeScreenMounted');
        scrollPositionRef.current = 0;
        isRestoringScrollRef.current = false;
        
        // Ensure we start at top
        if (mainListRef.current) {
          mainListRef.current.scrollToOffset({ offset: 0, animated: false });
        }
      } catch (error) {
        console.log('Error handling app refresh:', error);
      }
    };

    detectAppRefresh();
  }, []);

  // DISABLED scroll restoration - always start from top on app refresh
  // Only restore scroll position when navigating back from other screens
  useEffect(() => {
    const restoreScrollPosition = async () => {
      // Skip restoration on app refresh - always start from top
      // Only restore if we have a meaningful position AND we're not on app refresh
      const position = await loadScrollPosition();
      if (position > 100 && mainListRef.current && !isRestoringScrollRef.current) {
        // Only restore if this is a navigation back, not app refresh
        // Check if we have been mounted before (navigation scenario)
        const hasMountedBefore = await AsyncStorage.getItem('homeScreenMounted');
        if (hasMountedBefore === 'true') {
          isRestoringScrollRef.current = true;
          requestAnimationFrame(() => {
            if (mainListRef.current) {
              mainListRef.current.scrollToOffset({ offset: position, animated: false });
              setTimeout(() => {
                isRestoringScrollRef.current = false;
              }, 100);
            }
          });
        }
      }
    };

    // Mark as mounted after a delay to distinguish from app refresh
    setTimeout(() => {
      AsyncStorage.setItem('homeScreenMounted', 'true');
      restoreScrollPosition();
    }, 500);
  }, [loadScrollPosition]);

  // Throttled scroll handler
  const scrollTimeoutRef = useRef(null);
  const handleScroll = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Throttle scroll position saving
    scrollTimeoutRef.current = setTimeout(() => {
      saveScrollPosition(offsetY);
    }, 100);
  }, [saveScrollPosition]);

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Control video visibility and scroll behavior based on screen focus
  useFocusEffect(
    useCallback(() => {
      // Screen is focused - video should be visible
      setVideoVisible(true);
      
      // Ensure smooth scroll to top when screen gains focus (tab switching)
      if (mainListRef.current && scrollPositionRef.current === 0) {
        mainListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
      
      return () => {
        // Screen is unfocused - pause video
        setVideoVisible(false);
      };
    }, [])
  );

  // Banner images array from API
  const bannerImages = useMemo(() => {
    // Handle the wrapped response structure from createApiSuccessResponse
    const actualData = bannerData?.data?.data || bannerData?.data;
    if (!bannerData?.success || !actualData?.banners) {
      return [];
    }
    return actualData.banners;
  }, [bannerData]);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollViewRef.current && scrollViewRef.current.scrollToOffset) {
        setCurrentBannerIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % bannerImages.length;
          scrollViewRef.current.scrollToOffset({
            offset: nextIndex * width,
            animated: true,
          });
          return nextIndex;
        });
      }
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const handleTabPress = useCallback((tabId) => {
    // Clear scroll position when switching tabs to prevent jittering
    if (tabId !== activeTab) {
      // Clear all scroll state
      scrollPositionRef.current = 0;
      isRestoringScrollRef.current = false;
      
      // Clear any pending scroll timeouts
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Clear saved position to start fresh
      AsyncStorage.removeItem('homeScreenScrollPosition');
      
      // Scroll to top smoothly when switching tabs
      if (mainListRef.current) {
        mainListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
      
      setActiveTab(tabId);
    }
  }, [activeTab]);

  // Fetch dynamic sections using React Query
  const { data: dynamicSections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ['sections', pincode || location.pinCode || '201309'],
    queryFn: () => getAllSections(pincode || location.pinCode || '201309'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000,
  });

  // Memoized sections data
  const sectionsData = useMemo(() => {
    const baseSections = [
      { type: 'hero', id: 'hero' },
    ];
    
    if (dynamicSections.length > 0) {
      baseSections.push(
        ...dynamicSections.map(section => ({ type: 'dynamic', id: section.id, data: section }))
      );
    }
    
    baseSections.push(
      { type: 'brand', id: 'brand' },
      { type: 'collection', id: 'collection' }
    );
    
    return baseSections;
  }, [dynamicSections]);

  // Optimized scroll handler
  const handleBannerScroll = useCallback((event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(contentOffset.x / width);
    setCurrentBannerIndex(currentIndex);
  }, []);

  // Memoized render item for main FlatList
  const renderSectionItem = useCallback(({ item }) => {
    if (item.type === 'hero') {
      return (
        <HeroBanner
          bannerData={bannerData}
          currentBannerIndex={currentBannerIndex}
          scrollViewRef={scrollViewRef}
          handleBannerScroll={handleBannerScroll}
          navigation={navigation}
          isLoading={bannerLoading}
        />
      );
    } else if (item.type === 'dynamic') {
      return <SectionRenderer section={item.data} />;
    } else if (item.type === 'collection') {
      return <CollectionSection />;
    }
    return null;
  }, [bannerData, currentBannerIndex, scrollViewRef, handleBannerScroll, navigation, bannerLoading]);

  // Memoized footer component
  const ListFooterComponent = useMemo(() => (
    <>
      <VideoSection 
        isVisible={videoVisible} 
        videoData={featuredVideos[0]} 
      />
      <JustForYouSection />
      <ServicesSection featuresData={featuresData} featuresLoading={featuresLoading} />
    </>
  ), [videoVisible, featuredVideos, featuresData, featuresLoading]);

  // Memoized refresh control
  const refreshControl = useMemo(() => null, []);

  // Get item layout for better performance
  const getItemLayout = useCallback((data, index) => {
    const item = data[index];
    let itemHeight = height * 0.8; // Default estimate
    
    // More accurate height estimates based on section type
    if (item?.type === 'hero') {
      itemHeight = height * 0.75;
    } else if (item?.type === 'dynamic') {
      itemHeight = height * 0.6; // Estimate for dynamic sections
    } else if (item?.type === 'brand') {
      itemHeight = height * 0.2;
    } else if (item?.type === 'collection') {
      itemHeight = height * 0.4;
    }
    
    return {
      length: itemHeight,
      offset: itemHeight * index,
      index,
    };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('OptionsScreen')}
          >
            <MenuIcon width={24} height={24} />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <LogoIcon width={127} height={47} />
          </View>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => navigation.navigate('SearchScreen')}
          >
            <SearchIcon width={24} height={24} />
          </TouchableOpacity>
        </View>

        {/* Location Pill Section */}
        <View style={styles.locationSection}>
          <Pressable
            style={({ pressed }) => [
              styles.locationPill,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => {
              navigation.navigate('AddAddressScreen');
            }}
          >
            {/* Icon */}
            <View style={styles.locationIconWrap}>
              <LocationIcon width={28} height={28} />
            </View>

            {/* Location text */}
            <Text
              style={styles.locationText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {locationLoading
                ? 'Getting location...'
                : location.formattedAddress
                ? location.formattedAddress
                : 'B-127, B BLOCK, SECTOR 69, NOIDA'}
            </Text>
          </Pressable>
        </View>

        {/* Optimized FlatList Content with Sections */}
        <FlatList
          ref={(ref) => {
            mainListRef.current = ref;
          }}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          data={sectionsData}
          keyExtractor={(item) => item.id}
          renderItem={renderSectionItem}
          getItemLayout={getItemLayout}
          windowSize={21}
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={10}
          initialNumToRender={2}
          updateCellsBatchingPeriod={25}
          decelerationRate="normal"
          scrollEventThrottle={32}
          onScroll={handleScroll}
          ListFooterComponent={ListFooterComponent}
          refreshControl={refreshControl}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 1000,
          }}
          persistentScrollbar={false}
          progressViewOffset={100}
        />
      </View>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
    paddingBottom: 70, // Space for bottom tab bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    backgroundColor: '#fff',
    //borderBottomWidth: 1,
   // borderBottomColor: '#f0f0f0',
  },
  // Location Section Styles
  locationSection: {
    marginBottom: -height * 0.02,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.015,
    backgroundColor: '#fff',
  },
  locationPill: {
    top:-14,

    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  locationIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
  //  backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    color: '#777',
    fontWeight: '500',
  },
  menuButton: {
    padding: 8,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  searchButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bannerContainer: {
    width: '100%',
    height: height * 0.75,
    position: 'relative',
  },
  bannerSlide: {
    width: width,
    height: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  exploreButtonOverlay: {
    position: 'absolute',
    top: '83%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  exploreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.015,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  exploreButtonText: {
    color: '#FCFCFC',
    fontSize: width * 0.035,
    fontWeight: '500',
    letterSpacing: 1,
    fontFamily: getFontFamily(),
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: '400',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular',
    letterSpacing: 4,
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: height * 0.04,
  },
  arrowContainer: {
    top:-13,
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  tabsContainer: {
    left:53,
   
    flexDirection: 'row',
    marginBottom: height * 0.02,
    paddingBottom: height * 0.01,
  },
  tab: {
    paddingHorizontal: width * 0.0,
    paddingVertical: height * 0.01,
    marginRight: width * 0.05,
    alignItems: 'center',
  },
  tabText: {
    fontSize: width * 0.032,
    fontWeight: '500',
    color: '#888',
    fontFamily: getFontFamily(),
    letterSpacing: 1.8,
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  diamondIndicator: {
    width: 7,
    height: 7,
    backgroundColor: '#000',
    transform: [{ rotate: '45deg' }],
    marginTop: height * 0.005,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productItem: {
    width: width * 0.44,
    backgroundColor: '#fff',
    marginBottom: height * 0.02,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: height * 0.01,
  },
  productImage: {
    width: '100%',
    height: width * 0.55,
   
  },
  likeButton: {
    position: 'absolute',
    top: '80%',
    right: 3,
    padding: 4,
  },
  productInfoContainer: {
    marginTop: height * 0.01,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000',
    fontFamily: getFontFamily(),
    lineHeight: 16,
    letterSpacing: 0,
    marginBottom: height * 0.005,
  },
  priceContainer: {
   
    alignSelf: 'flex-start', paddingHorizontal: 2,
   
   
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '400',
    color: '#C0914B',
    fontFamily: getFontFamily(),
    lineHeight: 24,
    letterSpacing: 0,
  },
  content: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
  },
  brandSection: {
    width: width,
    height: height * 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginVertical: height * 0.01,
  },
  collectionSection: {
    
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
    backgroundColor: '#fff',
  },
  collectionContainer: {
    paddingBottom: height * 0.02,
  },
  collectionItem: {
   // paddingHorizontal: 20,  
   // width: width,
    height: height * 0.28,
    marginBottom: 16,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionImageWrapper: {
    width: '100%',
    height: '100%',
  },
  collectionPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f2f2f2',
  },
  collectionSkeletonImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  collectionSkeletonTitle: {
    width: width * 0.3,
    height: 34,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 4,
  },
  collectionSkeletonSubtitle: {
    width: width * 0.2,
    height: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
  },
  collectionList: {
    paddingBottom: 20,
  },
  collectionOverlay: {
    position: 'absolute',
    bottom: 30,
  },
  textLeft: {
    left: 40,
    alignItems: 'flex-start',
  },
  textRight: {
    right: 44,
    alignItems: 'flex-end',
  },
  titleTop: {
    fontWeight: '700',
    fontSize: 34,
    color: '#fff',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ?'TenorSans' : 'TenorSans-Regular',
  },
  titleBottom: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 3,
    marginTop: -4,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  },
  videoSection: {
    width: width,
    height: height * 0.7,
    backgroundColor: '#000',
    marginVertical: height * 0.01,
    shouldRasterizeIOS: true,
    renderToHardwareTextureAndroid: true,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  servicesSection: {
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.12,
    paddingVertical: height * 0.08,
    shouldRasterizeIOS: true,
  },

  servicesList: {
    alignItems: 'center',
  },

  iconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  serviceIcon: {
    width: 48,
    height: 48,
  },

  serviceContent: {
    alignItems: 'center',
  },

brandBlock: {
  alignItems: 'center',
  marginBottom: height * 0.06,
  gap: 8,
},

brandTitle: {
  fontSize: 38,
  fontFamily: getFontFamily(),
  letterSpacing: 6,
  marginTop: 12,
  color: '#000',
},

brandTag: {
  fontSize: 11,
  letterSpacing: 2,
  marginTop: 6,
  color: '#888',
  fontFamily: getFontFamily(),
},

serviceItem: {
  alignItems: 'center',
  marginBottom: height * 0.055,
},

serviceTitle: {
  fontSize: 14,
  letterSpacing: 2,
  marginTop: 14,
  color: '#000',
  fontFamily: 'Helvetica',
},

  serviceDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    fontFamily: 'Helvetica', 
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  // Hero Banner Skeleton styles
  bannerSkeleton: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  exploreButtonSkeleton: {
    width: width * 0.5,
    height: height * 0.05,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
  },
  indicatorSkeleton: {
    width: 8,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  // // Banner text overlay styles
  // bannerTextOverlay: {
  //   position: 'absolute',
  //   bottom: 30,
  //   left: 40,
  //   alignItems: 'flex-start',
  // },
  // bannerTitleTop: {
  //   fontWeight: '700',
  //   fontSize: 34,
  //   color: '#fff',
  //   fontStyle: 'italic',
  //   fontFamily: Platform.OS === 'ios' ?'TenorSans' : 'TenorSans-Regular',
  // },
  // bannerTitleBottom: {
  //   fontSize: 14,
  //   color: '#fff',
  //   letterSpacing: 3,
  //   marginTop: -4,
  //   fontFamily: Platform.OS === 'ios' ? 'Inter' : 'TenorSans-Regular',
  // },
});

export default HomeScreen;
