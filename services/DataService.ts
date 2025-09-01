/**
 * DataService.ts
 * 
 * This file handles all data operations for Akiba AI
 * It simulates real-world data sources that would be integrated in production
 * 
 * BEGINNER NOTE: This service acts as a bridge between our app and external data sources
 * In a real app, these would connect to actual APIs and databases
 */

import { ErrorHandlingService } from './ErrorHandlingService';
import { PerformanceService } from './PerformanceService';
import { SecurityService } from './SecurityService';

// Types for our data structures
export interface SalesData {
  date: string;
  item: string;
  quantity: number;
  revenue: number;
  hour: number; // 0-23 for hourly patterns
}

export interface WeatherData {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  condition: 'sunny' | 'rainy' | 'cloudy';
}

export interface EventData {
  date: string;
  name: string;
  type: 'holiday' | 'festival' | 'sports' | 'religious';
  expectedImpact: 'high' | 'medium' | 'low';
}

export interface FootTrafficData {
  hour: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  averageCustomers: number;
  peakHours: number[];
}

export interface SocialSentiment {
  platform: 'twitter' | 'facebook' | 'instagram';
  mentions: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  date: string;
}

export interface SupplierSchedule {
  supplier: string;
  deliveryDay: string;
  items: string[];
  reliability: number; // 0-100%
  leadTime: number; // days
}

/**
 * BEGINNER EXPLANATION:
 * This class simulates how we would collect and process data from various sources
 * In production, these methods would make actual API calls to real services
 */
export class DataService {
  
  /**
   * Simulates historical sales data collection
   * In production: This would query your POS system or sales database
   * SECURITY & PERFORMANCE: Enhanced with error handling and caching
   */
  static async getHistoricalSales(days: number = 30): Promise<SalesData[]> {
    const cacheKey = `sales_data_${days}`;
    
    // PERFORMANCE: Check cache first
    const cached = await PerformanceService.getCachedData<SalesData[]>(cacheKey);
    if (cached) {
      console.log('Using cached sales data');
      return cached;
    }
    
    // FAULT TOLERANCE: Use retry logic for network operations
    return await ErrorHandlingService.withRetry(async () => {
      // SECURITY: Rate limiting
      const canProceed = await SecurityService.checkRateLimit('sales_data');
      if (!canProceed) {
        throw new Error('Rate limit exceeded');
      }
      
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 500));
    
      const kenyanFoods = [
        'Sukuma Wiki', 'Ugali Flour', 'Tomatoes', 'Nyama (Beef)', 
        'Githeri', 'Mchicha', 'Chapati', 'Mandazi', 'Mahindi'
      ];
    
      const salesData: SalesData[] = [];
      const today = new Date();
    
      // Generate realistic sales patterns for Kenyan market
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
      
        kenyanFoods.forEach(item => {
          // Simulate different demand patterns
          const baseQuantity = Math.floor(Math.random() * 50) + 10;
          const weekendMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1;
          const quantity = Math.floor(baseQuantity * weekendMultiplier);
        
          salesData.push({
            date: date.toISOString().split('T')[0],
            item,
            quantity,
            revenue: quantity * (Math.random() * 100 + 50), // Random price per unit
            hour: Math.floor(Math.random() * 24)
          });
        });
      }
      
      // PERFORMANCE: Cache the results
      await PerformanceService.cacheData(cacheKey, salesData, 10 * 60 * 1000); // Cache for 10 minutes
      
