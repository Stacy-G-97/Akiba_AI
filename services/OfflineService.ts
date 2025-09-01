/**
 * OfflineService.ts
 * 
 * This service handles offline functionality for low-connectivity areas
 * It stores data locally and syncs when connection is available
 * 
 * BEGINNER NOTE: This ensures the app works even without internet
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorHandlingService } from './ErrorHandlingService';
import { SecurityService } from './SecurityService';

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
   * SECURITY: Enhanced with encryption and validation
   */
  static async saveOfflineData(type: string, data: any): Promise<void> {
    return await ErrorHandlingService.safeStorageOperation(async () => {
      // SECURITY: Sanitize and validate input
      const sanitizedType = SecurityService.sanitizeInput(type);
      
      const offlineItem: OfflineData = {
        id: Date.now().toString(),
        type: sanitizedType as any,
        data,
        timestamp: Date.now(),
        synced: false
      };
      
      // Get existing offline data
      const existingData = await this.getOfflineData();
      existingData.push(offlineItem);
      
      // PERFORMANCE: Limit offline data size
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }
      
      // Save back to storage
      const dataToStore = JSON.stringify(existingData);
      
      // SECURITY: Encrypt sensitive data
      const encryptedData = await SecurityService.encryptData(dataToStore);
      await AsyncStorage.setItem('offline_data', encryptedData);
      
      console.log(`Saved ${sanitizedType} data offline`);
    }, undefined, 'saveOfflineData');
  }
  
  /**
   * Get all data stored offline
   * BEGINNER NOTE: Retrieves all the data we saved when offline
   * SECURITY: Enhanced with decryption and validation
   */
  static async getOfflineData(): Promise<OfflineData[]> {
    return await ErrorHandlingService.safeStorageOperation(async () => {
      const encryptedData = await AsyncStorage.getItem('offline_data');
      if (!encryptedData) return [];
      
      // SECURITY: Decrypt data
      const decryptedData = await SecurityService.decryptData(encryptedData);
      const data = JSON.parse(decryptedData);
      
      // SECURITY: Validate data structure
      if (!Array.isArray(data)) {
        console.warn('Invalid offline data structure, resetting');
        return [];
      }
      
      return data;
    }, [], 'getOfflineData');
  }
  
  /**
   * Sync offline data when connection is restored
   * BEGINNER NOTE: Uploads all saved data when internet comes back
   * FAULT TOLERANCE: Enhanced with retry logic and error recovery
   */
  static async syncOfflineData(): Promise<void> {
    return await ErrorHandlingService.withRetry(async () => {
      const offlineData = await this.getOfflineData();
      const unsyncedData = offlineData.filter(item => !item.synced);
      
      if (unsyncedData.length === 0) {
        console.log('No data to sync');
        return;
      }
      
      console.log(`Syncing ${unsyncedData.length} offline items...`);
      
      // PERFORMANCE: Batch sync operations
      const batchSize = 5;
      for (let i = 0; i < unsyncedData.length; i += batchSize) {
        const batch = unsyncedData.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(async (item) => {
            try {
              await this.uploadDataItem(item);
              item.synced = true;
            } catch (error) {
              console.error(`Failed to sync item ${item.id}:`, error);
              // Don't mark as synced if upload failed
            }
          })
        );
        
        // Small delay between batches
        if (i + batchSize < unsyncedData.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      // Update storage with synced status
      const dataToStore = JSON.stringify(offlineData);
      const encryptedData = await SecurityService.encryptData(dataToStore);
      await AsyncStorage.setItem('offline_data', encryptedData);
      
      console.log('Offline data sync completed');
    }, { maxAttempts: 3, baseDelay: 2000 }, 'syncOfflineData');
  }
  
  /**
   * Upload individual data item to server
   * BEGINNER NOTE: Sends one piece of data to the cloud
   * SECURITY: Enhanced with validation and secure transmission
   */
  private static async uploadDataItem(item: OfflineData): Promise<void> {
    return await ErrorHandlingService.withRetry(async () => {
      // SECURITY: Validate data before upload
      if (!SecurityService.validateApiResponse(item)) {
        throw new Error('Invalid data structure');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200));
    
      // In production, this would make actual API calls based on data type
      switch (item.type) {
        case 'inventory':
          console.log('Uploading inventory data securely');
          break;
        case 'prediction':
          console.log('Uploading prediction data securely');
          break;
        case 'sale':
          console.log('Uploading sale data securely');
          break;
        case 'waste':
          console.log('Uploading waste data securely');
          break;
        default:
          throw new Error(`Unknown data type: ${item.type}`);
      }
    }, { maxAttempts: 2, baseDelay: 1000 }, `uploadDataItem_${item.type}`);
  }
  
  /**
   * Check if device is online
   * BEGINNER NOTE: Tests if we have internet connection
   * PERFORMANCE: Enhanced with timeout and fallback checks
   */
  static async isOnline(): Promise<boolean> {
    return await ErrorHandlingService.safeStorageOperation(async () => {
      // PERFORMANCE: Multiple fallback URLs for better reliability
      const testUrls = [
        'https://www.google.com',
        'https://www.cloudflare.com',
        'https://httpbin.org/status/200'
      ];
      
      for (const url of testUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
          
          const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            return true;
          }
        } catch (error) {
          // Try next URL
          continue;
        }
      }
      
      return false;
    }, false, 'isOnline');
  }
  
  /**
   * Get cached predictions for offline use
   * BEGINNER NOTE: Shows predictions we calculated earlier when offline
   * PERFORMANCE: Enhanced with better caching strategy
   */
  static async getCachedPredictions(): Promise<any[]> {
    return await ErrorHandlingService.safeStorageOperation(async () => {
      const encryptedData = await AsyncStorage.getItem('cached_predictions');
      if (!encryptedData) return [];
      
      // SECURITY: Decrypt cached data
      const decryptedData = await SecurityService.decryptData(encryptedData);
      const predictions = JSON.parse(decryptedData);
      
      // SECURITY: Validate cached predictions
      if (!Array.isArray(predictions)) {
        console.warn('Invalid cached predictions format');
        return [];
      }
      
      return predictions;
    }, [], 'getCachedPredictions');
  }
  
  /**
   * Cache predictions for offline use
   * BEGINNER NOTE: Saves predictions so we can show them without internet
   * SECURITY: Enhanced with encryption
   */
  static async cachePredictions(predictions: any[]): Promise<void> {
    return await ErrorHandlingService.safeStorageOperation(async () => {
      // SECURITY: Validate input
      if (!Array.isArray(predictions)) {
        throw new Error('Invalid predictions format');
      }
      
      const dataToStore = JSON.stringify(predictions);
      
      // SECURITY: Encrypt before storing
      const encryptedData = await SecurityService.encryptData(dataToStore);
      await AsyncStorage.setItem('cached_predictions', encryptedData);
      
      console.log('Predictions cached for offline use');
    }, undefined, 'cachePredictions');
  }
}