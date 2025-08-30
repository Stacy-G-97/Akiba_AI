import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Users, MapPin, Clock, Heart, MessageCircle, Share2, Search } from 'lucide-react-native';
import SafeAreaContainer from '@/components/SafeAreaContainer';
import Header from '@/components/Header';
import Card from '@/components/Card';

interface CommunityPost {
  id: string;
  user: string;
  location: string;
  timeAgo: string;
  type: 'surplus' | 'request' | 'tip';
  title: string;
  description: string;
  quantity?: string;
  price?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: '1',
    user: 'Mama Sarah - Kibera Market',
    location: 'Kibera, Nairobi',
    timeAgo: '2 hours ago',
    type: 'surplus',
    title: '20kg Fresh Tomatoes - Half Price',
    description: 'Good quality tomatoes, perfect for restaurants. Must sell today before they spoil. Clean, well-stored.',
    quantity: '20kg',
    price: 'KSh 800',
    likes: 12,
    comments: 5,
    isLiked: false
  },
  {
    id: '2',
    user: 'John - City Restaurant',
    location: 'CBD, Nairobi',
    timeAgo: '4 hours ago',
    type: 'request',
    title: 'Looking for Surplus Vegetables',
    description: 'Need vegetables for community soup kitchen this weekend. Any surplus donations welcome.',
    likes: 8,
    comments: 3,
    isLiked: true
  },
  {
    id: '3',
    user: 'Grace - Local Chef',
    location: 'Westlands, Nairobi',
    timeAgo: '6 hours ago',
    type: 'tip',
    title: 'Pro Tip: Preserve Sukuma Wiki',
    description: 'Blanch sukuma wiki for 2 minutes, then freeze. Extends life by 2 weeks and reduces waste!',
    likes: 25,
    comments: 8,
    isLiked: true
  },
  {
    id: '4',
    user: 'Peter - Kasarani Shop',
    location: 'Kasarani, Nairobi',
    timeAgo: '8 hours ago',
    type: 'surplus',
    title: 'Mixed Fruits - Quick Sale',
    description: 'Mangoes, oranges, and bananas. Still fresh but need to move quickly.',
    quantity: '15kg mixed',
    price: 'KSh 1200',
    likes: 6,
    comments: 2,
    isLiked: false
  }
];