      return salesData;
    }, { maxAttempts: 2, baseDelay: 1000 }, 'getHistoricalSales');
  }

  /**
   * Enhanced weather data with error handling
   * SECURITY & PERFORMANCE: Secure and optimized weather data retrieval
   */
  static async getWeatherData(days: number = 7): Promise<WeatherData[]> {
    const cacheKey = `weather_data_${days}`;
    
    // PERFORMANCE: Check cache first
    const cached = await PerformanceService.getCachedData<WeatherData[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // FAULT TOLERANCE: Network operation with fallback
    return await ErrorHandlingService.handleNetworkError(
      async () => {
        // SECURITY: Rate limiting
        const canProceed = await SecurityService.checkRateLimit('weather_data');
        if (!canProceed) {
          throw new Error('Rate limit exceeded');
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const weatherData: WeatherData[] = [];
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          
          // Simulate Kenyan weather patterns
          const isRainySeason = date.getMonth() >= 2 && date.getMonth() <= 5; // March-June
          
          weatherData.push({
            date: date.toISOString().split('T')[0],
            temperature: Math.floor(Math.random() * 10) + (isRainySeason ? 20 : 25),
            humidity: Math.floor(Math.random() * 30) + (isRainySeason ? 60 : 40),
            rainfall: isRainySeason ? Math.random() * 20 : Math.random() * 5,
            condition: isRainySeason ? 'rainy' : (Math.random() > 0.7 ? 'cloudy' : 'sunny')
          });
        }
        
        // PERFORMANCE: Cache the results
        await PerformanceService.cacheData(cacheKey, weatherData, 30 * 60 * 1000); // Cache for 30 minutes
        
        return weatherData;
      },
      async () => {
        // Fallback: Return basic weather data
        console.log('Using fallback weather data');
        return [{
          date: new Date().toISOString().split('T')[0],
          temperature: 25,
          humidity: 50,
          rainfall: 0,
          condition: 'sunny' as const
        }];
      },
      'getWeatherData'
    ) || [];
  }

  /**
   * Enhanced local events with security and performance
   */
  private static calculateWeatherImpact(weather: WeatherData[], item: string): number {
    try {
      if (weather.length === 0) return 0;
      
      const avgTemp = weather.reduce((sum, w) => sum + w.temperature, 0) / weather.length;
      const avgRainfall = weather.reduce((sum, w) => sum + w.rainfall, 0) / weather.length;
      
      // SECURITY: Validate weather data
      if (isNaN(avgTemp) || isNaN(avgRainfall)) {
        console.warn('Invalid weather data, skipping weather impact');
        return 0;
      }
      
      // Different items react differently to weather
      if (item.toLowerCase().includes('sukuma') || item.toLowerCase().includes('mchicha')) {
        // Leafy vegetables: higher demand when it's hot (people want fresh food)
        return avgTemp > 28 ? 0.15 : 0;
      }
      
      if (item.toLowerCase().includes('ugali') || item.toLowerCase().includes('githeri')) {
        // Warm foods: higher demand when it's rainy/cool
        return avgRainfall > 5 ? 0.2 : (avgTemp < 22 ? 0.1 : 0);
      }
      
      return 0; // No weather impact for other items
    } catch (error) {
      console.error('Error calculating weather impact:', error);
      return 0; // Safe default
    }
  }

  /**
   * Enhanced event impact calculation
   */
  private static calculateEventImpact(events: EventData[]): number {
    try {
      const highImpactEvents = events.filter(e => e.expectedImpact === 'high').length;
      const mediumImpactEvents = events.filter(e => e.expectedImpact === 'medium').length;
      
      const impact = (highImpactEvents * 0.3) + (mediumImpactEvents * 0.15);
      
      // SECURITY: Validate result
      if (isNaN(impact) || impact < 0) {
        return 0;
      }
      
      return Math.min(impact, 1.0); // Cap at 100% increase
    } catch (error) {
      console.error('Error calculating event impact:', error);
      return 0;
    }
  }

  /**
   * Enhanced social impact calculation
   */
  private static calculateSocialImpact(sentiment: SocialSentiment[], item: string): number {
    try {
      const relevantMentions = sentiment.filter(s => 
        s.keywords.some(keyword => item.toLowerCase().includes(keyword))
      );
      
      if (relevantMentions.length === 0) return 0;
      
      const positiveCount = relevantMentions.filter(s => s.sentiment === 'positive').length;
      const totalCount = relevantMentions.length;
      
      const positiveRatio = positiveCount / totalCount;
      
      // SECURITY: Validate calculation
      if (isNaN(positiveRatio) || positiveRatio < 0 || positiveRatio > 1) {
        return 0;
      }
      
      return positiveRatio > 0.6 ? 0.1 : 0;
    } catch (error) {
      console.error('Error calculating social impact:', error);
      return 0;
    }
  }

  /**
   * Enhanced confidence calculation
   */
  private static calculateConfidence(sales: SalesData[], weather: WeatherData[], events: EventData[]): number {
    try {
      let confidence = 70; // Base confidence
      
      // More historical data increases confidence
      if (sales.length > 20) confidence += 10;
      if (sales.length > 50) confidence += 5;
      
      // Weather data availability
      if (weather.length >= 7) confidence += 5;
      
      // Event data availability
      if (events.length > 0) confidence += 5;
      
      // Add some randomness to simulate real-world uncertainty
      confidence += Math.floor(Math.random() * 10) - 5;
      
      // SECURITY: Validate and constrain result
      const finalConfidence = Math.min(95, Math.max(60, confidence));
      
      if (isNaN(finalConfidence)) {
        return 70; // Safe default
      }
      
      return finalConfidence;
    } catch (error) {
      console.error('Error calculating confidence:', error);
      return 70; // Safe default
    }
  }
}

    
    // PERFORMANCE: Check cache first
    const cached = await PerformanceService.getCachedData<EventData[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    return await ErrorHandlingService.withRetry(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const kenyanEvents: EventData[] = [
        {
          date: '2025-01-20',
          name: 'Madaraka Day Preparation',
          type: 'holiday',
          expectedImpact: 'high'
        },
        {
          date: '2025-01-18',
          name: 'Local Football Match',
          type: 'sports',
          expectedImpact: 'medium'
        },
        {
          date: '2025-01-25',
          name: 'Church Harvest Festival',
          type: 'religious',
          expectedImpact: 'high'
        }
      ];
      
      // PERFORMANCE: Cache the results
      await PerformanceService.cacheData(cacheKey, kenyanEvents, 60 * 60 * 1000); // Cache for 1 hour
      
      return kenyanEvents;
    }, { maxAttempts: 2 }, 'getLocalEvents');
  }

  /**
   * Enhanced foot traffic patterns with caching
   */
  static async getFootTrafficPatterns(): Promise<FootTrafficData[]> {
    const cacheKey = 'foot_traffic_patterns';
    
    // PERFORMANCE: Check cache first
    const cached = await PerformanceService.getCachedData<FootTrafficData[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    return await ErrorHandlingService.withRetry(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const patterns: FootTrafficData[] = [];
      
      // Generate patterns for each day of the week
      for (let day = 0; day < 7; day++) {
        const isWeekend = day === 0 || day === 6;
        const baseTraffic = isWeekend ? 80 : 60;
        
        patterns.push({
          hour: 12, // Peak lunch hour
          dayOfWeek: day,
          averageCustomers: baseTraffic + Math.floor(Math.random() * 20),
          peakHours: isWeekend ? [10, 13, 19] : [8, 12, 18] // Different peak hours for weekends
        });
      }
      
      // PERFORMANCE: Cache the results
      await PerformanceService.cacheData(cacheKey, patterns, 2 * 60 * 60 * 1000); // Cache for 2 hours
      
      return patterns;
    }, { maxAttempts: 2 }, 'getFootTrafficPatterns');
  }

  /**
   * Enhanced social sentiment with security validation
   */
  static async getSocialSentiment(days: number = 7): Promise<SocialSentiment[]> {
    const cacheKey = `social_sentiment_${days}`;
    
    // PERFORMANCE: Check cache first
    const cached = await PerformanceService.getCachedData<SocialSentiment[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    return await ErrorHandlingService.withRetry(async () => {
      // SECURITY: Rate limiting for social media APIs
      const canProceed = await SecurityService.checkRateLimit('social_sentiment');
      if (!canProceed) {
        throw new Error('Rate limit exceeded');
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const platforms: ('twitter' | 'facebook' | 'instagram')[] = ['twitter', 'facebook', 'instagram'];
      const sentiments: SocialSentiment[] = [];
      
      platforms.forEach(platform => {
        const today = new Date();
        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          sentiments.push({
            platform,
            mentions: Math.floor(Math.random() * 50) + 10,
            sentiment: Math.random() > 0.7 ? 'positive' : (Math.random() > 0.5 ? 'neutral' : 'negative'),
            keywords: ['ugali', 'sukuma', 'nyama', 'fresh', 'delicious', 'affordable'],
            date: date.toISOString().split('T')[0]
          });
        }
      });
      
      // PERFORMANCE: Cache the results
      await PerformanceService.cacheData(cacheKey, sentiments, 15 * 60 * 1000); // Cache for 15 minutes
      
      return sentiments;
    }, { maxAttempts: 2 }, 'getSocialSentiment');
  }

  /**
   * Enhanced supplier schedules with caching
   */
  static async getSupplierSchedules(): Promise<SupplierSchedule[]> {
    const cacheKey = 'supplier_schedules';
    
    // PERFORMANCE: Check cache first
    const cached = await PerformanceService.getCachedData<SupplierSchedule[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    return await ErrorHandlingService.withRetry(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const schedules = [
        {
          supplier: 'Nairobi Fresh Vegetables Co.',
          deliveryDay: 'Monday',
          items: ['Sukuma Wiki', 'Mchicha', 'Tomatoes', 'Onions'],
          reliability: 92,
          leadTime: 1
        },
        {
          supplier: 'Rift Valley Grains',
          deliveryDay: 'Wednesday',
          items: ['Ugali Flour', 'Rice', 'Githeri Mix'],
          reliability: 88,
          leadTime: 2
        },
        {
          supplier: 'Kiambu Meat Suppliers',
          deliveryDay: 'Friday',
          items: ['Nyama (Beef)', 'Kuku (Chicken)', 'Samaki (Fish)'],
          reliability: 95,
          leadTime: 1
        }
      ];
      
      // PERFORMANCE: Cache the results
      await PerformanceService.cacheData(cacheKey, schedules, 4 * 60 * 60 * 1000); // Cache for 4 hours
      
      return schedules;
    }, { maxAttempts: 2 }, 'getSupplierSchedules');
  }
}

