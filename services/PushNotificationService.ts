/**
 * PushNotificationService.ts
 * 
 * Production-ready push notification service using Expo Notifications
 * Handles local and remote notifications for the Akiba AI app
 * 
 * NOTIFICATION NOTE: Provides real-time alerts and updates to users
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  trigger: Notifications.NotificationTriggerInput;
  data?: any;
}

/**
 * PRODUCTION NOTIFICATION EXPLANATION:
 * This service handles all notification functionality including
 * local notifications, push notifications, and notification permissions
 */
export class PushNotificationService {
  
  private static isInitialized = false;
  
  /**
   * Initialize the notification service
   * NOTIFICATION: Sets up notification handlers and permissions
   */
  static async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
      
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }
      
      // Get push token for remote notifications
      if (Platform.OS !== 'web') {
        const token = await Notifications.getExpoPushTokenAsync();
        await this.storePushToken(token.data);
      }
      
      this.isInitialized = true;
      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }
  
  /**
   * Send immediate local notification
   * NOTIFICATION: Shows notification right away
   */
  static async sendImmediateNotification(notification: NotificationData): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false,
        },
        trigger: null, // Immediate
      });
      
      console.log('Immediate notification sent:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      return null;
    }
  }
  
  /**
   * Schedule a notification for later
   * NOTIFICATION: Schedules notification to show at specific time
   */
  static async scheduleNotification(notification: ScheduledNotification): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
        },
        trigger: notification.trigger,
      });
      
      // Store scheduled notification for tracking
      await this.storeScheduledNotification({
        ...notification,
        id: notificationId,
      });
      
      console.log('Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }
  
  /**
   * Cancel a scheduled notification
   * NOTIFICATION: Removes scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await this.removeScheduledNotification(notificationId);
      console.log('Notification cancelled:', notificationId);
      return true;
    } catch (error) {
      console.error('Error cancelling notification:', error);
      return false;
    }
  }
  
  /**
   * Cancel all scheduled notifications
   * NOTIFICATION: Removes all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<boolean> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await this.clearScheduledNotifications();
      console.log('All notifications cancelled');
      return true;
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      return false;
    }
  }
  
  /**
   * Get all scheduled notifications
   * NOTIFICATION: Returns list of scheduled notifications
   */
  static async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled.map(notification => ({
        id: notification.identifier,
        title: notification.content.title || '',
        body: notification.content.body || '',
        trigger: notification.trigger,
        data: notification.content.data,
      }));
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
  
  /**
   * Schedule notification for expiring items
   * NOTIFICATION: Alerts about items expiring soon
   */
  static async scheduleExpiringItemAlert(itemName: string, expiryDate: Date): Promise<string | null> {
    const hoursUntilExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60);
    
    if (hoursUntilExpiry <= 0) {
      return null; // Already expired
    }
    
    // Schedule notification 2 hours before expiry
    const notificationTime = new Date(expiryDate.getTime() - (2 * 60 * 60 * 1000));
    
    return await this.scheduleNotification({
      id: `expiring_${itemName}_${Date.now()}`,
      title: 'Item Expiring Soon!',
      body: `${itemName} will expire in 2 hours. Consider promoting or sharing with community.`,
      trigger: {
        date: notificationTime,
      },
      data: {
        type: 'expiring_item',
        itemName,
        expiryDate: expiryDate.toISOString(),
      },
    });
  }
  
  /**
   * Schedule low stock alert
   * NOTIFICATION: Alerts about low stock levels
   */
  static async scheduleLowStockAlert(itemName: string, currentStock: number, recommendedStock: number): Promise<string | null> {
    return await this.scheduleNotification({
      id: `low_stock_${itemName}_${Date.now()}`,
      title: 'Low Stock Alert',
      body: `${itemName} is running low (${currentStock} units). Recommended: ${recommendedStock} units.`,
      trigger: {
        seconds: 60, // Show in 1 minute
      },
      data: {
        type: 'low_stock',
        itemName,
        currentStock,
        recommendedStock,
      },
    });
  }
  
  /**
   * Schedule high demand prediction alert
   * NOTIFICATION: Alerts about predicted high demand
   */
  static async scheduleHighDemandAlert(itemName: string, predictedDemand: number, confidence: number): Promise<string | null> {
    return await this.scheduleNotification({
      id: `high_demand_${itemName}_${Date.now()}`,
      title: 'High Demand Predicted',
      body: `AI predicts ${predictedDemand} units of ${itemName} needed (${confidence}% confidence).`,
      trigger: {
        seconds: 30, // Show in 30 seconds
      },
      data: {
        type: 'high_demand',
        itemName,
        predictedDemand,
        confidence,
      },
    });
  }
  
  /**
   * Store push token for remote notifications
   * NOTIFICATION: Saves token for server communication
   */
  private static async storePushToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('expo_push_token', token);
      console.log('Push token stored:', token);
      
      // In production, send token to your backend server
      // await this.sendTokenToServer(token);
    } catch (error) {
      console.error('Error storing push token:', error);
    }
  }
  
  /**
   * Get stored push token
   * NOTIFICATION: Retrieves stored push token
   */
  static async getPushToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('expo_push_token');
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }
  
  /**
   * Store scheduled notification for tracking
   * NOTIFICATION: Keeps track of scheduled notifications
   */
  private static async storeScheduledNotification(notification: ScheduledNotification): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem('scheduled_notifications');
      const notifications = existing ? JSON.parse(existing) : [];
      
      notifications.push(notification);
      
      await AsyncStorage.setItem('scheduled_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing scheduled notification:', error);
    }
  }
  
  /**
   * Remove scheduled notification from tracking
   * NOTIFICATION: Removes notification from tracking
   */
  private static async removeScheduledNotification(notificationId: string): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem('scheduled_notifications');
      const notifications = existing ? JSON.parse(existing) : [];
      
      const filtered = notifications.filter((n: ScheduledNotification) => n.id !== notificationId);
      
      await AsyncStorage.setItem('scheduled_notifications', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing scheduled notification:', error);
    }
  }
  
  /**
   * Clear all scheduled notifications from tracking
   * NOTIFICATION: Clears notification tracking
   */
  private static async clearScheduledNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem('scheduled_notifications');
    } catch (error) {
      console.error('Error clearing scheduled notifications:', error);
    }
  }
  
  /**
   * Check notification permissions
   * NOTIFICATION: Verifies if notifications are allowed
   */
  static async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }
  
  /**
   * Request notification permissions
   * NOTIFICATION: Asks user for notification permission
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
}
