import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Crown, Check, Star, CreditCard, Shield, Zap } from 'lucide-react-native';
import SafeAreaContainer from '@/components/SafeAreaContainer';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { PaymentService, PAYMENT_PLANS, UserSubscription } from '@/services/PaymentService';

export default function Subscription() {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  /**
   * Load current subscription status
   */
  const loadSubscriptionStatus = async () => {
    try {
      const subscription = await PaymentService.getUserSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  /**
   * Handle subscription upgrade/purchase
   */
  const handleSubscribe = async (planId: string) => {
    if (planId === 'basic') {
      Alert.alert('Free Plan', 'You are already on the free plan!');
      return;
    }

    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      // SECURITY: Payment initialization happens on server
      const result = await PaymentService.initializePayment(planId, 'stacygathoni30@gmail.com');
      
      if (result.success && result.redirectUrl) {
        // Open IntaSend checkout in browser
        const supported = await Linking.canOpenURL(result.redirectUrl);
        
        if (supported) {
          await Linking.openURL(result.redirectUrl);
          
          // Show payment verification dialog
          Alert.alert(
            'Payment Processing',
            'Complete your payment in the browser. Return here when done.',
            [
              {
                text: 'I completed payment',
                onPress: () => verifyPayment(result.transactionId!)
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          );
        } else {
          Alert.alert('Error', 'Cannot open payment page');
        }
      } else {
        Alert.alert('Payment Error', result.error || 'Failed to initialize payment');
      }
    } catch (error) {
      Alert.alert('Error', 'Payment initialization failed');
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  /**
   * Verify payment completion
   */
  const verifyPayment = async (transactionId: string) => {
    try {
      const result = await PaymentService.verifyPayment(transactionId);
      
      if (result.success) {
        Alert.alert('Success!', 'Payment completed successfully. Your subscription is now active.');
        await loadSubscriptionStatus(); // Refresh subscription status
      } else {
        Alert.alert('Payment Verification', 'Payment verification failed. Please contact support if you completed the payment.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify payment');
      console.error('Payment verification error:', error);
    }
  };

  /**
   * Handle subscription cancellation
   */
  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features.',
      [
        {
          text: 'Keep Subscription',
          style: 'cancel'
        },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            const success = await PaymentService.cancelSubscription();
            if (success) {
              Alert.alert('Cancelled', 'Your subscription has been cancelled.');
              await loadSubscriptionStatus();
            } else {
              Alert.alert('Error', 'Failed to cancel subscription. Please contact support.');
            }
          }
        }
      ]
    );
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return <Shield size={24} color="#6B7280" />;
      case 'pro':
        return <Star size={24} color="#D97706" />;
      case 'enterprise':
        return <Crown size={24} color="#8B5CF6" />;
      default:
        return <Shield size={24} color="#6B7280" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'pro':
        return '#D97706';
      case 'enterprise':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaContainer>
      <Header title="Subscription" subtitle="Unlock premium AI features" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Current Subscription Status */}
          {currentSubscription && (
            <Card style={styles.currentSubscriptionCard}>
              <View style={styles.currentSubscriptionHeader}>
                <View style={styles.currentSubscriptionInfo}>
                  <Text style={styles.currentSubscriptionTitle}>Current Plan</Text>
                  <Text style={styles.currentSubscriptionPlan}>
                    {PAYMENT_PLANS.find(p => p.id === currentSubscription.planId)?.name || 'Unknown Plan'}
                  </Text>
                  <Text style={styles.currentSubscriptionStatus}>
                    Status: {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                  </Text>
                </View>
                
                {currentSubscription.status === 'active' && currentSubscription.planId !== 'basic' && (
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleCancelSubscription}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {currentSubscription.status === 'active' && (
                <Text style={styles.expiryText}>
                  Expires: {new Date(currentSubscription.expiryDate).toLocaleDateString('en-KE')}
                </Text>
              )}
            </Card>
          )}

          {/* Payment Security Notice */}
          <Card style={styles.securityCard}>
            <View style={styles.securityHeader}>
              <Shield size={20} color="#10B981" />
              <Text style={styles.securityTitle}>Secure Payments by IntaSend</Text>
            </View>
            <Text style={styles.securityText}>
              All payments are processed securely through IntaSend, Kenya's trusted payment platform. 
              Your payment information is never stored on our servers.
            </Text>
          </Card>

          {/* Subscription Plans */}
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          {PAYMENT_PLANS.map((plan) => {
            const isCurrentPlan = currentSubscription?.planId === plan.id;
            const planColor = getPlanColor(plan.id);
            
            return (
              <Card 
                key={plan.id} 
                style={[
                  styles.planCard,
                  plan.popular && styles.popularPlanCard,
                  isCurrentPlan && styles.currentPlanCard
                ]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Star size={14} color="#FFFFFF" />
                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                  </View>
                )}
                
                <View style={styles.planHeader}>
                  <View style={styles.planInfo}>
                    {getPlanIcon(plan.id)}
                    <View style={styles.planTitleContainer}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <View style={styles.planPricing}>
                        <Text style={[styles.planPrice, { color: planColor }]}>
                          {plan.price === 0 ? 'Free' : `KSh ${plan.price.toLocaleString()}`}
                        </Text>
                        {plan.price > 0 && (
                          <Text style={styles.planDuration}>/{plan.duration}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Check size={16} color="#10B981" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    { backgroundColor: isCurrentPlan ? '#6B7280' : planColor },
                    (isLoading && selectedPlan === plan.id) && styles.subscribeButtonLoading
                  ]}
                  onPress={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || (isLoading && selectedPlan === plan.id)}
                >
                  <CreditCard size={18} color="#FFFFFF" />
                  <Text style={styles.subscribeButtonText}>
                    {isCurrentPlan 
                      ? 'Current Plan' 
                      : (isLoading && selectedPlan === plan.id)
                        ? 'Processing...'
                        : plan.price === 0 
                          ? 'Current Plan' 
                          : 'Subscribe Now'
                    }
                  </Text>
                </TouchableOpacity>
              </Card>
            );
          })}

          {/* Payment Methods */}
          <Card style={styles.paymentMethodsCard}>
            <Text style={styles.sectionTitle}>Accepted Payment Methods</Text>
            <View style={styles.paymentMethods}>
              <View style={styles.paymentMethod}>
                <Text style={styles.paymentMethodEmoji}>💳</Text>
                <Text style={styles.paymentMethodText}>Visa & Mastercard</Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text style={styles.paymentMethodEmoji}>📱</Text>
                <Text style={styles.paymentMethodText}>M-Pesa</Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text style={styles.paymentMethodEmoji}>🏦</Text>
                <Text style={styles.paymentMethodText}>Bank Transfer</Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text style={styles.paymentMethodEmoji}>💰</Text>
                <Text style={styles.paymentMethodText}>Airtel Money</Text>
              </View>
            </View>
          </Card>

          {/* FAQ */}
          <Card style={styles.faqCard}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Is my payment information secure?</Text>
              <Text style={styles.faqAnswer}>
                Yes! All payments are processed through IntaSend's secure platform. We never store your payment details.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
              <Text style={styles.faqAnswer}>
                Absolutely! You can cancel your subscription at any time. You'll continue to have access until your current billing period ends.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What happens to my data if I cancel?</Text>
              <Text style={styles.faqAnswer}>
                Your data remains safe and accessible. You'll just lose access to premium features but can resubscribe anytime.
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
  currentSubscriptionCard: {
    marginBottom: 24,
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
  },
  currentSubscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  currentSubscriptionInfo: {
    flex: 1,
  },
  currentSubscriptionTitle: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
    marginBottom: 4,
  },
  currentSubscriptionPlan: {
    fontSize: 18,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 2,
  },
  currentSubscriptionStatus: {
    fontSize: 12,
    color: '#166534',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  expiryText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  securityCard: {
    marginBottom: 24,
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803D',
  },
  securityText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  planCard: {
    marginBottom: 16,
    position: 'relative',
  },
  popularPlanCard: {
    borderColor: '#D97706',
    borderWidth: 2,
  },
  currentPlanCard: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 1,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    marginBottom: 16,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planTitleContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  planDuration: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  planFeatures: {
    marginBottom: 20,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  subscribeButtonLoading: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentMethodsCard: {
    marginBottom: 24,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  paymentMethodEmoji: {
    fontSize: 16,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  faqCard: {
    marginBottom: 24,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});