/**
 * Enhanced PredictionEngine with security and performance improvements
 */
export class PredictionEngine {
  /**
   * Enhanced prediction generation with comprehensive error handling
   * SECURITY & PERFORMANCE: Secure, cached, and fault-tolerant predictions
   */
  static async generateDemandPrediction(item: string, days: number = 3) {
    // SECURITY: Sanitize input
    const sanitizedItem = SecurityService.sanitizeInput(item);
    const cacheKey = `prediction_${sanitizedItem}_${days}`;
    
    // PERFORMANCE: Check cache first
    const cached = await PerformanceService.getCachedData(cacheKey);
    if (cached) {
      console.log('Using cached prediction');
      return cached;
    }
    
    // PERFORMANCE: Measure prediction generation time
    return await PerformanceService.measurePerformance(async () => {
      // FAULT TOLERANCE: Use graceful degradation
      return await ErrorHandlingService.gracefulDegrade(
        async () => {
          // Primary operation: Full AI prediction
          console.log('Generating full AI prediction...');
          
          // Get all data sources with error handling
          const [sales, weather, events, traffic, sentiment] = await Promise.allSettled([
            DataService.getHistoricalSales(30),
            DataService.getWeatherData(days),
            DataService.getLocalEvents(days),
            DataService.getFootTrafficPatterns(),
            DataService.getSocialSentiment(7)
          ]);
          
          // Extract successful results
          const salesData = sales.status === 'fulfilled' ? sales.value : [];
          const weatherData = weather.status === 'fulfilled' ? weather.value : [];
          const eventsData = events.status === 'fulfilled' ? events.value : [];
          const trafficData = traffic.status === 'fulfilled' ? traffic.value : [];
          const sentimentData = sentiment.status === 'fulfilled' ? sentiment.value : [];
          
          // Simulate ML processing time
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Calculate prediction components
          const baseDemand = this.calculateBaseDemand(salesData, sanitizedItem);
          const weatherAdjustment = this.calculateWeatherImpact(weatherData, sanitizedItem);
          const eventAdjustment = this.calculateEventImpact(eventsData);
          const socialAdjustment = this.calculateSocialImpact(sentimentData, sanitizedItem);
          
          // Combine factors for final prediction
          const predictedDemand = Math.round(
            baseDemand * (1 + weatherAdjustment + eventAdjustment + socialAdjustment)
          );
          
          // Calculate confidence based on data quality
          const confidence = this.calculateConfidence(salesData, weatherData, eventsData);
          
          const result = {
            item: sanitizedItem,
            predictedDemand,
            confidence,
            factors: {
              base: baseDemand,
              weather: weatherAdjustment,
              events: eventAdjustment,
              social: socialAdjustment
            }
          };
          
          // PERFORMANCE: Cache the prediction
          await PerformanceService.cacheData(cacheKey, result, 15 * 60 * 1000); // Cache for 15 minutes
          
          return result;
        },
        async () => {
          // Fallback operation: Basic prediction
          console.log('Using basic prediction fallback');
          
          const basicPrediction = {
            item: sanitizedItem,
            predictedDemand: Math.floor(Math.random() * 30) + 10,
            confidence: 65, // Lower confidence for fallback
            factors: {
              base: 20,
              weather: 0,
              events: 0,
              social: 0
            }
          };
          
          return basicPrediction;
        },
        `generateDemandPrediction_${sanitizedItem}`
      );
    }, `prediction_generation_${sanitizedItem}`);
  }

