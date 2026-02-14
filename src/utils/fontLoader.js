import { Platform, StyleSheet } from 'react-native';

// Font utility for standard React Native projects
export const getFontFamily = () => {
  // Try the custom font first, then fallback to system fonts
  const customFont = Platform.OS === 'ios' ? 'TenorSans' : 'TenorSans-Regular';
  
  // For standard React Native, we need to use platform-specific fonts
  if (Platform.OS === 'ios') {
    // iOS font hierarchy - try custom font, then system fonts
    return customFont;
  } else if (Platform.OS === 'android') {
    // Android font hierarchy
    return customFont;
  }
  
  return customFont; // Default to custom font
};

// Get font with fallback - this will help if the custom font doesn't load
export const getFontWithFallback = () => {
  const customFont = getFontFamily();
  
  // Return an array of fonts to try (fallback mechanism)
  if (Platform.OS === 'ios') {
    return [customFont, 'Interfont', 'Helvetica Neue', 'Helvetica', 'Arial'];
  } else if (Platform.OS === 'android') {
    return [customFont, 'Interfont', 'Roboto', 'Arial', 'sans-serif'];
  }
  
  return [customFont, 'System'];
};

// Create a font style object with fallbacks
export const createFontStyle = (fontSize, fontWeight = 'normal', color = '#000') => {
  return StyleSheet.create({
    textStyle: {
      fontFamily: getFontFamily(),
      fontSize,
      fontWeight,
      color,
    }
  });
};

// Platform-specific font fallbacks
export const FONT_FALLBACKS = {
  ios: ['TenorSans', 'Interfont', 'Helvetica Neue', 'Helvetica', 'Arial'],
  android: ['TenorSans-Regular', 'Interfont', 'Roboto', 'Arial', 'sans-serif'],
  default: ['TenorSans', 'System'],
};
