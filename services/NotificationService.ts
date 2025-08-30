/**
 * NotificationService.ts
 * 
 * This service handles smart notifications and alerts for the app
 * It helps users stay informed about important events and recommendations
 * 
 * BEGINNER NOTE: This sends helpful reminders and alerts to users
 */

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'urgent';
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  actionRequired: boolean;
  relatedItem?: string;
}

/**
 * BEGINNER EXPLANATION:
 * This class creates smart notifications based on app data
 * It helps users know when to take action to prevent waste
 */
export class NotificationService {
  
  /**
   * Generate smart notifications based on current app state
   * BEGINNER NOTE: Creates helpful alerts based on what's happening in the app
   */
  static async generateSmartNotifications(): Promise<SmartNotification[]> {
    const notifications: SmartNotification[] = [];
    
    // Check for expiring items
    const expiringItems = await this.checkExpiringItems();
    notifications.push(...expiringItems);
    
    // Check for low stock items
    const lowStockItems = await this.checkLowStock();
    notifications.push(...lowStockItems);
    
    // Check for high demand predictions
    const demandAlerts = await this.checkHighDemandPredictions();
    notifications.push(...demandAlerts);
    
    // Check for surplus opportunities
    const surplusAlerts = await this.checkSurplusOpportunities();
    notifications.push(...surplusAlerts);
    
    return notifications.sort((a, b) => {
      // Sort by priority: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  /**
   * Check for items expiring soon
   * BEGINNER NOTE: Finds food that will go bad soon
   */
  private static async checkExpiringItems(): Promise<SmartNotification[]> {
    const notifications: SmartNotification[] = [];
    
    // Simulate checking inventory for expiring items
    const expiringItems = [
      { name: 'Tomatoes', days: 1, quantity: 15 },
      { name: 'Mchicha', days: 1, quantity: 8 },
      { name: 'Nyama (Beef)', days: 2, quantity: 8 }
    ];
    
    expiringItems.forEach(item => {
      if (item.days <= 1) {
        notifications.push({
          id: `expiring_${item.name}_${Date.now()}`,
          title: 'Urgent: Item Expiring Today!',
          message: `${item.quantity}kg of ${item.name} expires today. Consider promotion or community sharing.`,
          type: 'urgent',
          priority: 'high',
          timestamp: Date.now(),
          actionRequired: true,
          relatedItem: item.name
        });
      } else if (item.days <= 2) {
        notifications.push({
          id: `expiring_${item.name}_${Date.now()}`,
          title: 'Item Expiring Soon',
          message: `${item.quantity}kg of ${item.name} expires in ${item.days} days.`,
          type: 'warning',
          priority: 'medium',
          timestamp: Date.now(),
          actionRequired: true,
          relatedItem: item.name
        });
      }
    });
    
    return notifications;
  }
  
  /**
   * Check for low stock items
   * BEGINNER NOTE: Finds items that are running out
   */
  private static async checkLowStock(): Promise<SmartNotification[]> {
    const notifications: SmartNotification[] = [];
    
    // Simulate checking for low stock
    const lowStockItems = [
      { name: 'Sukuma Wiki', current: 5, recommended: 25 },
      { name: 'Chapati Flour', current: 8, recommended: 20 }
    ];
    
    lowStockItems.forEach(item => {
      if (item.current < item.recommended * 0.3) { // Less than 30% of recommended
        notifications.push({
          id: `low_stock_${item.name}_${Date.now()}`,
          title: 'Low Stock Alert',
          message: `${item.name} is running low (${item.current} units). Recommended to order ${item.recommended - item.current} more.`,
          type: 'warning',
          priority: 'medium',
          timestamp: Date.now(),
          actionRequired: true,
          relatedItem: item.name
        });
      }
    });
    
    return notifications;
  }
  
  /**
   * Check for high demand predictions
   * BEGINNER NOTE: Alerts when AI predicts high demand
   */
  private static async checkHighDemandPredictions(): Promise<SmartNotification[]> {
    const notifications: SmartNotification[] = [];
    
    // Simulate high demand predictions
    const highDemandItems = [
      { name: 'Chapati', predicted: 45, current: 20, confidence: 89 },
      { name: 'Mandazi', predicted: 30, current: 15, confidence: 92 }
    ];
    
    highDemandItems.forEach(item => {
      if (item.predicted > item.current * 1.5) { // 50% more than current stock
        notifications.push({
          id: `high_demand_${item.name}_${Date.now()}`,
          title: 'High Demand Predicted',
          message: `AI predicts ${item.predicted} units of ${item.name} needed (${item.confidence}% confidence). Current stock: ${item.current}.`,
          type: 'info',
          priority: 'medium',
          timestamp: Date.now(),
          actionRequired: true,
          relatedItem: item.name
        });
      }
    });
    
    return notifications;
  }
  
  /**
   * Check for surplus sharing opportunities
   * BEGINNER NOTE: Finds chances to share extra food with community
   */
  private static async checkSurplusOpportunities(): Promise<SmartNotification[]> {
    const notifications: SmartNotification[] = [];
    
    // Simulate surplus detection
    const surplusItems = [
      { name: 'Potatoes', surplus: 20, value: 1600 }
    ];
    
    surplusItems.forEach(item => {
      notifications.push({
        id: `surplus_${item.name}_${Date.now()}`,
        title: 'Surplus Sharing Opportunity',
        message: `You have ${item.surplus}kg surplus ${item.name} (worth KSh ${item.value}). Share with community to prevent waste.`,
        type: 'success',
        priority: 'low',
        timestamp: Date.now(),
        actionRequired: false,
        relatedItem: item.name
      });
    });
    
    return notifications;
  }
  
  /**
   * Schedule local notifications
   * BEGINNER NOTE: Sets up phone notifications for important alerts
   */
  static async scheduleNotification(notification: SmartNotification): Promise<void> {
    // In production, this would use Expo Notifications
    console.log('Scheduling notification:', notification.title);
    
    // Simulate notification scheduling
    setTimeout(() => {
      console.log('Notification triggered:', notification.message);
    }, 1000);
  }
  
  /**
   * Get notification settings
   * BEGINNER NOTE: Checks what types of notifications user wants
   */
  static async getNotificationSettings(): Promise<any> {
    try {
      const settings = await AsyncStorage.getItem('notification_settings');
      return settings ? JSON.parse(settings) : {
        expiring: true,
        lowStock: true,
        highDemand: true,
        surplus: true,
        dailySummary: true
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {};
    }
  }
  
  /**
   * Update notification settings
   * BEGINNER NOTE: Saves user preferences for notifications
   */
  static async updateNotificationSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
      console.log('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }
}