  /**
   * Enhanced base demand calculation with error handling
   */
  private static calculateBaseDemand(sales: SalesData[], item: string): number {
    try {
      const itemSales = sales.filter(sale => sale.item === item);
      if (itemSales.length === 0) return 20; // Default if no history
      
      const totalQuantity = itemSales.reduce((sum, sale) => sum + sale.quantity, 0);
      const average = totalQuantity / itemSales.length;
      
      // SECURITY: Validate result
      if (isNaN(average) || average < 0) {
        console.warn('Invalid base demand calculation, using default');
        return 20;
      }
      
      return Math.round(average);
    } catch (error) {
      console.error('Error calculating base demand:', error);
      return 20; // Safe default
    }
  }

  /**
   * Enhanced weather impact calculation
   */
  static async getSocialSentiment(days: number = 7): Promise<SocialSentiment[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const platforms: ('twitter' | 'facebook' | 'instagram')[] = ['twitter', 'facebook', 'instagram'];
    const sentiments: SocialSentiment[] = [];
    
    platforms.forEach(platform => {
      const today = new Date();
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        sentiments.push({
          platform,
          mentions: Math.floor(Math.random() * 50) + 10,
          sentiment: Math.random() > 0.7 ? 'positive' : (Math.random() > 0.5 ? 'neutral' : 'negative'),
          keywords: ['ugali', 'sukuma', 'nyama', 'fresh', 'delicious', 'affordable'],
          date: date.toISOString().split('T')[0]
        });
      }
    });
    
