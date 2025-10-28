"use client";

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, Calendar, Target, Brain, Wifi, WifiOff, RefreshCw } from 'lucide-react-native';
import SafeAreaContainer from '@/components/SafeAreaContainer';
import Header from '@/components/Header';
import Card from '@/components/Card';
// PredictionEngine is available in services but not used in this UI component.
import { OfflineService } from '@/services/OfflineService';

interface PredictionItem {
  id: string;
  item: string;
  currentStock: number;
  predictedDemand: number;
  confidence: number;
  recommendation: string;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
}

const PREDICTIONS: PredictionItem[] = [
  {
    id: '1',
    item: 'Sukuma Wiki',
    currentStock: 25,
    predictedDemand: 35,
    confidence: 92,
    recommendation: 'Order 15 more bunches',
    trend: 'up',
    timeframe: 'Next 3 days'
  },
  {
    id: '2',
    item: 'Ugali Flour',
    currentStock: 50,
    predictedDemand: 30,
    confidence: 88,
    recommendation: 'Stock sufficient',
    trend: 'stable',
    timeframe: 'Next 5 days'
  },
  {
    id: '3',
    item: 'Tomatoes',
    currentStock: 15,
    predictedDemand: 40,
    confidence: 85,
    recommendation: 'Urgent: Order 30kg',
    trend: 'up',
    timeframe: 'Next 2 days'
  },
  {
    id: '4',
    item: 'Nyama (Beef)',
    currentStock: 8,
    predictedDemand: 6,
    confidence: 79,
    recommendation: 'Consider promotion',
    trend: 'down',
    timeframe: 'Next 4 days'
  }
];

