/**
 * PerformanceMonitoringService.ts
 * 
 * Production-ready performance monitoring service
 * Tracks app performance metrics and provides insights
 * 
 * PERFORMANCE NOTE: Monitors app performance in real-time
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: any;
}

export interface PerformanceReport {
  timestamp: number;
  metrics: PerformanceMetric[];
  summary: {
    averageResponseTime: number;
    slowestOperation: string;
    fastestOperation: string;
    totalOperations: number;
    errorRate: number;
  };
}

export interface MemoryInfo {
  used: number;
  total: number;
  limit: number;
  percentage: number;
}

/**
 * PRODUCTION PERFORMANCE EXPLANATION:
 * This service monitors app performance and provides insights
 * to help optimize the app for better user experience
 */
export class PerformanceMonitoringService {
  
  private static metrics: PerformanceMetric[] = [];
  private static readonly MAX_METRICS = 1000;
  private static readonly REPORT_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static reportTimer: NodeJS.Timeout | null = null;
  
  /**
   * Initialize performance monitoring
   * PERFORMANCE: Starts monitoring and reporting
   */
  static async initialize(): Promise<void> {
    try {
      // Load existing metrics
      await this.loadMetrics();
      
      // Start periodic reporting
      this.startPeriodicReporting();
      
      // Monitor memory usage
      this.startMemoryMonitoring();
      
      console.log('Performance monitoring initialized');
    } catch (error) {
      console.error('Error initializing performance monitoring:', error);
    }
  }
  