    return sentiments;
  }

  /**
   * Simulates supplier delivery schedule data
   * In production: This would integrate with supplier management systems
   */
  static async getSupplierSchedules(): Promise<SupplierSchedule[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        supplier: 'Nairobi Fresh Vegetables Co.',
        deliveryDay: 'Monday',
        items: ['Sukuma Wiki', 'Mchicha', 'Tomatoes', 'Onions'],
        reliability: 92,
        leadTime: 1
      },
      {
        supplier: 'Rift Valley Grains',
        deliveryDay: 'Wednesday',
        items: ['Ugali Flour', 'Rice', 'Githeri Mix'],
        reliability: 88,
        leadTime: 2
      },
      {
        supplier: 'Kiambu Meat Suppliers',
        deliveryDay: 'Friday',
        items: ['Nyama (Beef)', 'Kuku (Chicken)', 'Samaki (Fish)'],
        reliability: 95,
        leadTime: 1
      }
    ];
  }
}

/**
 * BEGINNER EXPLANATION:
 * This PredictionEngine class simulates how machine learning would work
 * It combines all the data sources to make smart predictions about demand
 */
export class PredictionEngine {
  
  /**
   * Main prediction function that combines all data sources
   * In production: This would use actual ML models trained on historical data
   */
  static async generateDemandPrediction(item: string, days: number = 3) {
    // Simulate ML processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get all data sources
    const [sales, weather, events, traffic, sentiment] = await Promise.all([
      DataService.getHistoricalSales(30),
      DataService.getWeatherData(days),
      DataService.getLocalEvents(days),
      DataService.getFootTrafficPatterns(),
      DataService.getSocialSentiment(7)
    ]);
    
    // Simulate ML prediction logic
    const baseDemand = this.calculateBaseDemand(sales, item);
    const weatherAdjustment = this.calculateWeatherImpact(weather, item);
    const eventAdjustment = this.calculateEventImpact(events);
    const socialAdjustment = this.calculateSocialImpact(sentiment, item);
    
    // Combine factors for final prediction
    const predictedDemand = Math.round(
      baseDemand * (1 + weatherAdjustment + eventAdjustment + socialAdjustment)
    );
    
    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(sales, weather, events);
    
    return {
      item,
      predictedDemand,
      confidence,
      factors: {
        base: baseDemand,
        weather: weatherAdjustment,
        events: eventAdjustment,
        social: socialAdjustment
      }
    };
  }
  
