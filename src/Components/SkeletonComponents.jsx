import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

// Base skeleton component with shimmer effect
const SkeletonBase = ({ style, children }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  return (
    <View style={[styles.skeletonBase, style]}>
      <Animated.View 
        style={[
          styles.shimmerOverlay, 
          { opacity: shimmerAnim }
        ]} 
      />
      {children}
    </View>
  );
};

// Skeleton for category tabs
export const TabSkeleton = () => (
  <SkeletonBase style={styles.tabSkeleton}>
    <View style={styles.tabTextSkeleton} />
    <View style={styles.tabIndicatorSkeleton} />
  </SkeletonBase>
);

// Skeleton for list items
export const ListItemSkeleton = () => (
  <SkeletonBase style={styles.listItemSkeleton}>
    <View style={styles.listTextSkeleton} />
  </SkeletonBase>
);

// Skeleton for loading multiple list items
export const ListSkeleton = ({ itemCount = 6 }) => (
  <>
    {Array.from({ length: itemCount }).map((_, index) => (
      <ListItemSkeleton key={index} />
    ))}
  </>
);

// Skeleton for tabs container
export const TabsSkeleton = ({ tabCount = 4 }) => (
  <>
    {Array.from({ length: tabCount }).map((_, index) => (
      <TabSkeleton key={index} />
    ))}
  </>
);

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  tabSkeleton: {
    alignItems: 'center',
    paddingHorizontal: 20,
    minWidth: 80,
    justifyContent: 'flex-start',
    minHeight: 50,
  },
  tabTextSkeleton: {
    width: 60,
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  tabIndicatorSkeleton: {
    marginTop: 10,
    width: 40,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  listItemSkeleton: {
    paddingVertical: 14,
  },
  listTextSkeleton: {
    width: '70%',
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
});

export default SkeletonBase;
