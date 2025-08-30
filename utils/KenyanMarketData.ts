/**
 * KenyanMarketData.ts
 * 
 * This file contains data specific to the Kenyan food market
 * It helps our AI make better predictions by understanding local patterns
 * 
 * BEGINNER NOTE: This is like a database of Kenyan food knowledge
 */

export interface KenyanFoodItem {
  name: string;
  category: 'vegetables' | 'grains' | 'meat' | 'fruits' | 'dairy';
  seasonality: 'high' | 'medium' | 'low'; // Current season availability
  averagePrice: number; // KSh per kg/unit
  shelfLife: number; // Days
  popularRegions: string[];
  culturalSignificance: 'high' | 'medium' | 'low';
  weatherSensitivity: 'high' | 'medium' | 'low';
}

export interface MarketPattern {
  day: string;
  peakHours: number[];
  popularItems: string[];
  averageFootfall: number;
  specialConsiderations: string[];
}

export interface SeasonalTrend {
  month: number;
  season: 'dry' | 'long_rains' | 'short_rains';
  demandMultipliers: { [key: string]: number };
  specialEvents: string[];
}

/**
 * BEGINNER EXPLANATION:
 * This data helps our AI understand Kenyan food culture and market patterns
 * It makes predictions more accurate by considering local preferences
 */
export const KENYAN_FOOD_DATABASE: KenyanFoodItem[] = [
  {
    name: 'Sukuma Wiki',
    category: 'vegetables',
    seasonality: 'high',
    averagePrice: 20, // KSh per bunch
    shelfLife: 3,
    popularRegions: ['Nairobi', 'Kiambu', 'Nakuru'],
    culturalSignificance: 'high',
    weatherSensitivity: 'high'
  },
  {
    name: 'Ugali Flour',
    category: 'grains',
    seasonality: 'high',
    averagePrice: 65, // KSh per kg
    shelfLife: 180,
    popularRegions: ['All Kenya'],
    culturalSignificance: 'high',
    weatherSensitivity: 'low'
  },
  {
    name: 'Tomatoes',
    category: 'vegetables',
    seasonality: 'medium',
    averagePrice: 80, // KSh per kg
    shelfLife: 5,
    popularRegions: ['Nairobi', 'Mombasa', 'Kisumu'],
    culturalSignificance: 'high',
    weatherSensitivity: 'high'
  },
  {
    name: 'Nyama (Beef)',
    category: 'meat',
    seasonality: 'medium',
    averagePrice: 600, // KSh per kg
    shelfLife: 3,
    popularRegions: ['Nairobi', 'Nakuru', 'Eldoret'],
    culturalSignificance: 'high',
    weatherSensitivity: 'medium'
  },
  {
    name: 'Githeri Mix',
    category: 'grains',
    seasonality: 'high',
    averagePrice: 80, // KSh per kg
    shelfLife: 90,
    popularRegions: ['Central Kenya', 'Nairobi'],
    culturalSignificance: 'high',
    weatherSensitivity: 'low'
  },
  {
    name: 'Mchicha',
    category: 'vegetables',
    seasonality: 'medium',
    averagePrice: 15, // KSh per bunch
    shelfLife: 2,
    popularRegions: ['Coast', 'Nairobi'],
    culturalSignificance: 'medium',
    weatherSensitivity: 'high'
  },
  {
    name: 'Chapati Flour',
    category: 'grains',
    seasonality: 'high',
    averagePrice: 70, // KSh per kg
    shelfLife: 120,
    popularRegions: ['All Kenya'],
    culturalSignificance: 'high',
    weatherSensitivity: 'low'
  },
  {
    name: 'Mandazi Mix',
    category: 'grains',
    seasonality: 'high',
    averagePrice: 85, // KSh per kg
    shelfLife: 90,
    popularRegions: ['Coast', 'Nairobi', 'Mombasa'],
    culturalSignificance: 'medium',
    weatherSensitivity: 'low'
  }
];

/**
 * Weekly market patterns in Kenya
 * BEGINNER NOTE: Different days have different shopping and eating patterns
 */
export const KENYAN_MARKET_PATTERNS: MarketPattern[] = [
  {
    day: 'Monday',
    peakHours: [8, 12, 18],
    popularItems: ['Sukuma Wiki', 'Ugali Flour', 'Tomatoes'],
    averageFootfall: 60,
    specialConsiderations: ['Start of work week', 'Fresh vegetable shopping']
  },
  {
    day: 'Tuesday',
    peakHours: [12, 18],
    popularItems: ['Nyama (Beef)', 'Githeri Mix'],
    averageFootfall: 55,
    specialConsiderations: ['Mid-week protein shopping']
  },
  {
    day: 'Wednesday',
    peakHours: [8, 12, 18],
    popularItems: ['Mchicha', 'Chapati Flour'],
    averageFootfall: 58,
    specialConsiderations: ['Hump day', 'Comfort food demand']
  },
  {
    day: 'Thursday',
    peakHours: [12, 18],
    popularItems: ['Sukuma Wiki', 'Tomatoes'],
    averageFootfall: 62,
    specialConsiderations: ['Pre-weekend shopping starts']
  },
  {
    day: 'Friday',
    peakHours: [8, 12, 17, 19],
    popularItems: ['Chapati Flour', 'Mandazi Mix', 'Nyama (Beef)'],
    averageFootfall: 85,
    specialConsiderations: ['Weekend preparation', 'Ready-to-eat items popular', 'Social gatherings']
  },
  {
    day: 'Saturday',
    peakHours: [9, 11, 14, 18],
    popularItems: ['All items', 'Bulk purchases'],
    averageFootfall: 95,
    specialConsiderations: ['Main shopping day', 'Family meals', 'Bulk buying']
  },
  {
    day: 'Sunday',
    peakHours: [10, 13, 17],
    popularItems: ['Nyama (Beef)', 'Special meal ingredients'],
    averageFootfall: 70,
    specialConsiderations: ['Family day', 'Special meals', 'Church events']
  }
];

