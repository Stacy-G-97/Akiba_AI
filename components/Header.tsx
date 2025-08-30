import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Settings } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
}

export default function Header({ 
  title, 
  subtitle, 
  showNotifications = true, 
  showSettings = true 
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      <View style={styles.actionsContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Akiba AI</Text>
        </View>
        {showNotifications && (
          <TouchableOpacity style={styles.actionButton}>
            <Bell size={24} color="#374151" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        )}
        {showSettings && (
          <TouchableOpacity style={styles.actionButton}>
            <Settings size={24} color="#374151" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    marginRight: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97706',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});