import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Settings } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
}

export default function Header({ 
  title, 
  subtitle, 
  showNotifications = true, 
  showSettings = true,
  onNotificationPress,
  onSettingsPress 
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
        
        <View style={styles.actions}>
          {showNotifications && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <Bell size={24} color="#6B7280" />
            </TouchableOpacity>
          )}
          
          {showSettings && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onSettingsPress}
              activeOpacity={0.7}
            >
              <Settings size={24} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});