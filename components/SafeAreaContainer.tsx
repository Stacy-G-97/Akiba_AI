import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
}

export default function SafeAreaContainer({ 
  children, 
  backgroundColor = '#F9FAFB',
  statusBarStyle = 'dark-content'
}: SafeAreaContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      <View style={[
        styles.content, 
        { 
          paddingTop: Platform.OS === 'ios' ? insets.top : 0,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
        }
      ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});