/**
 * OfflineService.ts
 * 
 * This service handles offline functionality for low-connectivity areas
 * It stores data locally and syncs when connection is available
 * 
 * BEGINNER NOTE: This ensures the app works even without internet
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OfflineData {
  id: string;
  type: 'inventory' | 'prediction' | 'sale' | 'waste';
  data: any;
  timestamp: number;
  synced: boolean;
}

/**
 * BEGINNER EXPLANATION:
 * This class manages data when there's no internet connection
 * It saves everything locally and uploads when connection returns
 */
export class OfflineService {
  
  /**
   * Save data locally for offline use
   * BEGINNER NOTE: Like saving a file on your phone that you can access anytime
   */
  static async saveOfflineData(type: string, data: any): Promise<void> {
    try {
      const offlineItem: OfflineData = {
        id: Date.now().toString(),
        type: type as any,
        data,
        timestamp: Date.now(),
        synced: false
      };
      
      // Get existing offline data
      const existingData = await this.getOfflineData();
      existingData.push(offlineItem);
      
      // Save back to storage
      await AsyncStorage.setItem('offline_data', JSON.stringify(existingData));
      
      console.log(`Saved ${type} data offline:`, data);
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }
  
  /**
   * Get all data stored offline
   * BEGINNER NOTE: Retrieves all the data we saved when offline
   */
  static async getOfflineData(): Promise<OfflineData[]> {
    try {
      const data = await AsyncStorage.getItem('offline_data');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline data:', error);
      return [];
    }
  }
  
  /**
   * Sync offline data when connection is restored
   * BEGINNER NOTE: Uploads all saved data when internet comes back
   */
  static async syncOfflineData(): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      const unsyncedData = offlineData.filter(item => !item.synced);
      
      if (unsyncedData.length === 0) {
        console.log('No data to sync');
        return;
      }
      
      console.log(`Syncing ${unsyncedData.length} offline items...`);
      
      // Simulate API calls to sync data
      for (const item of unsyncedData) {
        await this.uploadDataItem(item);
        item.synced = true;
      }
      
      // Update storage with synced status
      await AsyncStorage.setItem('offline_data', JSON.stringify(offlineData));
      
      console.log('Offline data sync completed');
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }
  
  /**
   * Upload individual data item to server
   * BEGINNER NOTE: Sends one piece of data to the cloud
   */
  private static async uploadDataItem(item: OfflineData): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In production, this would make actual API calls based on data type
    switch (item.type) {
      case 'inventory':
        console.log('Uploading inventory data:', item.data);
        break;
      case 'prediction':
        console.log('Uploading prediction data:', item.data);
        break;
      case 'sale':
        console.log('Uploading sale data:', item.data);
        break;
      case 'waste':
        console.log('Uploading waste data:', item.data);
        break;
    }
  }
  
  /**
   * Check if device is online
   * BEGINNER NOTE: Tests if we have internet connection
   */
  static async isOnline(): Promise<boolean> {
    try {
      // Simple connectivity test
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  /**
   * Get cached predictions for offline use
   * BEGINNER NOTE: Shows predictions we calculated earlier when offline
   */
  static async getCachedPredictions(): Promise<any[]> {
    try {
      const cached = await AsyncStorage.getItem('cached_predictions');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting cached predictions:', error);
      return [];
    }
  }
  
  /**
   * Cache predictions for offline use
   * BEGINNER NOTE: Saves predictions so we can show them without internet
   */
  static async cachePredictions(predictions: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cached_predictions', JSON.stringify(predictions));
      console.log('Predictions cached for offline use');
    } catch (error) {
      console.error('Error caching predictions:', error);
    }
  }
}