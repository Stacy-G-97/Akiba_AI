import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export default function Card({ children, onPress, style }: CardProps) {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
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
});