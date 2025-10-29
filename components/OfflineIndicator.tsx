import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { WifiOff, Wifi } from 'lucide-react-native';

interface OfflineIndicatorProps {
  isOnline: boolean;
  show?: boolean;
}

export default function OfflineIndicator({ isOnline, show = true }: OfflineIndicatorProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: show ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [show, fadeAnim]);

  if (!show) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isOnline ? '#10B981' : '#EF4444',
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.content}>
        {isOnline ? (
          <Wifi size={16} color="#FFFFFF" />
        ) : (
          <WifiOff size={16} color="#FFFFFF" />
        )}
        <Text style={styles.text}>
          {isOnline ? 'Back Online' : 'Offline Mode'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
