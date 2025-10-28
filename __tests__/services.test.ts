/**
 * Test suite for Akiba AI services
 * 
 * Comprehensive tests for all major services and components
 * Ensures code quality and prevents regressions
 */

import { DataService, PredictionEngine } from '../services/DataService';
import { SecurityService } from '../services/SecurityService';
import { PerformanceService } from '../services/PerformanceService';
import { NotificationService } from '../services/NotificationService';
import { OfflineService } from '../services/OfflineService';
import { PaymentService } from '../services/PaymentService';
import { EncryptionService } from '../services/EncryptionService';
import { PushNotificationService } from '../services/PushNotificationService';
import { ApiService } from '../services/ApiService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  getInternetCredentials: jest.fn(),
  setInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
  getSupportedBiometryType: jest.fn(),
}));

// Mock Expo Notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
}));

describe('DataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate historical sales data', async () => {
    const salesData = await DataService.getHistoricalSales(7);
    
    expect(salesData).toBeDefined();
    expect(Array.isArray(salesData)).toBe(true);
    expect(salesData.length).toBeGreaterThan(0);
    
    // Check data structure
    const firstItem = salesData[0];
    expect(firstItem).toHaveProperty('date');
    expect(firstItem).toHaveProperty('item');
    expect(firstItem).toHaveProperty('quantity');
    expect(firstItem).toHaveProperty('revenue');
  });

  test('should get weather data', async () => {
    const weatherData = await DataService.getWeatherData(3);
    
    expect(weatherData).toBeDefined();
    expect(Array.isArray(weatherData)).toBe(true);
    expect(weatherData.length).toBe(3);
    
    // Check weather data structure
    const firstDay = weatherData[0];
    expect(firstDay).toHaveProperty('temperature');
    expect(firstDay).toHaveProperty('condition');
    expect(firstDay).toHaveProperty('humidity');
    expect(firstDay).toHaveProperty('forecast');
  });

  test('should get local events', async () => {
    const events = await DataService.getLocalEvents(14);
    
    expect(events).toBeDefined();
    expect(Array.isArray(events)).toBe(true);
    
    // Check event structure
    if (events.length > 0) {
      const firstEvent = events[0];
      expect(firstEvent).toHaveProperty('name');
      expect(firstEvent).toHaveProperty('date');
      expect(firstEvent).toHaveProperty('impact');
      expect(firstEvent).toHaveProperty('affectedItems');
    }
  });
});

describe('PredictionEngine', () => {
  test('should generate demand prediction', async () => {
    const prediction = await PredictionEngine.generateDemandPrediction('Sukuma Wiki', 3);
    
    expect(prediction).toBeDefined();
    expect(prediction).toHaveProperty('item');
    expect(prediction).toHaveProperty('predictedDemand');
    expect(prediction).toHaveProperty('confidence');
    expect(prediction).toHaveProperty('factors');
    expect(prediction).toHaveProperty('recommendation');
    
    expect(prediction.item).toBe('Sukuma Wiki');
    expect(typeof prediction.predictedDemand).toBe('number');
    expect(typeof prediction.confidence).toBe('number');
    expect(Array.isArray(prediction.factors)).toBe(true);
    expect(typeof prediction.recommendation).toBe('string');
  });

  test('should handle invalid item names', async () => {
    const prediction = await PredictionEngine.generateDemandPrediction('NonExistentItem', 1);
    
    expect(prediction).toBeDefined();
    expect(prediction.item).toBe('NonExistentItem');
    expect(prediction.predictedDemand).toBeGreaterThan(0);
  });
});

