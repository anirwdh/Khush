/**
 * Light Haptic Feedback Utility
 * Provides subtle haptic feedback similar to Instagram/Swiggy
 * Uses native haptic feedback (not vibration) for a light, refined feel
 */
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const hapticOptions = {
  enableVibrateFallback: false, // Disable vibration fallback - we want pure haptic
  ignoreAndroidSystemSettings: false, // Respect Android system settings
};

/**
 * Trigger a light haptic feedback (like Instagram/Swiggy)
 * Uses native haptic feedback for a subtle, refined tactile response
 */
export const triggerLightHaptic = () => {
  try {
    // Use 'impactLight' for a very subtle haptic feedback
    // This provides a light tap feel without full vibration
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
  } catch (error) {
    // Silently fail if haptics are not available
    // This prevents crashes on devices without haptic support
  }
};

/**
 * Trigger a medium haptic feedback
 */
export const triggerMediumHaptic = () => {
  try {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
  } catch (error) {
    // Silently fail if haptics are not available
  }
};

/**
 * Trigger a strong haptic feedback
 */
export const triggerStrongHaptic = () => {
  try {
    ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
  } catch (error) {
    // Silently fail if haptics are not available
  }
};

/**
 * Trigger an AirDrop-style haptic feedback (like Apple's AirDrop)
 * Creates a smooth, distinctive haptic that mimics Apple's AirDrop vibration pattern
 * Uses notificationSuccess for that characteristic AirDrop feel
 */
export const triggerWaterDropletHaptic = () => {
  try {
    // Use notificationSuccess for the smooth, distinctive AirDrop-like haptic
    // This provides the same feel as Apple's AirDrop vibration
    ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
    setTimeout(() => {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }, 400);
  } catch (error) {
    // Silently fail if haptics are not available
  }
};
