import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, Dimensions, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Video from 'react-native-video';
import MenuIcon from '../../assets/Icons/MenuIcon';
import SearchIcon from '../../assets/Icons/SearchIcon';
import LogoIcon from '../../assets/Icons/logoicon.jsx';
import LoginBg from '../../assets/Icons/LoginBg.jsx';
import MainLogo from '../../assets/Icons/MainLogo.jsx';
import Meeting from '../../assets/Icons/Meeting.jsx';
import Delievry from '../../assets/Icons/Delievry.jsx';
import Return from '../../assets/Icons/Return.jsx';
import Assistance from '../../assets/Icons/Assistance.jsx';
import BrandSection from '../../assets/Icons/BrandSection';
import BottomTabBar from '../../Components/BottomTabBar.jsx';
import JustForYouSection from '../../Components/JustForYouSection.jsx';
import LocationIcon from '../../assets/Icons/LocationIcon.jsx';
import { getFontFamily } from '../../utils/fontLoader';
import { useGeolocation } from '../../hooks/useGeolocation';
import { clearLocationError } from '../../redux/slices/locationSlice';
import { getAllSections } from '../../config/sections.config';
import SectionRenderer from '../../Components/DynamicSections/SectionRenderer';
import { useFocusEffect } from '@react-navigation/native';
import { getFeaturedVideos } from '../../services/featuredVideosService';
import { getCategories } from '../../services/subcategoryService';

const { width, height } = Dimensions.get('window');

// Memoized Brand Section Component
const BrandSectionComponent = React.memo(() => {
  return (
    <View style={styles.brandSection}>
      <BrandSection width={width} height={157} />
    </View>
  );
});

// Memoized Collection Section Component
const CollectionSection = React.memo(() => {
  const navigation = useNavigation();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState({});

  // Fetch collections from API
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await getCategories({ page: 1, limit: 10 });
        if (response && response.categories) {
          const transformedData = response.categories.map(category => ({
            id: category._id,
            title: category.name.toUpperCase(),
            image: { uri: category.imageUrl },
          }));
          setCollections(transformedData);
        }
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

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

  // Show loading state
  if (loading) {
    return (
      <View style={styles.collectionSection}>
        <Text style={styles.sectionTitle}>COLLECTIONS</Text>
        <View style={styles.collectionLoadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </View>
    );
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
      />
    </View>
  );
});

// Memoized Services Section Component
const ServicesSection = React.memo(() => {
  const services = [
    {
      id: '1',
      icon: Meeting,
      title: 'VIRTUAL APPOINTMENT',
      desc: 'Book your personal styling session with our head stylist. Set up a one-on-one appointment for fashion advice.',
    },
    {
      id: '2',
      icon: Delievry,
      title: 'GLOBAL SHIPPING',
      desc: 'We offer fast and reliable free shipping options within India, ensuring timely delivery.',
    },
    {
      id: '3',
      icon: Return,
      title: 'RISK-FREE PURCHASE',
      desc: 'Enjoy 4 days to exchange or return your product for a seamless shopping experience.',
    },
    {
      id: '4',
      icon: Assistance,
      title: 'ONLINE ASSISTANCE',
      desc: 'Our friendly customer support team is available to assist you with any queries.',
    },
  ];

  return (
    <View style={styles.servicesSection}>
      
      {/* Brand */}
      <View style={styles.brandBlock}>
        <MainLogo width={48} height={48} />
        <LogoIcon width={120} height={40} />
      </View>

      {/* Services */}
      {services.map(item => (
        <View key={item.id} style={styles.serviceItem}>
          <item.icon width={36} height={36} />
          <Text style={styles.serviceTitle}>{item.title}</Text>
          <Text style={styles.serviceDesc}>{item.desc}</Text>
        </View>
      ))}
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
const HeroBanner = React.memo(({ bannerImages, currentBannerIndex, scrollViewRef, handleBannerScroll, navigation }) => {
  const setFlatListRef = useCallback((ref) => {
    if (ref && scrollViewRef) {
      scrollViewRef.current = ref;
    }
  }, [scrollViewRef]);
  
  return (
    <View style={styles.bannerContainer}>
      <FlatList
        ref={setFlatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleBannerScroll}
        data={bannerImages}
        keyExtractor={(item, index) => `banner-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.bannerSlide}>
            <Image 
              source={item} 
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
        )}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        removeClippedSubviews={Platform.OS === 'android'}
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

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(1);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [videoVisible, setVideoVisible] = useState(false);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const scrollViewRef = useRef(null);
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

  // Get location state from Redux
  const location = useSelector((state) => state.location);

  // Fetch featured videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setVideosLoading(true);
        const videos = await getFeaturedVideos({ page: 'home' });
        setFeaturedVideos(videos);
      } catch (error) {
        console.error('Error fetching featured videos:', error);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideos();
  }, []);

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

  // Control video visibility based on screen focus
  useFocusEffect(
    useCallback(() => {
      // Screen is focused - video should be visible
      setVideoVisible(true);
      return () => {
        // Screen is unfocused - pause video
        setVideoVisible(false);
      };
    }, [])
  );

  // Banner images array
  const bannerImages = [
    require('../../assets/Images/image.png'),
    require('../../assets/Images/Image2.png'),
    require('../../assets/Images/Image3.png'),
  ];

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

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    // Navigation is now handled in BottomTabBar component
  };

  const handleExploreCollection = () => {
    navigation.navigate('CollectionListing', { collectionName: "All" });
  };

  // Memoized sections data using dynamic configuration
  const sectionsData = useMemo(() => {
    const dynamicSections = getAllSections();
    return [
      { type: 'hero', id: 'hero' },
      ...dynamicSections.map(section => ({ type: 'dynamic', id: section.id, data: section })),
      { type: 'brand', id: 'brand' },
      { type: 'collection', id: 'collection' },
    ];
  }, []);

  // Optimized scroll handler
  const handleBannerScroll = useCallback((event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(contentOffset.x / width);
    setCurrentBannerIndex(currentIndex);
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
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          data={sectionsData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.type === 'hero') {
              return (
                <HeroBanner
                  bannerImages={bannerImages}
                  currentBannerIndex={currentBannerIndex}
                  scrollViewRef={scrollViewRef}
                  handleBannerScroll={handleBannerScroll}
                  navigation={navigation}
                />
              );
            } else if (item.type === 'dynamic') {
              return <SectionRenderer section={item.data} />;
            } else if (item.type === 'brand') {
              return <BrandSectionComponent />;
            } else if (item.type === 'collection') {
              return <CollectionSection />;
            }
            return null;
          }}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={6}
          initialNumToRender={2}
          ListFooterComponent={
            <>
              <VideoSection 
                isVisible={videoVisible} 
                videoData={featuredVideos[0]} 
              />
              <JustForYouSection />
              <ServicesSection />
            </>
          }
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
  collectionLoadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default HomeScreen;
