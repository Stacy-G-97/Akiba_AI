/**
 * OfflineIndicator.tsx
 * 
 * A simple component that shows when the app is working offline
 * This helps users understand why some features might be limited
 * 
 * BEGINNER NOTE: This is like a "no internet" indicator on your phone
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { WifiOff, Wifi } from 'lucide-react-native';
import { OfflineService } from '@/services/OfflineService';

interface OfflineIndicatorProps {
  style?: any;
}

/**
 * BEGINNER EXPLANATION:
 * This component checks internet connection and shows a banner when offline
 * It helps users understand when the app is using cached data
 */
export default function OfflineIndicator({ style }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  /**
   * Check connection status when component loads
   * BEGINNER NOTE: This runs when the component first appears
   */
  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    // Cleanup when component is removed
    return () => clearInterval(interval);
  }, []);

  /**
   * Animate the indicator when connection status changes
   * BEGINNER NOTE: This makes the indicator smoothly appear/disappear
   */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isOnline ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline]);

  /**
   * Check if device has internet connection
   * BEGINNER NOTE: Tests if we can reach the internet
   */
  const checkConnection = async () => {
    const online = await OfflineService.isOnline();
    setIsOnline(online);
  };

  // Don't show anything if we're online
  if (isOnline) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        { opacity: fadeAnim }
      ]}
    >
      <WifiOff size={16} color="#FFFFFF" />
      <Text style={styles.text}>
        Offline Mode - Using cached data
      </Text>
      <View style={styles.pulse} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    position: 'relative',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
});