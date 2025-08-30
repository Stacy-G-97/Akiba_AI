import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Search, Plus, Package, Calendar, CircleAlert as AlertCircle, Save, Wifi, WifiOff } from 'lucide-react-native';
import SafeAreaContainer from '@/components/SafeAreaContainer';
import Header from '@/components/Header';
import Card from '@/components/Card';
import OfflineIndicator from '@/components/OfflineIndicator';
import { OfflineService } from '@/services/OfflineService';
import { KENYAN_FOOD_DATABASE } from '@/utils/KenyanMarketData';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  status: 'good' | 'warning' | 'critical';
  cost: number;
}

const KENYAN_FOODS: InventoryItem[] = [
  {
    id: '1',
    name: 'Sukuma Wiki',
    category: 'Vegetables',
    quantity: 25,
    unit: 'bunches',
    expiryDate: '2025-01-17',
    status: 'good',
    cost: 500
  },
  {
    id: '2',
    name: 'Ugali Flour',
    category: 'Grains',
    quantity: 50,
    unit: 'kg',
    expiryDate: '2025-03-15',
    status: 'good',
    cost: 3200
  },
  {
    id: '3',
    name: 'Tomatoes',
    category: 'Vegetables',
    quantity: 15,
    unit: 'kg',
    expiryDate: '2025-01-16',
    status: 'critical',
    cost: 1200
  },
  {
    id: '4',
    name: 'Nyama (Beef)',
    category: 'Meat',
    quantity: 8,
    unit: 'kg',
    expiryDate: '2025-01-18',
    status: 'warning',
    cost: 4800
  },
  {
    id: '5',
    name: 'Githeri (Mixed)',
    category: 'Grains',
    quantity: 12,
    unit: 'kg',
    expiryDate: '2025-02-20',
    status: 'good',
    cost: 960
  },
  {
    id: '6',
    name: 'Mchicha',
    category: 'Vegetables',
    quantity: 8,
    unit: 'bunches',
    expiryDate: '2025-01-16',
    status: 'critical',
    cost: 320
  }
];

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>(KENYAN_FOODS);
  const [isOnline, setIsOnline] = useState(true);
  const [hasUnsyncedChanges, setHasUnsyncedChanges] = useState(false);

  /**
   * BEGINNER EXPLANATION:
   * This function saves inventory changes even when offline
   * The data will be uploaded when internet connection returns
   */
  const saveInventoryChange = async (change: any) => {
    try {
      // Save to offline storage
      await OfflineService.saveOfflineData('inventory', change);
      setHasUnsyncedChanges(true);
      
      // Try to sync if online
      const online = await OfflineService.isOnline();
      setIsOnline(online);
      
      if (online) {
        await OfflineService.syncOfflineData();
        setHasUnsyncedChanges(false);
      }
    } catch (error) {
      console.error('Error saving inventory change:', error);
    }
  };
  const categories = ['All', 'Vegetables', 'Grains', 'Meat', 'Dairy', 'Fruits'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'critical':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'good':
        return '#ECFDF5';
      case 'warning':
        return '#FEF3C7';
      case 'critical':
        return '#FEE2E2';
      default:
        return '#F3F4F6';
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <SafeAreaContainer>
      <Header title="Akiba AI Inventory" subtitle="Smart stock management" />
      
      <OfflineIndicator />
      
      <View style={styles.container}>
        {/* Sync Status */}
        {hasUnsyncedChanges && (
          <Card style={styles.syncCard}>
            <View style={styles.syncStatus}>
              <Save size={16} color="#F59E0B" />
              <Text style={styles.syncText}>
                Changes saved locally. Will sync when online.
              </Text>
            </View>
          </Card>
        )}

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#6B7280"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              setShowAddModal(true);
              // Save action offline
              saveInventoryChange({ action: 'add_item_modal_opened', timestamp: Date.now() });
            }}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Inventory List */}
        <ScrollView style={styles.inventoryList} showsVerticalScrollIndicator={false}>
          {filteredInventory.map((item) => {
            const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
            
            return (
              <Card key={item.id} style={styles.inventoryCard}>
                <View style={styles.inventoryItem}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                    </View>
                    
                    <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(item.status) }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemDetails}>
                    <View style={styles.detailItem}>
                      <Package size={16} color="#6B7280" />
                      <Text style={styles.detailText}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Calendar size={16} color="#6B7280" />
                      <Text style={[
                        styles.detailText,
                        daysUntilExpiry <= 2 && { color: '#EF4444', fontWeight: '600' }
                      ]}>
                        {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expired'}
                      </Text>
                    </View>
                    
                    <Text style={styles.costText}>
                      KSh {item.cost.toLocaleString()}
                    </Text>
                  </View>

                  {daysUntilExpiry <= 2 && daysUntilExpiry > 0 && (
                    <View style={styles.warningBanner}>
                      <AlertCircle size={16} color="#F59E0B" />
                      <Text style={styles.warningText}>
                        Expiring soon - consider promotion, community sharing, or use first
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  syncCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FEF3C7',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#D97706',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  inventoryList: {
    flex: 1,
  },
  inventoryCard: {
    marginBottom: 12,
    padding: 16,
  },
  inventoryItem: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  costText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
    flex: 1,
  },
});