/**
 * Seasonal trends in Kenya
 * BEGINNER NOTE: Different times of year have different food demands
 */
export const KENYAN_SEASONAL_TRENDS: SeasonalTrend[] = [
  {
    month: 1, // January
    season: 'dry',
    demandMultipliers: {
      'vegetables': 1.2, // Post-holiday healthy eating
      'grains': 1.0,
      'meat': 0.9 // Less meat after holiday spending
    },
    specialEvents: ['New Year resolutions', 'Back to school']
  },
  {
    month: 4, // April
    season: 'long_rains',
    demandMultipliers: {
      'vegetables': 0.8, // Harder to transport fresh vegetables
      'grains': 1.3, // More comfort food
      'meat': 1.1
    },
    specialEvents: ['Easter', 'Rainy season begins']
  },
  {
    month: 7, // July
    season: 'dry',
    demandMultipliers: {
      'vegetables': 1.1,
      'grains': 1.0,
      'meat': 1.2 // School holidays, more family meals
    },
    specialEvents: ['School holidays', 'Mid-year']
  },
  {
    month: 12, // December
    season: 'short_rains',
    demandMultipliers: {
      'vegetables': 1.0,
      'grains': 1.4, // Holiday cooking
      'meat': 1.6 // Christmas and New Year celebrations
    },
    specialEvents: ['Christmas', 'New Year', 'Holiday season']
  }
];

/**
 * BEGINNER EXPLANATION:
 * This class helps our AI understand Kenyan market patterns
 * It provides local knowledge that makes predictions more accurate
 */
export class KenyanMarketAnalyzer {
  
  /**
   * Get demand multiplier based on current season
   * BEGINNER NOTE: Some foods are more popular at certain times of year
   */
  static getSeasonalMultiplier(item: string, month: number): number {
    const foodData = KENYAN_FOOD_DATABASE.find(food => 
      food.name.toLowerCase() === item.toLowerCase()
    );
    
    if (!foodData) return 1.0;
    
    const seasonalTrend = KENYAN_SEASONAL_TRENDS.find(trend => trend.month === month);
    if (!seasonalTrend) return 1.0;
    
    return seasonalTrend.demandMultipliers[foodData.category] || 1.0;
  }
  
  /**
   * Get day-of-week patterns for specific items
   * BEGINNER NOTE: Some foods are more popular on certain days
   */
  static getDayOfWeekPattern(item: string, dayOfWeek: number): number {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const pattern = KENYAN_MARKET_PATTERNS[dayOfWeek];
    
    // Check if item is popular on this day
    const isPopular = pattern.popularItems.some(popular => 
      popular.toLowerCase().includes(item.toLowerCase()) || 
      item.toLowerCase().includes(popular.toLowerCase())
    );
    
    if (isPopular) {
      return 1.2; // 20% boost for popular items
    }
    
    // Weekend boost for most items
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
      return 1.15;
    }
    
    return 1.0;
  }
  
  /**
   * Get cultural significance impact
   * BEGINNER NOTE: Some foods are very important in Kenyan culture
   */
  static getCulturalImpact(item: string): number {
    const foodData = KENYAN_FOOD_DATABASE.find(food => 
      food.name.toLowerCase() === item.toLowerCase()
    );
    
    if (!foodData) return 1.0;
    
    switch (foodData.culturalSignificance) {
      case 'high':
        return 1.1; // 10% boost for culturally significant foods
      case 'medium':
        return 1.05; // 5% boost
      default:
        return 1.0;
    }
  }
  
  /**
   * Analyze weather impact on specific items
   * BEGINNER NOTE: Weather affects what people want to eat
   */
  static getWeatherImpact(item: string, weather: any): number {
    const foodData = KENYAN_FOOD_DATABASE.find(food => 
      food.name.toLowerCase() === item.toLowerCase()
    );
    
    if (!foodData || !weather) return 1.0;
    
    // High weather sensitivity items are affected more
    if (foodData.weatherSensitivity === 'high') {
      if (weather.condition === 'rainy' && foodData.category === 'grains') {
        return 1.25; // 25% boost for grains during rain
      }
      if (weather.temperature > 28 && foodData.category === 'vegetables') {
        return 1.15; // 15% boost for fresh vegetables in hot weather
      }
    }
    
    return 1.0;
  }
}