  /**
   * Calculate base demand from historical sales
   * BEGINNER NOTE: This finds the average sales for this item
   */
  private static calculateBaseDemand(sales: SalesData[], item: string): number {
    const itemSales = sales.filter(sale => sale.item === item);
    if (itemSales.length === 0) return 20; // Default if no history
    
    const totalQuantity = itemSales.reduce((sum, sale) => sum + sale.quantity, 0);
    return Math.round(totalQuantity / itemSales.length);
  }
  
  /**
   * Calculate how weather affects demand
   * BEGINNER NOTE: Rain might increase demand for warm foods, heat for cold drinks
   */
  private static calculateWeatherImpact(weather: WeatherData[], item: string): number {
    const avgTemp = weather.reduce((sum, w) => sum + w.temperature, 0) / weather.length;
    const avgRainfall = weather.reduce((sum, w) => sum + w.rainfall, 0) / weather.length;
    
    // Different items react differently to weather
    if (item.toLowerCase().includes('sukuma') || item.toLowerCase().includes('mchicha')) {
      // Leafy vegetables: higher demand when it's hot (people want fresh food)
      return avgTemp > 28 ? 0.15 : 0;
    }
    
    if (item.toLowerCase().includes('ugali') || item.toLowerCase().includes('githeri')) {
      // Warm foods: higher demand when it's rainy/cool
      return avgRainfall > 5 ? 0.2 : (avgTemp < 22 ? 0.1 : 0);
    }
    
    return 0; // No weather impact for other items
  }
  
  /**
   * Calculate how local events affect demand
   * BEGINNER NOTE: Holidays and festivals usually increase food demand
   */
  private static calculateEventImpact(events: EventData[]): number {
    const highImpactEvents = events.filter(e => e.expectedImpact === 'high').length;
    const mediumImpactEvents = events.filter(e => e.expectedImpact === 'medium').length;
    
    return (highImpactEvents * 0.3) + (mediumImpactEvents * 0.15);
  }
  
  /**
   * Calculate social media sentiment impact
   * BEGINNER NOTE: Positive mentions might increase demand
   */
  private static calculateSocialImpact(sentiment: SocialSentiment[], item: string): number {
    const relevantMentions = sentiment.filter(s => 
      s.keywords.some(keyword => item.toLowerCase().includes(keyword))
    );
    
    if (relevantMentions.length === 0) return 0;
    
    const positiveCount = relevantMentions.filter(s => s.sentiment === 'positive').length;
    const totalCount = relevantMentions.length;
    
    const positiveRatio = positiveCount / totalCount;
    return positiveRatio > 0.6 ? 0.1 : 0;
  }
  
  /**
   * Calculate prediction confidence
   * BEGINNER NOTE: More data = more confident predictions
   */
  private static calculateConfidence(sales: SalesData[], weather: WeatherData[], events: EventData[]): number {
    let confidence = 70; // Base confidence
    
    // More historical data increases confidence
    if (sales.length > 20) confidence += 10;
    if (sales.length > 50) confidence += 5;
    
    // Weather data availability
    if (weather.length >= 7) confidence += 5;
    
    // Event data availability
    if (events.length > 0) confidence += 5;
    
    // Add some randomness to simulate real-world uncertainty
    confidence += Math.floor(Math.random() * 10) - 5;
    
    return Math.min(95, Math.max(60, confidence));
  }
}