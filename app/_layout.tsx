import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PushNotificationService } from '@/services/PushNotificationService';
import { PerformanceMonitoringService } from '@/services/PerformanceMonitoringService';
import { EncryptionService } from '@/services/EncryptionService';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Initialize all services
    const initializeServices = async () => {
      try {
        // Initialize performance monitoring
        await PerformanceMonitoringService.initialize();
        
        // Initialize push notifications
        await PushNotificationService.initialize();
        
        // Initialize encryption service
        await EncryptionService.generateSecureKey();
        
        console.log('All services initialized successfully');
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
