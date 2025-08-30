# Akiba AI - Smart Food Waste Prediction App

**Akiba** means "Save" in Swahili - and that's exactly what this app does! It helps Kenyan restaurants and grocery stores save money and reduce food waste through AI-powered predictions.

## 🎯 Purpose

This app addresses **UN SDG #2 (Zero Hunger)** by helping food businesses:
- Predict customer demand accurately
- Reduce food waste through smart planning
- Share surplus food with the community
- Make data-driven inventory decisions

## 🚀 Key Features

### 1. **AI-Powered Predictions**
- Smart demand forecasting using multiple data sources
- Weather-based demand adjustments
- Local event impact analysis
- Social media sentiment integration

### 2. **Offline-First Design**
- Works in low-connectivity areas
- Automatic data sync when online
- Cached predictions for offline use
- Local data storage with AsyncStorage

### 3. **Kenyan Market Focus**
- Local food database (Sukuma Wiki, Ugali, Nyama, etc.)
- Cultural eating patterns integration
- Seasonal trend analysis
- Regional preference mapping

### 4. **Community Features**
- Surplus food sharing marketplace
- Community tips and advice
- Local impact tracking
- Waste reduction celebrations

### 5. **Smart Notifications**
- Expiry alerts with action suggestions
- Low stock warnings
- High demand predictions
- Surplus sharing opportunities

## 📱 Technical Implementation

### Data Sources Integration

The app integrates multiple data sources for accurate predictions:

#### 1. **Historical Sales Data**
```typescript
// Example: Track sales patterns
const salesData = await DataService.getHistoricalSales(30);
// Analyzes: quantity sold, time patterns, seasonal trends
```

#### 2. **Weather API Integration**
```typescript
// Example: Weather impact on demand
const weather = await DataService.getWeatherData(7);
// Considers: temperature, rainfall, humidity effects on food choices
```

#### 3. **Local Event Calendars**
```typescript
// Example: Event impact analysis
const events = await DataService.getLocalEvents(14);
// Tracks: holidays, festivals, sports events, religious celebrations
```

#### 4. **Supplier Delivery Schedules**
```typescript
// Example: Supply chain optimization
const schedules = await DataService.getSupplierSchedules();
// Manages: delivery timing, supplier reliability, lead times
```

#### 5. **Customer Foot Traffic Patterns**
```typescript
// Example: Traffic analysis
const traffic = await DataService.getFootTrafficPatterns();
// Analyzes: peak hours, daily patterns, customer flow
```

#### 6. **Social Media Sentiment**
```typescript
// Example: Social sentiment impact
const sentiment = await DataService.getSocialSentiment(7);
// Monitors: mentions, sentiment, trending foods, customer preferences
```

### Machine Learning Engine

The `PredictionEngine` combines all data sources:

```typescript
// Example: Generate smart predictions
const prediction = await PredictionEngine.generateDemandPrediction('Sukuma Wiki', 3);
// Returns: predicted demand, confidence level, contributing factors
```

### Offline Capabilities

Built for Kenya's connectivity challenges:

```typescript
// Example: Offline data management
await OfflineService.saveOfflineData('inventory', inventoryUpdate);
await OfflineService.syncOfflineData(); // When connection returns
```

## 🎨 Design Philosophy

### Human-Centric Approach
- **Large, touch-friendly buttons** - Easy to use with different hand sizes
- **High contrast colors** - Readable in bright African sunlight
- **Simple navigation** - Intuitive for users with varying tech experience
- **Cultural relevance** - Swahili terms and local context

### Accessibility Features
- **Clear typography** - Easy to read for all ages
- **Color-coded alerts** - Visual indicators for quick understanding
- **Voice-friendly** - Descriptive labels for screen readers
- **Offline indicators** - Clear communication about app status

### Performance Optimization
- **Minimal data usage** - Important for expensive data plans
- **Fast loading** - Cached content for instant access
- **Battery efficient** - Optimized for older devices
- **Progressive enhancement** - Core features work on all devices

## 🛠 Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router with tab-based layout
- **Storage**: AsyncStorage for offline data
- **Icons**: Lucide React Native
- **Styling**: StyleSheet (no external CSS frameworks)
- **State Management**: React hooks
- **Data Services**: Custom TypeScript services

## 📊 Data Flow

1. **Data Collection**: Multiple sources feed into the system
2. **AI Processing**: Machine learning engine analyzes patterns
3. **Prediction Generation**: Smart forecasts with confidence levels
4. **User Interface**: Clear, actionable insights displayed
5. **Offline Storage**: Critical data cached locally
6. **Community Sharing**: Surplus redistribution facilitated

## 🌍 Kenyan Market Adaptations

### Local Food Database
- Traditional foods like Ugali, Sukuma Wiki, Githeri
- Regional price variations
- Seasonal availability patterns
- Cultural significance ratings

### Market Patterns
- **Monday**: Fresh vegetable shopping day
- **Friday**: Ready-to-eat items surge (chapati, mandazi)
- **Saturday**: Main family shopping day
- **Sunday**: Special meal preparations

### Weather Considerations
- **Rainy season**: Increased demand for warm foods (ugali, githeri)
- **Hot weather**: Higher demand for fresh vegetables
- **Dry season**: Different transportation and storage needs

## 🎯 Impact Goals

- **25% reduction** in food waste for participating businesses
- **KSh 50,000+ savings** per business annually
- **500+ meals** recovered through community sharing
- **100+ businesses** using the platform in Nairobi area

## 🚀 Getting Started

1. **Install dependencies**: `npm install`
2. **Start development**: `npm run dev`
3. **Test offline mode**: Turn off internet to see offline features
4. **Explore features**: Navigate through all tabs to see functionality

## 📱 App Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Dashboard with key metrics
│   ├── inventory.tsx      # Stock management
│   ├── predictions.tsx    # AI demand forecasting
│   ├── analytics.tsx      # Waste tracking & insights
│   └── community.tsx      # Surplus sharing platform
├── services/
│   ├── DataService.ts     # Data collection & AI engine
│   ├── OfflineService.ts  # Offline functionality
│   └── NotificationService.ts # Smart alerts
└── utils/
    └── KenyanMarketData.ts # Local market knowledge
```

## 🎨 Design System

- **Primary Color**: `#D97706` (Warm orange - like Kenyan sunset)
- **Success Color**: `#10B981` (Green - like fertile farmland)
- **Warning Color**: `#F59E0B` (Amber - like maize)
- **Error Color**: `#EF4444` (Red - for urgent alerts)
- **Typography**: Clear, readable fonts with proper contrast
- **Spacing**: 8px grid system for consistent layout

## 🔮 Future Enhancements

- **Voice commands** in Swahili and English
- **Barcode scanning** for quick inventory updates
- **SMS integration** for areas with limited smartphone access
- **Micro-finance integration** for inventory funding
- **Farmer direct-connect** for supply chain optimization

---

**Built with ❤️ for the Kenyan food ecosystem**

*Reducing waste, one prediction at a time.*