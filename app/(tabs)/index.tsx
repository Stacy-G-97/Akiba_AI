import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AlertTriangle, TrendingDown, TrendingUp, Package, DollarSign, Wifi, WifiOff, Brain } from 'lucide-react-native';
import SafeAreaContainer from '@/components/SafeAreaContainer';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { NotificationService, SmartNotification } from '@/services/NotificationService';
import { OfflineService } from '@/services/OfflineService';

interface DashboardStats {
  wasteReduction: number;
  costSavings: number;
  itemsExpiringSoon: number;
  predictionsAccuracy: number;
}

interface AlertItem {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  time: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    wasteReduction: 23,
    costSavings: 15420,
    itemsExpiringSoon: 12,
    predictionsAccuracy: 87,
  });

  const [alerts, setAlerts] = useState<SmartNotification[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * BEGINNER EXPLANATION:
   * This function runs when the app starts
   * It loads smart notifications and checks internet connection
   */
  useEffect(() => {
    loadSmartAlerts();
    checkConnectionStatus();
  }, []);

  /**
   * Load smart notifications from our AI service
   * BEGINNER NOTE: Gets helpful alerts based on current data
   */
  const loadSmartAlerts = async () => {
    setIsLoading(true);
    try {
      const smartNotifications = await NotificationService.generateSmartNotifications();
      setAlerts(smartNotifications.slice(0, 3)); // Show top 3 alerts
    } catch (error) {
      console.error('Error loading smart alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if device has internet connection
   * BEGINNER NOTE: Tests if we can connect to the internet
   */
  const checkConnectionStatus = async () => {
    const online = await OfflineService.isOnline();
    setIsOnline(online);
    
    if (online) {
      // Sync any offline data
      await OfflineService.syncOfflineData();
    }
  };

  /**
   * Get the right icon for each alert type
   * BEGINNER NOTE: Shows different icons for different types of alerts
   */
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={20} color="#F59E0B" />;
      case 'urgent':
        return <AlertTriangle size={20} color="#EF4444" />;
      case 'success':
        return <TrendingUp size={20} color="#10B981" />;
      default:
        return <AlertTriangle size={20} color="#3B82F6" />;
    }
  };

  /**
   * Get the right background color for each alert
   * BEGINNER NOTE: Different colors help users quickly understand alert importance
   */
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return '#FEF3C7';
      case 'urgent':
        return '#FEE2E2';
      case 'success':
        return '#ECFDF5';
      default:
        return '#DBEAFE';
    }
  };

  /**
   * Format time ago for alerts
   * BEGINNER NOTE: Shows how long ago an alert was created
   */
  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };
  return (
    <SafeAreaContainer>
      <Header 
        title="Akiba AI Dashboard" 
        subtitle="Karibu, Mama Njeri! (Welcome back!)" 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Connection Status */}
          <Card style={styles.connectionCard}>
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
                {isOnline ? 'Connected - Real-time predictions' : 'Offline - Using cached data'}
              </Text>
              <Brain size={16} color="#8B5CF6" />
            </View>
          </Card>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <TrendingDown size={24} color="#10B981" />
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  {stats.wasteReduction}%
                </Text>
              </View>
              <Text style={styles.statLabel}>Waste Reduced</Text>
              <Text style={styles.statSubtext}>This month</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <DollarSign size={24} color="#D97706" />
                <Text style={[styles.statValue, { color: '#D97706' }]}>
                  KSh {stats.costSavings.toLocaleString()}
                </Text>
              </View>
              <Text style={styles.statLabel}>Cost Savings</Text>
              <Text style={styles.statSubtext}>This month</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <Package size={24} color="#EF4444" />
                <Text style={[styles.statValue, { color: '#EF4444' }]}>
                  {stats.itemsExpiringSoon}
                </Text>
              </View>
              <Text style={styles.statLabel}>Items Expiring</Text>
              <Text style={styles.statSubtext}>Next 3 days</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <TrendingUp size={24} color="#3B82F6" />
                <Text style={[styles.statValue, { color: '#3B82F6' }]}>
                  {stats.predictionsAccuracy}%
                </Text>
              </View>
              <Text style={styles.statLabel}>Prediction Accuracy</Text>
              <Text style={styles.statSubtext}>Last 30 days</Text>
            </Card>
          </View>

          {/* Quick Actions */}
          <Card style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FEF3C7' }]}>
                <Package size={20} color="#D97706" />
                <Text style={[styles.actionButtonText, { color: '#D97706' }]}>
                  Add Stock
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#DBEAFE' }]}>
                <TrendingUp size={20} color="#3B82F6" />
                <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>
                  View Predictions
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Alerts */}
          <Card style={styles.alertsCard}>
            <View style={styles.alertsHeader}>
              <Text style={styles.sectionTitle}>Smart Alerts</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.alertsList}>
              {alerts.map((alert) => (
                <View key={alert.id} style={[styles.alertItem, { backgroundColor: getAlertColor(alert.type) }]}>
                  <View style={styles.alertContent}>
                    <View style={styles.alertHeader}>
                      {getAlertIcon(alert.type)}
                      <View style={styles.alertMeta}>
                        <Text style={styles.alertTime}>{getTimeAgo(alert.timestamp)}</Text>
                        {alert.actionRequired && (
                          <View style={styles.actionRequiredBadge}>
                            <Text style={styles.actionRequiredText}>Action Needed</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Today's Recommendations */}
          <Card style={styles.recommendationsCard}>
            <Text style={styles.sectionTitle}>Akiba AI Recommendations</Text>
            <View style={styles.recommendation}>
              <View style={styles.recommendationIcon}>
                <TrendingUp size={18} color="#10B981" />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>High Demand Expected</Text>
                <Text style={styles.recommendationText}>
                  Increase chapati preparation by 30% - Friday evening surge predicted based on local patterns
                </Text>
              </View>
            </View>
            
            <View style={styles.recommendation}>
              <View style={styles.recommendationIcon}>
                <AlertTriangle size={18} color="#F59E0B" />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>Promote Surplus Items</Text>
                <Text style={styles.recommendationText}>
                  Create special offer for 20kg potatoes expiring in 2 days - community sharing recommended
                </Text>
              </View>
            </View>
            
            <View style={styles.recommendation}>
              <View style={styles.recommendationIcon}>
                <Brain size={18} color="#8B5CF6" />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>Weather-Based Insight</Text>
                <Text style={styles.recommendationText}>
                  Rain expected tomorrow - increase ugali and githeri stock by 25%
                </Text>
              </View>
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
  connectionCard: {
    marginBottom: 20,
    padding: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertsCard: {
    marginBottom: 24,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '600',
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionRequiredBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  actionRequiredText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  recommendationsCard: {
    marginBottom: 24,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});