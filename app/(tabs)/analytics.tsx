import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ChartBar as BarChart2, TrendingDown, DollarSign, Target, Calendar } from 'lucide-react-native';
import SafeAreaContainer from '@/components/SafeAreaContainer';
import Header from '@/components/Header';
import Card from '@/components/Card';

const { width } = Dimensions.get('window');

interface WasteData {
  category: string;
  amount: number;
  cost: number;
  trend: number;
}

const WASTE_DATA: WasteData[] = [
  { category: 'Vegetables', amount: 15, cost: 1200, trend: -23 },
  { category: 'Fruits', amount: 8, cost: 800, trend: -15 },
  { category: 'Grains', amount: 5, cost: 400, trend: -30 },
  { category: 'Meat', amount: 3, cost: 1500, trend: -45 },
];

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  
  const periods = ['This Week', 'This Month', 'Last 3 Months', 'This Year'];

  const totalWasteKg = WASTE_DATA.reduce((sum, item) => sum + item.amount, 0);
  const totalWasteCost = WASTE_DATA.reduce((sum, item) => sum + item.cost, 0);
  const avgReduction = Math.round(WASTE_DATA.reduce((sum, item) => sum + Math.abs(item.trend), 0) / WASTE_DATA.length);

  const chartData = WASTE_DATA.map((item, index) => ({
    value: item.amount,
    label: item.category.slice(0, 3),
    frontColor: ['#D97706', '#10B981', '#3B82F6', '#EF4444'][index],
  }));

  return (
    <SafeAreaContainer>
      <Header title="Analytics" subtitle="Track your waste reduction progress" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Period Selector */}
          <Card style={styles.periodCard}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.periodScroll}
            >
              {periods.map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonActive
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Calendar size={16} color={
                    selectedPeriod === period ? '#FFFFFF' : '#6B7280'
                  } />
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive
                    ]}
                  >
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>

          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: '#FEE2E2' }]}>
                  <TrendingDown size={20} color="#EF4444" />
                </View>
                <Text style={styles.metricValue}>{totalWasteKg}kg</Text>
              </View>
              <Text style={styles.metricLabel}>Total Waste</Text>
              <Text style={styles.metricSubtext}>This month</Text>
            </Card>

            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: '#FEF3C7' }]}>
                  <DollarSign size={20} color="#D97706" />
                </View>
                <Text style={styles.metricValue}>KSh {totalWasteCost.toLocaleString()}</Text>
              </View>
              <Text style={styles.metricLabel}>Waste Cost</Text>
              <Text style={styles.metricSubtext}>This month</Text>
            </Card>

            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Target size={20} color="#10B981" />
                </View>
                <Text style={styles.metricValue}>{avgReduction}%</Text>
              </View>
              <Text style={styles.metricLabel}>Avg Reduction</Text>
              <Text style={styles.metricSubtext}>vs last month</Text>
            </Card>
          </View>

          {/* Waste by Category */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Waste by Category</Text>
            
            {/* Simple Bar Chart */}
            <View style={styles.chartContainer}>
              {WASTE_DATA.map((item, index) => {
                const barWidth = (item.amount / Math.max(...WASTE_DATA.map(d => d.amount))) * 200;
                const colors = ['#D97706', '#10B981', '#3B82F6', '#EF4444'];
                
                return (
                  <View key={item.category} style={styles.barItem}>
                    <View style={styles.barInfo}>
                      <Text style={styles.barLabel}>{item.category}</Text>
                      <Text style={styles.barValue}>{item.amount}kg</Text>
                    </View>
                    
                    <View style={styles.barContainer}>
                      <View 
                        style={[
                          styles.bar,
                          { 
                            width: barWidth,
                            backgroundColor: colors[index]
                          }
                        ]}
                      />
                    </View>
                    
                    <View style={styles.barTrend}>
                      <Text style={[
                        styles.trendText,
                        { color: item.trend < 0 ? '#10B981' : '#EF4444' }
                      ]}>
                        {item.trend}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Detailed Breakdown */}
          <Card style={styles.breakdownCard}>
            <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
            
            {WASTE_DATA.map((item, index) => (
              <View key={item.category} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <View style={styles.breakdownInfo}>
                    <Text style={styles.breakdownCategory}>{item.category}</Text>
                    <Text style={styles.breakdownAmount}>{item.amount}kg wasted</Text>
                  </View>
                  
                  <View style={styles.breakdownCost}>
                    <Text style={styles.costAmount}>KSh {item.cost.toLocaleString()}</Text>
                    <View style={[
                      styles.trendBadge,
                      { backgroundColor: item.trend < 0 ? '#DCFCE7' : '#FEE2E2' }
                    ]}>
                      <Text style={[
                        styles.trendBadgeText,
                        { color: item.trend < 0 ? '#16A34A' : '#DC2626' }
                      ]}>
                        {item.trend}%
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Progress towards zero waste */}
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Progress to Zero Waste</Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${Math.min(100, Math.abs(item.trend))}%`,
                          backgroundColor: '#10B981'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.abs(item.trend)}% improvement this month
                  </Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Impact Summary */}
          <Card style={styles.impactCard}>
            <Text style={styles.sectionTitle}>Environmental Impact</Text>
            
            <View style={styles.impactMetrics}>
              <View style={styles.impactItem}>
                <Text style={styles.impactValue}>2.1 tons</Text>
                <Text style={styles.impactLabel}>CO₂ Saved</Text>
                <Text style={styles.impactSubtext}>This year</Text>
              </View>
              
              <View style={styles.impactItem}>
                <Text style={styles.impactValue}>156</Text>
                <Text style={styles.impactLabel}>Meals Recovered</Text>
                <Text style={styles.impactSubtext}>Through community sharing</Text>
              </View>
              
              <View style={styles.impactItem}>
                <Text style={styles.impactValue}>KSh 45K</Text>
                <Text style={styles.impactLabel}>Total Savings</Text>
                <Text style={styles.impactSubtext}>Since using app</Text>
              </View>
            </View>
            
            <View style={styles.achievementBanner}>
              <Text style={styles.achievementText}>
                🎉 Achievement Unlocked: Waste Warrior! You've reduced food waste by over 25%
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
  periodCard: {
    marginBottom: 24,
    paddingVertical: 12,
  },
  periodScroll: {
    marginHorizontal: -4,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
    gap: 6,
  },
  periodButtonActive: {
    backgroundColor: '#D97706',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  chartCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  chartContainer: {
    gap: 16,
  },
  barItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barInfo: {
    width: 80,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 12,
    color: '#6B7280',
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  barTrend: {
    width: 50,
    alignItems: 'flex-end',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownCard: {
    marginBottom: 24,
  },
  breakdownItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  breakdownAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  breakdownCost: {
    alignItems: 'flex-end',
    gap: 4,
  },
  costAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  impactCard: {
    marginBottom: 24,
  },
  impactMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  impactItem: {
    alignItems: 'center',
    flex: 1,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
  },
  impactSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  achievementBanner: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  achievementText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});