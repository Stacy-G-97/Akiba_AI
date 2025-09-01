/**
 * PerformanceService.ts
 * 
 * Performance optimization service for Akiba AI
 * Ensures the app runs smoothly on all devices, including older ones
 * 
 * PERFORMANCE NOTE: Optimized for low-end devices common in Kenya
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface PerformanceMetrics {
  appStartTime: number;
  screenLoadTimes: Record<string, number>;
  apiResponseTimes: Record<string, number>;
  memoryUsage: number;
  cacheHitRate: number;
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiryTime: number;
}

/**
 * PERFORMANCE EXPLANATION:
 * This service optimizes app performance for smooth operation
 * It's especially important for users with older devices or slow connections
 */
export class PerformanceService {
  
  private static cache = new Map<string, CacheItem<any>>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 50; // Maximum cached items

  /**
   * Intelligent caching with automatic cleanup
   * PERFORMANCE: Reduces network calls and improves response times
   */
  static async cacheData<T>(key: string, data: T, customDuration?: number): Promise<void> {
    try {
      const expiryTime = Date.now() + (customDuration || this.CACHE_DURATION);
      
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiryTime
      };
      
      // Add to memory cache
      this.cache.set(key, cacheItem);
      
      // Cleanup old cache entries if we're at the limit
      if (this.cache.size > this.MAX_CACHE_SIZE) {
        this.cleanupCache();
      }
      
      // Also persist important data to AsyncStorage
      if (this.isImportantData(key)) {
        await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      }
      
    } catch (error) {
      console.error('Cache storage error:', error);
      // Don't throw - caching failure shouldn't break the app
    }
  }

  /**
   * Retrieve cached data with automatic expiry
   * PERFORMANCE: Fast data retrieval without network calls
   */
  static async getCachedData<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first (fastest)
      let cacheItem = this.cache.get(key);
      
      // If not in memory, check persistent storage
      if (!cacheItem && this.isImportantData(key)) {
        const stored = await AsyncStorage.getItem(`cache_${key}`);
        if (stored) {
          cacheItem = JSON.parse(stored);
          // Add back to memory cache
          if (cacheItem) {
            this.cache.set(key, cacheItem);
          }
        }
      }
      
      if (!cacheItem) {
        return null;
      }
      
      // Check if cache has expired
      if (Date.now() > cacheItem.expiryTime) {
        this.cache.delete(key);
        if (this.isImportantData(key)) {
          await AsyncStorage.removeItem(`cache_${key}`);
        }
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Clean up expired cache entries
   * PERFORMANCE: Prevents memory bloat
   */
  private static cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (now > item.expiryTime) {
        keysToDelete.push(key);
      }
    });
    
    // Remove oldest entries if still over limit
    if (this.cache.size - keysToDelete.length > this.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const entriesToRemove = sortedEntries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      entriesToRemove.forEach(([key]) => keysToDelete.push(key));
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`Cleaned up ${keysToDelete.length} cache entries`);
  }

  /**
   * Determine if data should be persisted to storage
   * PERFORMANCE: Only persist important data to save storage space
   */
  private static isImportantData(key: string): boolean {
    const importantKeys = ['predictions', 'inventory', 'user_subscription', 'market_data'];
    return importantKeys.some(important => key.includes(important));
  }

  /**
   * Debounce function calls to prevent excessive API calls
   * PERFORMANCE: Reduces unnecessary network requests
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle function calls to limit execution frequency
   * PERFORMANCE: Prevents overwhelming the system
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Measure and track performance metrics
   * PERFORMANCE: Identifies bottlenecks and slow operations
   */
  static async measurePerformance<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      // Log slow operations
      if (duration > 2000) { // More than 2 seconds
        console.warn(`Slow operation detected: ${operationName} took ${duration}ms`);
      }
      
      // Store performance metrics
      await this.recordPerformanceMetric(operationName, duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Operation failed: ${operationName} after ${duration}ms`);
      throw error;
    }
  }

  /**
   * Record performance metrics for analysis
   * PERFORMANCE: Tracks app performance over time
   */
  private static async recordPerformanceMetric(operation: string, duration: number): Promise<void> {
    try {
      const metricsKey = 'performance_metrics';
      const existing = await AsyncStorage.getItem(metricsKey);
      const metrics = existing ? JSON.parse(existing) : {};
      
      if (!metrics[operation]) {
        metrics[operation] = [];
      }
      
      metrics[operation].push({
        duration,
        timestamp: Date.now()
      });
      
      // Keep only last 20 measurements per operation
      if (metrics[operation].length > 20) {
        metrics[operation] = metrics[operation].slice(-20);
      }
      
      await AsyncStorage.setItem(metricsKey, JSON.stringify(metrics));
    } catch (error) {
      console.error('Error recording performance metric:', error);
    }
  }

  /**
   * Optimize images for better performance
   * PERFORMANCE: Reduces memory usage and load times
   */
  static optimizeImageUri(uri: string, width: number, height: number): string {
    // For Pexels images, add size parameters for optimization
    if (uri.includes('pexels.com')) {
      return `${uri}?auto=compress&cs=tinysrgb&w=${width}&h=${height}`;
    }
    
    return uri;
  }

  /**
   * Batch operations for better performance
   * PERFORMANCE: Reduces the number of individual operations
   */
  static async batchOperation<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    batchSize: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      try {
        const batchResults = await Promise.all(
          batch.map(item => operation(item))
        );
        results.push(...batchResults);
        
        // Small delay between batches to prevent overwhelming the system
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Batch operation failed for batch starting at index ${i}:`, error);
        // Continue with next batch instead of failing completely
      }
    }
    
    return results;
  }

  /**
   * Preload critical data for better user experience
   * PERFORMANCE: Loads important data in background
   */
  static async preloadCriticalData(): Promise<void> {
    try {
      console.log('Preloading critical data...');
      
      // Preload in background without blocking UI
      const preloadOperations = [
        () => this.getCachedData('market_patterns'),
        () => this.getCachedData('user_subscription'),
        () => this.getCachedData('recent_predictions')
      ];
      
      // Run preload operations with timeout
      await Promise.allSettled(
        preloadOperations.map(op => 
          Promise.race([
            op(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Preload timeout')), 5000)
            )
          ])
        )
      );
      
      console.log('Critical data preload completed');
    } catch (error) {
      console.error('Preload error:', error);
      // Don't throw - preload failure shouldn't break the app
    }
  }

  /**
   * Get performance recommendations
   * PERFORMANCE: Suggests optimizations based on usage patterns
   */
  static async getPerformanceRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    
    try {
      const metrics = await AsyncStorage.getItem('performance_metrics');
      if (!metrics) return recommendations;
      
      const performanceData = JSON.parse(metrics);
      
      // Analyze performance patterns
      Object.keys(performanceData).forEach(operation => {
        const measurements = performanceData[operation];
        const avgDuration = measurements.reduce((sum: number, m: any) => sum + m.duration, 0) / measurements.length;
        
        if (avgDuration > 3000) {
          recommendations.push(`${operation} is running slowly (${Math.round(avgDuration)}ms average)`);
        }
      });
      
      // Check cache hit rate
      const cacheSize = this.cache.size;
      if (cacheSize < 10) {
        recommendations.push('Consider enabling more aggressive caching for better performance');
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error getting performance recommendations:', error);
      return [];
    }
  }
}