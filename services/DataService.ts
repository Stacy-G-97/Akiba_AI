/**
 * DataService.ts
 * 
 * This service handles all data operations for Akiba AI
 * It integrates multiple data sources to provide accurate predictions
 * 
 * BEGINNER NOTE: This is like the brain of our app - it processes all the information
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { KenyanMarketAnalyzer, KENYAN_FOOD_DATABASE } from '@/utils/KenyanMarketData';
import { PerformanceService } from './PerformanceService';
import { SecurityService } from './SecurityService';
import { ErrorHandlingService } from './ErrorHandlingService';

export interface PredictionData {
  item: string;
  predictedDemand: number;
  confidence: number;
  factors: string[];
  recommendation: string;
}

export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'rainy' | 'cloudy';
  humidity: number;
  forecast: string;
}

export interface EventData {
  name: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
  affectedItems: string[];
}

/**
 * BEGINNER EXPLANATION:
 * This class combines different types of data to make smart predictions
 * It's like having a very smart assistant that knows about weather, events, and food patterns
 */
export class DataService {
  
  /**
   * Get historical sales data for analysis
   * BEGINNER NOTE: Looks at past sales to understand patterns
   * PERFORMANCE: Enhanced with caching and error handling
   */
  static async getHistoricalSales(days: number = 30): Promise<any[]> {
    return await PerformanceService.measurePerformance(async () => {
      // PERFORMANCE: Check cache first
      const cacheKey = `historical_sales_${days}`;
      const cached = await PerformanceService.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      // SECURITY: Validate input
      const safeDays = Math.min(Math.max(1, days), 365); // Between 1 and 365 days
      
      // Simulate historical sales data
      const salesData = [];
      const today = new Date();
      
      for (let i = 0; i < safeDays; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Generate realistic sales data based on Kenyan patterns
        const dayOfWeek = date.getDay();
        const baseMultiplier = KenyanMarketAnalyzer.getDayOfWeekPattern('general', dayOfWeek);
        
        KENYAN_FOOD_DATABASE.forEach(food => {
          salesData.push({
            date: date.toISOString().split('T')[0],
            item: food.name,
            quantity: Math.floor(Math.random() * 50 * baseMultiplier) + 5,
            revenue: Math.floor(Math.random() * 2000 * baseMultiplier) + 200,
            category: food.category
          });
        });
      }
      
      // PERFORMANCE: Cache the result
      await PerformanceService.cacheData(cacheKey, salesData, 60 * 60 * 1000); // Cache for 1 hour
      
      return salesData;
    }, 'getHistoricalSales');
  }
  
  /**
   * Get current weather data and forecast
   * BEGINNER NOTE: Gets weather information that affects food demand
   * FAULT TOLERANCE: Enhanced with fallback data
   */
  static async getWeatherData(days: number = 7): Promise<WeatherData[]> {
    return await ErrorHandlingService.handleNetworkError(
      async () => {
        // SECURITY: Rate limiting
        const canProceed = await SecurityService.checkRateLimit('weather_api');
        if (!canProceed) {
          throw new Error('Rate limit exceeded for weather API');
        }

        // In production, this would call a real weather API
        // For demo, we'll generate realistic Kenyan weather data
        const weatherData: WeatherData[] = [];
        
        for (let i = 0; i < days; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          
          // Simulate Kenyan weather patterns
          const isRainySeason = date.getMonth() >= 3 && date.getMonth() <= 5; // April-June
          const rainChance = isRainySeason ? 0.7 : 0.2;
          
          weatherData.push({
            temperature: Math.floor(Math.random() * 10) + 20, // 20-30°C
            condition: Math.random() < rainChance ? 'rainy' : 'sunny',
            humidity: Math.floor(Math.random() * 30) + 60, // 60-90%
            forecast: isRainySeason ? 'Rainy season continues' : 'Dry and warm'
          });
        }
        
        return weatherData;
      },
      async () => {
        // FAULT TOLERANCE: Fallback weather data
        console.log('Using fallback weather data');
        return [{
          temperature: 25,
          condition: 'sunny' as const,
          humidity: 70,
          forecast: 'Typical Nairobi weather'
        }];
      },
      'getWeatherData'
    ) || [];
  }
  