describe('SecurityService', () => {
  test('should sanitize input', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = SecurityService.sanitizeInput(maliciousInput);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  test('should validate email format', () => {
    expect(SecurityService.validateEmail('test@example.com')).toBe(true);
    expect(SecurityService.validateEmail('invalid-email')).toBe(false);
    expect(SecurityService.validateEmail('')).toBe(false);
  });

  test('should generate secure token', () => {
    const token1 = SecurityService.generateSecureToken();
    const token2 = SecurityService.generateSecureToken();
    
    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(64); // 32 bytes = 64 hex chars
  });

  test('should check rate limit', async () => {
    const canProceed1 = await SecurityService.checkRateLimit('test_endpoint');
    const canProceed2 = await SecurityService.checkRateLimit('test_endpoint');
    
    expect(canProceed1).toBe(true);
    // Second call should be rate limited
    expect(canProceed2).toBe(false);
  });
});

describe('PerformanceService', () => {
  test('should cache and retrieve data', async () => {
    const testData = { message: 'test data' };
    const cacheKey = 'test_cache_key';
    
    await PerformanceService.cacheData(cacheKey, testData);
    const retrieved = await PerformanceService.getCachedData(cacheKey);
    
    expect(retrieved).toEqual(testData);
  });

  test('should handle cache expiry', async () => {
    const testData = { message: 'expired data' };
    const cacheKey = 'expired_cache_key';
    
    // Cache with very short duration
    await PerformanceService.cacheData(cacheKey, testData, 1);
    
    // Wait for expiry
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const retrieved = await PerformanceService.getCachedData(cacheKey);
    expect(retrieved).toBeNull();
  });

  test('should debounce function calls', (done) => {
    let callCount = 0;
    const debouncedFunction = PerformanceService.debounce(() => {
      callCount++;
    }, 100);
    
    // Call multiple times rapidly
    debouncedFunction();
    debouncedFunction();
    debouncedFunction();
    
    // Should only be called once after delay
    setTimeout(() => {
      expect(callCount).toBe(1);
      done();
    }, 200);
  });
});

describe('NotificationService', () => {
  test('should generate smart notifications', async () => {
    const notifications = await NotificationService.generateSmartNotifications();
    
    expect(notifications).toBeDefined();
    expect(Array.isArray(notifications)).toBe(true);
    
    // Check notification structure
    if (notifications.length > 0) {
      const notification = notifications[0];
      expect(notification).toHaveProperty('id');
      expect(notification).toHaveProperty('title');
      expect(notification).toHaveProperty('message');
      expect(notification).toHaveProperty('type');
      expect(notification).toHaveProperty('priority');
      expect(notification).toHaveProperty('timestamp');
      expect(notification).toHaveProperty('actionRequired');
    }
  });

  test('should get notification settings', async () => {
    const settings = await NotificationService.getNotificationSettings();
    
    expect(settings).toBeDefined();
    expect(typeof settings).toBe('object');
    expect(settings).toHaveProperty('expiring');
    expect(settings).toHaveProperty('lowStock');
    expect(settings).toHaveProperty('highDemand');
  });
});

describe('OfflineService', () => {
  test('should save and retrieve offline data', async () => {
    const testData = { type: 'test', data: 'test data' };
    
    await OfflineService.saveOfflineData('test', testData);
    const offlineData = await OfflineService.getOfflineData();
    
    expect(offlineData).toBeDefined();
    expect(Array.isArray(offlineData)).toBe(true);
    expect(offlineData.length).toBeGreaterThan(0);
    
    const savedItem = offlineData.find(item => item.type === 'test');
    expect(savedItem).toBeDefined();
    expect(savedItem?.data).toEqual(testData);
  });

  test('should check online status', async () => {
    const isOnline = await OfflineService.isOnline();
    
    expect(typeof isOnline).toBe('boolean');
  });
});

describe('PaymentService', () => {
  test('should initialize payment', async () => {
    const result = await PaymentService.initializePayment('pro', 'test@example.com');
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('transactionId');
    expect(result).toHaveProperty('redirectUrl');
    
    expect(result.success).toBe(true);
    expect(result.transactionId).toBeDefined();
    expect(result.redirectUrl).toBeDefined();
  });

  test('should verify payment', async () => {
    const transactionId = 'test_transaction_123';
    const result = await PaymentService.verifyPayment(transactionId);
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
    expect(result.success).toBe(true);
  });

  test('should check feature access', async () => {
    const hasAccess = await PaymentService.hasFeatureAccess('basic inventory tracking');
    
    expect(typeof hasAccess).toBe('boolean');
  });
});

describe('EncryptionService', () => {
  test('should encrypt and decrypt data', async () => {
    const testData = 'sensitive test data';
    
    const encryptedResult = await EncryptionService.encryptData(testData);
    expect(encryptedResult.success).toBe(true);
    expect(encryptedResult.data).toBeDefined();
    
    const decryptedResult = await EncryptionService.decryptData(encryptedResult.data!);
    expect(decryptedResult.success).toBe(true);
    expect(decryptedResult.data).toBe(testData);
  });

  test('should store and retrieve secure data', async () => {
    const testData = 'secure test data';
    const key = 'test_secure_key';
    
    const stored = await EncryptionService.storeSecureData(key, testData);
    expect(stored).toBe(true);
    
    const retrieved = await EncryptionService.getSecureData(key);
    expect(retrieved).toBe(testData);
  });
});

describe('PushNotificationService', () => {
  test('should initialize notification service', async () => {
    const initialized = await PushNotificationService.initialize();
    
    expect(typeof initialized).toBe('boolean');
  });

  test('should send immediate notification', async () => {
    const notificationId = await PushNotificationService.sendImmediateNotification({
      title: 'Test Notification',
      body: 'This is a test notification',
    });
    
    expect(notificationId).toBeDefined();
  });

  test('should schedule notification', async () => {
    const notificationId = await PushNotificationService.scheduleNotification({
      id: 'test_scheduled',
      title: 'Scheduled Test',
      body: 'This is a scheduled notification',
      trigger: { seconds: 60 },
    });
    
    expect(notificationId).toBeDefined();
  });
});

describe('ApiService', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn();
  });

  test('should make GET request', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' }),
    });

    const response = await ApiService.get('/test');
    
    expect(response.success).toBe(true);
    expect(response.data).toEqual({ data: 'test' });
  });

  test('should handle API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const response = await ApiService.get('/nonexistent');
    
    expect(response.success).toBe(false);
    expect(response.error).toContain('404');
  });

  test('should make POST request with data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ created: true }),
    });

    const response = await ApiService.post('/test', { name: 'test' });
    
    expect(response.success).toBe(true);
    expect(response.data).toEqual({ created: true });
  });
});

// Integration tests
describe('Integration Tests', () => {
  test('should complete full prediction workflow', async () => {
    // Get historical data
    const salesData = await DataService.getHistoricalSales(7);
    expect(salesData.length).toBeGreaterThan(0);
    
    // Generate prediction
    const prediction = await PredictionEngine.generateDemandPrediction('Sukuma Wiki', 3);
    expect(prediction.predictedDemand).toBeGreaterThan(0);
    
    // Generate notifications
    const notifications = await NotificationService.generateSmartNotifications();
    expect(Array.isArray(notifications)).toBe(true);
  });

  test('should handle offline workflow', async () => {
    // Save offline data
    await OfflineService.saveOfflineData('inventory', { item: 'test' });
    
    // Retrieve offline data
    const offlineData = await OfflineService.getOfflineData();
    expect(offlineData.length).toBeGreaterThan(0);
    
    // Sync offline data
    await OfflineService.syncOfflineData();
    // Should not throw error
  });
});