  /**
   * Record a performance metric
   * PERFORMANCE: Tracks operation performance
   */
  static recordMetric(name: string, value: number, metadata?: any): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };
    
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
    
    // Log slow operations
    if (value > 2000) { // More than 2 seconds
      console.warn(`Slow operation detected: ${name} took ${value}ms`);
    }
  }
  
  /**
   * Measure operation performance
   * PERFORMANCE: Wraps operations to measure their performance
   */
  static async measureOperation<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.recordMetric(name, duration, { success: true });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.recordMetric(name, duration, { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      throw error;
    }
  }
  
  /**
   * Get performance metrics
   * PERFORMANCE: Returns current performance data
   */
  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
  
  /**
   * Get performance report
   * PERFORMANCE: Generates comprehensive performance report
   */
  static generateReport(): PerformanceReport {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(
      metric => now - metric.timestamp < this.REPORT_INTERVAL
    );
    
    if (recentMetrics.length === 0) {
      return {
        timestamp: now,
        metrics: [],
        summary: {
          averageResponseTime: 0,
          slowestOperation: 'N/A',
          fastestOperation: 'N/A',
          totalOperations: 0,
          errorRate: 0,
        },
      };
    }
    
    // Calculate summary statistics
    const operationTimes = recentMetrics.map(m => m.value);
    const averageResponseTime = operationTimes.reduce((sum, time) => sum + time, 0) / operationTimes.length;
    
    const slowestMetric = recentMetrics.reduce((max, metric) => 
      metric.value > max.value ? metric : max
    );
    
    const fastestMetric = recentMetrics.reduce((min, metric) => 
      metric.value < min.value ? metric : min
    );
    
    const errorCount = recentMetrics.filter(m => 
      m.metadata?.success === false
    ).length;
    const errorRate = (errorCount / recentMetrics.length) * 100;
    
    return {
      timestamp: now,
      metrics: recentMetrics,
      summary: {
        averageResponseTime: Math.round(averageResponseTime),
        slowestOperation: slowestMetric.name,
        fastestOperation: fastestMetric.name,
        totalOperations: recentMetrics.length,
        errorRate: Math.round(errorRate * 100) / 100,
      },
    };
  }
  
  /**
   * Get memory usage information
   * PERFORMANCE: Returns current memory usage
   */
  static getMemoryInfo(): MemoryInfo | null {
    if (Platform.OS === 'web' && 'memory' in performance) {
      const memInfo = (performance as any).memory;
      const used = Math.round(memInfo.usedJSHeapSize / 1048576); // MB
      const total = Math.round(memInfo.totalJSHeapSize / 1048576); // MB
      const limit = Math.round(memInfo.jsHeapSizeLimit / 1048576); // MB
      const percentage = Math.round((used / limit) * 100);
      
      return {
        used,
        total,
        limit,
        percentage,
      };
    }
    
    return null;
  }
  
  /**
   * Check if app performance is optimal
   * PERFORMANCE: Determines if app is performing well
   */
  static isPerformanceOptimal(): boolean {
    const report = this.generateReport();
    const memoryInfo = this.getMemoryInfo();
    
    // Check response time
    if (report.summary.averageResponseTime > 1000) {
      return false;
    }
    
    // Check error rate
    if (report.summary.errorRate > 5) {
      return false;
    }
    
    // Check memory usage
    if (memoryInfo && memoryInfo.percentage > 80) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get performance recommendations
   * PERFORMANCE: Suggests optimizations based on metrics
   */
  static getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = this.generateReport();
    const memoryInfo = this.getMemoryInfo();
    
    // Response time recommendations
    if (report.summary.averageResponseTime > 1000) {
      recommendations.push('Consider optimizing slow operations to improve response time');
    }
    
    // Error rate recommendations
    if (report.summary.errorRate > 5) {
      recommendations.push('High error rate detected - review error handling and retry logic');
    }
    
    // Memory recommendations
    if (memoryInfo && memoryInfo.percentage > 80) {
      recommendations.push('High memory usage - consider implementing memory optimization strategies');
    }
    
    // Slow operation recommendations
    if (report.summary.slowestOperation !== 'N/A') {
      recommendations.push(`Optimize "${report.summary.slowestOperation}" - it's the slowest operation`);
    }
    
    // Cache recommendations
    const cacheMetrics = this.metrics.filter(m => m.name.includes('cache'));
    if (cacheMetrics.length === 0) {
      recommendations.push('Consider implementing caching to improve performance');
    }
    
    return recommendations;
  }
  
  /**
   * Clear performance metrics
   * PERFORMANCE: Resets all performance data
   */
  static clearMetrics(): void {
    this.metrics = [];
  }
  
  /**
   * Export performance data
   * PERFORMANCE: Exports metrics for analysis
   */
  static exportMetrics(): string {
    const report = this.generateReport();
    return JSON.stringify(report, null, 2);
  }
  
  /**
   * Load metrics from storage
   * PERFORMANCE: Loads persisted performance data
   */
  private static async loadMetrics(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('performance_metrics');
      if (stored) {
        this.metrics = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    }
  }
  
  /**
   * Save metrics to storage
   * PERFORMANCE: Persists performance data
   */
  private static async saveMetrics(): Promise<void> {
    try {
      await AsyncStorage.setItem('performance_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Error saving performance metrics:', error);
    }
  }
  
  /**
   * Start periodic reporting
   * PERFORMANCE: Generates reports at regular intervals
   */
  private static startPeriodicReporting(): void {
    this.reportTimer = setInterval(async () => {
      try {
        const report = this.generateReport();
        
        // Save metrics
        await this.saveMetrics();
        
        // Log performance summary
        console.log('Performance Report:', report.summary);
        
        // Check if performance is optimal
        if (!this.isPerformanceOptimal()) {
          const recommendations = this.getPerformanceRecommendations();
          console.warn('Performance issues detected:', recommendations);
        }
        
        // Send to monitoring service in production
        // await this.sendToMonitoringService(report);
        
      } catch (error) {
        console.error('Error in periodic reporting:', error);
      }
    }, this.REPORT_INTERVAL);
  }
  
  /**
   * Start memory monitoring
   * PERFORMANCE: Monitors memory usage
   */
  private static startMemoryMonitoring(): void {
    if (Platform.OS === 'web') {
      setInterval(() => {
        const memoryInfo = this.getMemoryInfo();
        if (memoryInfo) {
          this.recordMetric('memory_usage', memoryInfo.percentage, {
            used: memoryInfo.used,
            total: memoryInfo.total,
            limit: memoryInfo.limit,
          });
          
          // Alert if memory usage is high
          if (memoryInfo.percentage > 90) {
            console.error('Critical memory usage detected:', memoryInfo);
          }
        }
      }, 30000); // Check every 30 seconds
    }
  }
  
  /**
   * Stop performance monitoring
   * PERFORMANCE: Stops monitoring and cleans up
   */
  static stop(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
  }
}