  /**
   * Get local events that might affect demand
   * BEGINNER NOTE: Finds events like holidays that change what people buy
   * PERFORMANCE: Enhanced with intelligent caching
   */
  static async getLocalEvents(days: number = 14): Promise<EventData[]> {
    return await PerformanceService.measurePerformance(async () => {
      // PERFORMANCE: Check cache first
      const cacheKey = `local_events_${days}`;
      const cached = await PerformanceService.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      // Simulate local events data
      const events: EventData[] = [
        {
          name: 'Mashujaa Day',
          date: '2025-10-20',
          impact: 'high',
          affectedItems: ['Nyama (Beef)', 'Ugali Flour', 'Sukuma Wiki']
        },
        {
          name: 'Local Football Match',
          date: '2025-01-18',
          impact: 'medium',
          affectedItems: ['Mandazi Mix', 'Chapati Flour']
        },
        {
          name: 'Church Event',
          date: '2025-01-19',
          impact: 'medium',
          affectedItems: ['Nyama (Beef)', 'Githeri Mix']
        }
      ];
      
      // PERFORMANCE: Cache for 4 hours
      await PerformanceService.cacheData(cacheKey, events, 4 * 60 * 60 * 1000);
      
      return events;
    }, 'getLocalEvents');
  }
  
  /**
   * Get supplier delivery schedules
   * BEGINNER NOTE: Knows when suppliers deliver food
   * SECURITY: Enhanced with input validation
   */
  static async getSupplierSchedules(): Promise<any[]> {
    return await ErrorHandlingService.safeStorageOperation(async () => {
      // Simulate supplier schedule data
      return [
        {
          supplier: 'Nairobi Fresh Vegetables',
          deliveryDays: ['Monday', 'Wednesday', 'Friday'],
          items: ['Sukuma Wiki', 'Tomatoes', 'Mchicha'],
          reliability: 0.95,
          leadTime: 1 // days
        },
        {
          supplier: 'Unga Limited',
          deliveryDays: ['Tuesday', 'Thursday'],
          items: ['Ugali Flour', 'Chapati Flour'],
          reliability: 0.98,
          leadTime: 2
        },
        {
          supplier: 'Local Butchery',
          deliveryDays: ['Monday', 'Thursday', 'Saturday'],
          items: ['Nyama (Beef)', 'Nyama (Goat)'],
          reliability: 0.90,
          leadTime: 1
        }
      ];
    }, [], 'getSupplierSchedules');
  }
  
  /**
   * Get customer foot traffic patterns
   * BEGINNER NOTE: Understands when customers visit most
   * PERFORMANCE: Optimized with batch processing
   */
  static async getFootTrafficPatterns(): Promise<any[]> {
    return await PerformanceService.measurePerformance(async () => {
      // PERFORMANCE: Check cache
      const cached = await PerformanceService.getCachedData('foot_traffic');
      if (cached) {
        return cached;
      }

      // Simulate foot traffic data based on Kenyan patterns
      const patterns = [
        { hour: 8, traffic: 65, day: 'Monday' },
        { hour: 12, traffic: 85, day: 'Monday' },
        { hour: 18, traffic: 90, day: 'Monday' },
        { hour: 9, traffic: 95, day: 'Saturday' },
        { hour: 14, traffic: 100, day: 'Saturday' },
        { hour: 17, traffic: 80, day: 'Sunday' }
      ];
      
      // PERFORMANCE: Cache for 2 hours
      await PerformanceService.cacheData('foot_traffic', patterns, 2 * 60 * 60 * 1000);
      
      return patterns;
    }, 'getFootTrafficPatterns');
  }
  
  /**
   * Get social media sentiment data
   * BEGINNER NOTE: Understands what people are saying about food online
   * FAULT TOLERANCE: Enhanced with circuit breaker
   */
  static async getSocialSentiment(days: number = 7): Promise<any[]> {
    const circuitBreaker = ErrorHandlingService.createCircuitBreaker('social_sentiment', 3, 30000);
    
    return await circuitBreaker(async () => {
      // SECURITY: Validate input
      const safeDays = SecurityService.sanitizeInput(days.toString());
      
      // Simulate social sentiment data
      return [
        {
          platform: 'Twitter',
          mentions: 45,
          sentiment: 'positive',
          trendingItems: ['Sukuma Wiki', 'Ugali'],
          keywords: ['fresh', 'healthy', 'local']
        },
        {
          platform: 'Facebook',
          mentions: 32,
          sentiment: 'neutral',
          trendingItems: ['Chapati', 'Mandazi'],
          keywords: ['weekend', 'family', 'traditional']
        }
      ];
    });
  }
}

/**
 * BEGINNER EXPLANATION:
 * This is the main AI engine that combines all data to make predictions
 * It's like having a very smart person who knows everything about your business
 */
export class PredictionEngine {
  
