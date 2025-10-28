/**
 * ErrorHandlingService.ts
 * 
 * Comprehensive error handling and fault tolerance for Akiba AI
 * Ensures the app remains stable and provides helpful error messages
 * 
 * FAULT TOLERANCE NOTE: This service helps the app recover from errors gracefully
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface ErrorLog {
  id: string;
  timestamp: number;
  type: 'network' | 'storage' | 'prediction' | 'payment' | 'general';
  message: string;
  stack?: string;
  userAction?: string;
  resolved: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
}

/**
 * FAULT TOLERANCE EXPLANATION:
 * This service implements robust error handling to keep the app working
 * even when things go wrong (network issues, server problems, etc.)
 */
export class ErrorHandlingService {
  
  private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  };

  /**
   * Execute function with automatic retry logic
   * FAULT TOLERANCE: Automatically retries failed operations
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context: string = 'unknown'
  ): Promise<T> {
    const retryConfig = { ...this.DEFAULT_RETRY_CONFIG, ...config };
    let lastError: Error;
    
    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Log successful retry if it wasn't the first attempt
        if (attempt > 1) {
          console.log(`Operation succeeded on attempt ${attempt} for ${context}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Log the error
        await this.logError({
          type: 'general',
          message: `Attempt ${attempt}/${retryConfig.maxAttempts} failed for ${context}: ${lastError.message}`,
          stack: lastError.stack,
          userAction: context
        });
        
        // Don't retry on the last attempt
        if (attempt === retryConfig.maxAttempts) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        );
        
        console.log(`Retrying ${context} in ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // All attempts failed
    throw new Error(`Operation failed after ${retryConfig.maxAttempts} attempts: ${lastError!.message}`);
  }

  /**
   * Handle network errors gracefully
   * FAULT TOLERANCE: Provides fallback for network issues
   */
  static async handleNetworkError<T>(
    networkOperation: () => Promise<T>,
    fallbackOperation?: () => Promise<T>,
    context: string = 'network_operation'
  ): Promise<T | null> {
    try {
      return await this.withRetry(networkOperation, {
        maxAttempts: 2,
        baseDelay: 2000
      }, context);
    } catch (networkError) {
      await this.logError({
        type: 'network',
        message: `Network operation failed: ${context}`,
        stack: (networkError as Error).stack,
        userAction: context
      });
      
      // Try fallback operation if available
      if (fallbackOperation) {
        try {
          console.log(`Using fallback for ${context}`);
          return await fallbackOperation();
        } catch (fallbackError) {
          await this.logError({
            type: 'network',
            message: `Fallback also failed for ${context}`,
            stack: (fallbackError as Error).stack,
            userAction: context
          });
        }
      }
      
      return null; // Return null instead of throwing to allow app to continue
    }
  }

  /**
   * Safe storage operations with error recovery
   * FAULT TOLERANCE: Handles storage failures gracefully
   */
  static async safeStorageOperation<T>(
    operation: () => Promise<T>,
    fallbackValue: T,
    context: string = 'storage_operation'
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      await this.logError({
        type: 'storage',
        message: `Storage operation failed: ${context}`,
        stack: (error as Error).stack,
        userAction: context
      });
      
      console.warn(`Storage operation failed for ${context}, using fallback value`);
      return fallbackValue;
    }
  }

  /**
   * Log errors for debugging and monitoring
   * FAULT TOLERANCE: Tracks errors to improve app stability
   */
  static async logError(errorData: Omit<ErrorLog, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    try {
      const errorLog: ErrorLog = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        resolved: false,
        ...errorData
      };
      
      // Get existing error logs
      const existingLogs = await AsyncStorage.getItem('error_logs');
      const logs: ErrorLog[] = existingLogs ? JSON.parse(existingLogs) : [];
      
      logs.push(errorLog);
      
      // Keep only last 50 errors to prevent storage bloat
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }
      
      await AsyncStorage.setItem('error_logs', JSON.stringify(logs));
      
      // In production, also send critical errors to monitoring service
      if (errorData.type === 'payment' || errorData.message.includes('critical')) {
        console.error('CRITICAL ERROR:', errorData);
        // Send to monitoring service like Sentry or Bugsnag
      }
      
    } catch (loggingError) {
      // Even error logging can fail - use console as last resort
      console.error('Failed to log error:', loggingError);
      console.error('Original error:', errorData);
    }
  }

  /**
   * Get error statistics for monitoring
   * FAULT TOLERANCE: Helps identify patterns in app failures
   */
  static async getErrorStatistics(): Promise<any> {
    try {
      const logs = await AsyncStorage.getItem('error_logs');
      if (!logs) return { totalErrors: 0, errorsByType: {} };

      const errorLogs: ErrorLog[] = JSON.parse(logs);
      const last24Hours = errorLogs.filter(log => 
        Date.now() - log.timestamp < 24 * 60 * 60 * 1000
      );

      const errorsByType = last24Hours.reduce((acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalErrors: last24Hours.length,
        errorsByType,
        mostCommonError: Object.keys(errorsByType).reduce((a, b) => 
          errorsByType[a] > errorsByType[b] ? a : b
        )
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { totalErrors: 0, errorsByType: {} };
    }
  }

  /**
   * Circuit breaker pattern for external services
   * FAULT TOLERANCE: Prevents cascading failures
   */
  static createCircuitBreaker(
    serviceName: string,
    failureThreshold: number = 5,
    resetTimeout: number = 60000 // 1 minute
  ) {
    let failures = 0;
    let lastFailureTime = 0;
    let state: 'closed' | 'open' | 'half-open' = 'closed';

    return async <T>(operation: () => Promise<T>): Promise<T> => {
      const now = Date.now();

      // Reset circuit breaker if enough time has passed
      if (state === 'open' && now - lastFailureTime > resetTimeout) {
        state = 'half-open';
        failures = 0;
      }

      // Reject immediately if circuit is open
      if (state === 'open') {
        throw new Error(`Circuit breaker open for ${serviceName}`);
      }

      try {
        const result = await operation();
        
        // Reset on success
        if (state === 'half-open') {
          state = 'closed';
          failures = 0;
        }
        
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = now;
        
        await this.logError({
          type: 'network',
          message: `Circuit breaker failure for ${serviceName}: ${(error as Error).message}`,
          userAction: `circuit_breaker_${serviceName}`
        });

        // Open circuit if threshold reached
        if (failures >= failureThreshold) {
          state = 'open';
          console.warn(`Circuit breaker opened for ${serviceName}`);
        }

        throw error;
      }
    };
  }

  /**
   * Graceful degradation for features
   * FAULT TOLERANCE: Provides basic functionality when advanced features fail
   */
  static async gracefulDegrade<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (primaryError) {
      await this.logError({
        type: 'general',
        message: `Primary operation failed for ${context}, using fallback`,
        stack: (primaryError as Error).stack,
        userAction: context
      });
      
      try {
        console.log(`Using fallback for ${context}`);
        return await fallbackOperation();
      } catch (fallbackError) {
        await this.logError({
          type: 'general',
          message: `Both primary and fallback failed for ${context}`,
          stack: (fallbackError as Error).stack,
          userAction: context
        });
        
        throw new Error(`All operations failed for ${context}`);
      }
    }
  }

  /**
   * Memory usage monitoring
   * PERFORMANCE: Prevents memory leaks and crashes
   */
  static monitorMemoryUsage(): void {
    if (Platform.OS === 'web' && 'memory' in performance) {
      const memInfo = (performance as any).memory;
      const usedMB = Math.round(memInfo.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memInfo.totalJSHeapSize / 1048576);
      
      console.log(`Memory usage: ${usedMB}MB / ${totalMB}MB`);
      
      // Warn if memory usage is high
      if (usedMB > totalMB * 0.8) {
        console.warn('High memory usage detected');
        this.logError({
          type: 'general',
          message: `High memory usage: ${usedMB}MB / ${totalMB}MB`,
          userAction: 'memory_monitoring'
        });
      }
    }
  }
}