export default function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { key: 'all', label: 'All Posts', count: posts.length },
    { key: 'surplus', label: 'Surplus', count: posts.filter(p => p.type === 'surplus').length },
    { key: 'request', label: 'Requests', count: posts.filter(p => p.type === 'request').length },
    { key: 'tip', label: 'Tips', count: posts.filter(p => p.type === 'tip').length },
  ];

  const filteredPosts = posts.filter(post => {
    const matchesFilter = selectedFilter === 'all' || post.type === selectedFilter;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'surplus':
        return '#10B981';
      case 'request':
        return '#3B82F6';
      case 'tip':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getPostTypeBackground = (type: string) => {
    switch (type) {
      case 'surplus':
        return '#ECFDF5';
      case 'request':
        return '#EFF6FF';
      case 'tip':
        return '#F5F3FF';
      default:
        return '#F9FAFB';
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'surplus':
        return '🥬';
      case 'request':
        return '🙏';
      case 'tip':
        return '💡';
      default:
        return '📝';
    }
  };

  return (
    <SafeAreaContainer>
      <Header title="Community" subtitle="Share, save, and help others" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Community Stats */}
          <Card style={styles.statsCard}>
            <Text style={styles.statsTitle}>Community Impact</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>156</Text>
                <Text style={styles.statLabel}>Meals Saved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2.3K</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>KSh 85K</Text>
                <Text style={styles.statLabel}>Value Recovered</Text>
              </View>
            </View>
          </Card>

          {/* Search */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search community posts..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          {/* Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === filter.key && styles.filterButtonTextActive
                  ]}
                >
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick Actions */}
          <Card style={styles.quickActionsCard}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#ECFDF5' }]}>
                <Text style={styles.quickActionEmoji}>🥬</Text>
                <Text style={[styles.quickActionText, { color: '#059669' }]}>Share Surplus</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#EFF6FF' }]}>
                <Text style={styles.quickActionEmoji}>🙏</Text>
                <Text style={[styles.quickActionText, { color: '#2563EB' }]}>Request Help</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#F5F3FF' }]}>
                <Text style={styles.quickActionEmoji}>💡</Text>
                <Text style={[styles.quickActionText, { color: '#7C3AED' }]}>Share Tip</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Posts */}
          <View style={styles.postsContainer}>
            {filteredPosts.map((post) => (
              <Card key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.userInfo}>
                    <View style={[
                      styles.postTypeIcon,
                      { backgroundColor: getPostTypeBackground(post.type) }
                    ]}>
                      <Text style={styles.postTypeEmoji}>{getPostTypeIcon(post.type)}</Text>
                    </View>
                    
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{post.user}</Text>
                      <View style={styles.locationTime}>
                        <MapPin size={12} color="#6B7280" />
                        <Text style={styles.locationText}>{post.location}</Text>
                        <Text style={styles.timeText}> • {post.timeAgo}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={[
                    styles.postTypeBadge,
                    { backgroundColor: getPostTypeBackground(post.type) }
                  ]}>
                    <Text style={[
                      styles.postTypeBadgeText,
                      { color: getPostTypeColor(post.type) }
                    ]}>
                      {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.postContent}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postDescription}>{post.description}</Text>
                  
                  {post.quantity && post.price && (
                    <View style={styles.surplusDetails}>
                      <View style={styles.surplusItem}>
                        <Text style={styles.surplusLabel}>Quantity:</Text>
                        <Text style={styles.surplusValue}>{post.quantity}</Text>
                      </View>
                      <View style={styles.surplusItem}>
                        <Text style={styles.surplusLabel}>Price:</Text>
                        <Text style={styles.surplusValue}>{post.price}</Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.postActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLike(post.id)}
                  >
                    <Heart 
                      size={18} 
                      color={post.isLiked ? '#EF4444' : '#6B7280'} 
                      fill={post.isLiked ? '#EF4444' : 'none'}
                    />
                    <Text style={[
                      styles.actionText,
                      post.isLiked && { color: '#EF4444' }
                    ]}>
                      {post.likes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <MessageCircle size={18} color="#6B7280" />
                    <Text style={styles.actionText}>{post.comments}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <Share2 size={18} color="#6B7280" />
                    <Text style={styles.actionText}>Share</Text>
                  </TouchableOpacity>

                  {post.type === 'surplus' && (
                    <TouchableOpacity style={styles.contactButton}>
                      <Text style={styles.contactButtonText}>Contact</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))}
          </View>

          {/* Community Guidelines */}
          <Card style={styles.guidelinesCard}>
            <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
            <View style={styles.guideline}>
              <Text style={styles.guidelineEmoji}>🤝</Text>
              <Text style={styles.guidelineText}>Be respectful and supportive to all members</Text>
            </View>
            <View style={styles.guideline}>
              <Text style={styles.guidelineEmoji}>🥗</Text>
              <Text style={styles.guidelineText}>Only share food that is safe for consumption</Text>
            </View>
            <View style={styles.guideline}>
              <Text style={styles.guidelineEmoji}>💚</Text>
              <Text style={styles.guidelineText}>Prioritize helping local community members</Text>
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
  statsCard: {
    marginBottom: 20,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
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
  filtersScroll: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#D97706',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  quickActionsCard: {
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  postsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  postCard: {
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  postTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  postTypeEmoji: {
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locationTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  postTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  postTypeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postContent: {
    marginBottom: 16,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  surplusDetails: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  surplusItem: {
    flex: 1,
  },
  surplusLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  surplusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  contactButton: {
    marginLeft: 'auto',
    backgroundColor: '#D97706',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  guidelinesCard: {
    marginBottom: 24,
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  guideline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  guidelineEmoji: {
    fontSize: 20,
  },
  guidelineText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
});