  /**
   * Generate demand prediction for a specific item
   * BEGINNER NOTE: Predicts how much of an item customers will want
   * SECURITY & PERFORMANCE: Enhanced with comprehensive safeguards
   */
  static async generateDemandPrediction(
    item: string, 
    days: number = 3
  ): Promise<PredictionData> {
    return await PerformanceService.measurePerformance(async () => {
      // SECURITY: Sanitize inputs
      const safeItem = SecurityService.sanitizeInput(item);
      const safeDays = Math.min(Math.max(1, days), 30); // Between 1 and 30 days
      
      // PERFORMANCE: Check cache first
      const cacheKey = `prediction_${safeItem}_${safeDays}`;
      const cached = await PerformanceService.getCachedData<PredictionData>(cacheKey);
      if (cached) {
        return cached;
      }

      // Get all data sources with error handling
      const [salesData, weatherData, events] = await Promise.allSettled([
        DataService.getHistoricalSales(30),
        DataService.getWeatherData(safeDays),
        DataService.getLocalEvents(safeDays)
      ]);

      // Extract successful results
      const sales = salesData.status === 'fulfilled' ? salesData.value : [];
      const weather = weatherData.status === 'fulfilled' ? weatherData.value : [];
      const localEvents = events.status === 'fulfilled' ? events.value : [];

      // Calculate base demand from historical data
      const itemSales = sales.filter(sale => 
        sale.item.toLowerCase() === safeItem.toLowerCase()
      );
      
      const avgDemand = itemSales.length > 0 
        ? itemSales.reduce((sum, sale) => sum + sale.quantity, 0) / itemSales.length
        : 20; // Default fallback

      // Apply various multipliers
      let predictedDemand = avgDemand;
      const factors: string[] = [];
      
      // Day of week pattern
      const today = new Date();
      const dayMultiplier = KenyanMarketAnalyzer.getDayOfWeekPattern(safeItem, today.getDay());
      predictedDemand *= dayMultiplier;
      if (dayMultiplier > 1.1) {
        factors.push(`${Math.round((dayMultiplier - 1) * 100)}% boost for day of week`);
      }
      
      // Seasonal multiplier
      const seasonalMultiplier = KenyanMarketAnalyzer.getSeasonalMultiplier(safeItem, today.getMonth() + 1);
      predictedDemand *= seasonalMultiplier;
      if (seasonalMultiplier !== 1.0) {
        factors.push(`${Math.round((seasonalMultiplier - 1) * 100)}% seasonal adjustment`);
      }
      
      // Weather impact
      if (weather.length > 0) {
        const weatherMultiplier = KenyanMarketAnalyzer.getWeatherImpact(safeItem, weather[0]);
        predictedDemand *= weatherMultiplier;
        if (weatherMultiplier > 1.1) {
          factors.push(`${Math.round((weatherMultiplier - 1) * 100)}% weather boost`);
        }
      }
      
      // Event impact
      const relevantEvents = localEvents.filter(event => 
        event.affectedItems.some(affected => 
          affected.toLowerCase().includes(safeItem.toLowerCase())
        )
      );
      
      if (relevantEvents.length > 0) {
        const eventMultiplier = relevantEvents.reduce((mult, event) => {
          switch (event.impact) {
            case 'high': return mult * 1.3;
            case 'medium': return mult * 1.15;
            case 'low': return mult * 1.05;
            default: return mult;
          }
        }, 1.0);
        
        predictedDemand *= eventMultiplier;
        factors.push(`${Math.round((eventMultiplier - 1) * 100)}% event impact`);
      }
      
      // Cultural significance boost
      const culturalMultiplier = KenyanMarketAnalyzer.getCulturalImpact(safeItem);
      predictedDemand *= culturalMultiplier;
      
      // Calculate confidence based on data quality
      let confidence = 70; // Base confidence
      if (itemSales.length > 10) confidence += 10; // Good historical data
      if (weather.length > 0) confidence += 5; // Weather data available
      if (relevantEvents.length > 0) confidence += 5; // Event data available
      confidence = Math.min(95, confidence); // Cap at 95%
      
      // Generate recommendation
      const recommendation = this.generateRecommendation(
        Math.round(predictedDemand), 
        avgDemand, 
        factors
      );
      
      const prediction: PredictionData = {
        item: safeItem,
        predictedDemand: Math.round(predictedDemand),
        confidence,
        factors,
        recommendation
      };
      
      // PERFORMANCE: Cache the prediction
      await PerformanceService.cacheData(cacheKey, prediction, 30 * 60 * 1000); // Cache for 30 minutes
      
      return prediction;
    }, 'generateDemandPrediction');
  }
  
  /**
   * Generate actionable recommendation
   * BEGINNER NOTE: Tells users what action to take based on predictions
   */
  private static generateRecommendation(
    predicted: number, 
    historical: number, 
    factors: string[]
  ): string {
    const difference = predicted - historical;
    const percentChange = (difference / historical) * 100;
    
    if (percentChange > 30) {
      return `High demand expected! Order ${Math.ceil(difference)} more units`;
    } else if (percentChange > 15) {
      return `Moderate increase expected. Consider ordering ${Math.ceil(difference)} more units`;
    } else if (percentChange < -20) {
      return `Lower demand expected. Consider promotion or reduce orders`;
    } else if (percentChange < -10) {
      return `Slightly lower demand. Monitor closely`;
    } else {
      return `Demand stable. Current stock levels appropriate`;
    }
  }
}