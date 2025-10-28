import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export default function Card({ 
  children, 
  onPress, 
  style, 
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  testID
}: CardProps) {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  const cardStyle = [
    styles.container,
    disabled && styles.disabled,
    loading && styles.loading,
    style
  ];
  
  const accessibilityProps = onPress ? {
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel || 'Card button',
    accessibilityHint: accessibilityHint,
    accessibilityState: {
      disabled: disabled || loading
    },
    testID: testID
  } : {
    accessible: true,
    accessibilityRole: 'none' as const,
    testID: testID
  };
  
  return (
    <CardComponent 
      style={cardStyle} 
      onPress={disabled || loading ? undefined : onPress}
      activeOpacity={onPress ? 0.7 : 1}
      {...accessibilityProps}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        children
      )}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  loading: {
    opacity: 0.8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});