export default function Predictions() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('3 days');
  const [predictions] = useState<PredictionItem[]>(PREDICTIONS);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const timeframes = ['24 hours', '3 days', '1 week', '2 weeks'];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={18} color="#10B981" />;
      case 'down':
        return <TrendingDown size={18} color="#EF4444" />;
      default:
        return <Target size={18} color="#6B7280" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.toLowerCase().includes('urgent')) return '#EF4444';
    if (recommendation.toLowerCase().includes('order')) return '#F59E0B';
    if (recommendation.toLowerCase().includes('promotion')) return '#3B82F6';
    return '#10B981';
  };

  const overallAccuracy = 87;
  const totalPredictions = predictions.length;

  const refreshPredictions = async () => {
    setIsLoading(true);
    
    try {
      // Check if we're online
      const online = await OfflineService.isOnline();
      setIsOnline(online);
      
      if (online) {
        // Generate new predictions using AI
        console.log('Generating fresh predictions...');
        // In production, this would update the predictions state
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing
        setLastUpdated(new Date());
      } else {
        // Use cached predictions
        const cached = await OfflineService.getCachedPredictions();
        console.log('Using cached predictions for offline mode');
      }
    } catch (error) {
      console.error('Error refreshing predictions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaContainer>
      <Header title="Akiba AI Predictions" subtitle="Smart demand forecasting" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Connection Status & Refresh */}
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.connectionStatus}>
                {isOnline ? (
                  <Wifi size={20} color="#10B981" />
                ) : (
                  <WifiOff size={20} color="#EF4444" />
                )}
                <Text style={[
                  styles.connectionText,
                  { color: isOnline ? '#10B981' : '#EF4444' }
                ]}>
                  {isOnline ? 'Online' : 'Offline Mode'}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.refreshButton, isLoading && styles.refreshButtonLoading]}
                onPress={refreshPredictions}
                disabled={isLoading}
              >
                <RefreshCw 
                  size={16} 
                  color="#FFFFFF" 
                  style={isLoading ? styles.spinning : {}}
                />
                <Text style={styles.refreshButtonText}>
                  {isLoading ? 'Updating...' : 'Refresh'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.lastUpdatedText}>
              Last updated: {lastUpdated.toLocaleTimeString('en-KE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </Card>

          {/* AI Overview */}
          <Card style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.aiIconContainer}>
                <Brain size={24} color="#8B5CF6" />
              </View>
              <View style={styles.overviewInfo}>
                <Text style={styles.overviewTitle}>Akiba AI Performance</Text>
                <Text style={styles.overviewSubtitle}>
                  Based on sales history, weather, events & social trends
                </Text>
              </View>
            </View>
            
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{overallAccuracy}%</Text>
                <Text style={styles.metricLabel}>Accuracy</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{totalPredictions}</Text>
                <Text style={styles.metricLabel}>Active Predictions</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>2.3x</Text>
                <Text style={styles.metricLabel}>Waste Reduction</Text>
              </View>
            </View>
          </Card>

          {/* Timeframe Selector */}
          <Card style={styles.timeframeCard}>
            <Text style={styles.sectionTitle}>Forecast Period</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.timeframeScroll}
            >
              {timeframes.map((timeframe) => (
                <TouchableOpacity
                  key={timeframe}
                  style={[
                    styles.timeframeButton,
                    selectedTimeframe === timeframe && styles.timeframeButtonActive
                  ]}
                  onPress={() => setSelectedTimeframe(timeframe)}
                >
                  <Calendar size={16} color={
                    selectedTimeframe === timeframe ? '#FFFFFF' : '#6B7280'
                  } />
                  <Text
                    style={[
                      styles.timeframeButtonText,
                      selectedTimeframe === timeframe && styles.timeframeButtonTextActive
                    ]}
                  >
                    {timeframe}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>

          {/* Predictions List */}
          <View style={styles.predictionsSection}>
            <Text style={styles.sectionTitle}>Demand Predictions</Text>
            
            {predictions.map((prediction: PredictionItem) => (
              <React.Fragment key={prediction.id}>
              <Card style={styles.predictionCard}>
                <View style={styles.predictionHeader}>
                  <View style={styles.predictionInfo}>
                    <Text style={styles.predictionItem}>{prediction.item}</Text>
                    <Text style={styles.predictionTimeframe}>{prediction.timeframe}</Text>
                  </View>
                  
                  <View style={styles.trendContainer}>
                    {getTrendIcon(prediction.trend)}
                    <Text style={[styles.confidenceText, { color: getTrendColor(prediction.trend) }]}>
                      {prediction.confidence}%
                    </Text>
                  </View>
                </View>

                <View style={styles.stockComparison}>
                  <View style={styles.stockItem}>
                    <Text style={styles.stockLabel}>Current Stock</Text>
                    <Text style={styles.stockValue}>{prediction.currentStock} units</Text>
                  </View>
                  
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                  
                  <View style={styles.stockItem}>
                    <Text style={styles.stockLabel}>Predicted Demand</Text>
                    <Text style={[styles.stockValue, { color: getTrendColor(prediction.trend) }]}>
                      {prediction.predictedDemand} units
                    </Text>
                  </View>
                </View>

                <View style={styles.predictionFooter}>
                  <View style={[
                    styles.recommendationBadge,
                    { backgroundColor: getRecommendationColor(prediction.recommendation) + '20' }
                  ]}>
                    <Text style={[
                      styles.recommendationText,
                      { color: getRecommendationColor(prediction.recommendation) }
                    ]}>
                      {prediction.recommendation}
                    </Text>
                  </View>
                </View>

                {/* Demand Gap Indicator */}
                <View style={styles.demandGap}>
                  <Text style={styles.demandGapLabel}>Demand Gap</Text>
                  <View style={styles.demandGapBar}>
                    <View 
                      style={[
                        styles.demandGapFill,
                        {
                          width: `${Math.min(100, (Math.abs(prediction.predictedDemand - prediction.currentStock) / prediction.predictedDemand) * 100)}%`,
                          backgroundColor: prediction.predictedDemand > prediction.currentStock ? '#EF4444' : '#10B981'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.demandGapValue}>
                    {prediction.predictedDemand > prediction.currentStock ? 'Shortage' : 'Surplus'}: {' '}
                    {Math.abs(prediction.predictedDemand - prediction.currentStock)} units
                  </Text>
                </View>
              </Card>
              </React.Fragment>
            ))}
          </View>

          {/* Market Insights */}
          <Card style={styles.insightsCard}>
            <Text style={styles.sectionTitle}>Kenyan Market Insights</Text>
            <View style={styles.insight}>
              <Text style={styles.insightTitle}>Weekend Pattern (Kenyan Market)</Text>
              <Text style={styles.insightText}>
                Fridays show 40% higher demand for ready-to-eat items like chapati and mandazi in Nairobi area
              </Text>
            </View>
            
            <View style={styles.insight}>
              <Text style={styles.insightTitle}>Post-Holiday Trend</Text>
              <Text style={styles.insightText}>
                January shows 25% increase in vegetable demand as families return to healthy eating
              </Text>
            </View>
            
            <View style={styles.insight}>
              <Text style={styles.insightTitle}>Weather Impact</Text>
              <Text style={styles.insightText}>
                Rainy days increase ugali and githeri demand by 30% - warm comfort foods preferred
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  statusCard: {
    marginBottom: 20,
    padding: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  refreshButtonLoading: {
    opacity: 0.7,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#6B7280',
  },
  overviewCard: {
    marginBottom: 24,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  overviewInfo: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeframeCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  timeframeScroll: {
    marginHorizontal: -4,
  },
  timeframeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
    gap: 6,
  },
  timeframeButtonActive: {
    backgroundColor: '#D97706',
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeframeButtonTextActive: {
    color: '#FFFFFF',
  },
  predictionsSection: {
    marginBottom: 24,
  },
  predictionCard: {
    marginBottom: 16,
    padding: 16,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  predictionInfo: {
    flex: 1,
  },
  predictionItem: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  predictionTimeframe: {
    fontSize: 14,
    color: '#6B7280',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stockComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  stockItem: {
    alignItems: 'center',
    flex: 1,
  },
  stockLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  arrowContainer: {
    paddingHorizontal: 16,
  },
  arrow: {
    fontSize: 18,
    color: '#6B7280',
  },
  predictionFooter: {
    marginBottom: 16,
  },
  recommendationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  demandGap: {
    marginTop: 8,
  },
  demandGapLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  demandGapBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginBottom: 6,
  },
  demandGapFill: {
    height: '100%',
    borderRadius: 3,
  },
  demandGapValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  insightsCard: {
    marginBottom: 24,
  },
  insight: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});