import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

export default function SafeAreaContainer({ 
  children, 
  backgroundColor = '#F9FAFB' 
}: SafeAreaContainerProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          paddingTop: insets.top,
          backgroundColor 
        }
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});