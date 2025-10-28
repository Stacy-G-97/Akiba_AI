# Akiba AI - Production Deployment Guide

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 📱 Platform-Specific Setup

### iOS Setup
1. Install Xcode
2. Configure iOS certificates
3. Update bundle identifier in `app.json`
4. Run: `npm run ios`

### Android Setup
1. Install Android Studio
2. Configure Android keystore
3. Update package name in `app.json`
4. Run: `npm run android`

### Web Setup
1. Install dependencies
2. Run: `npm run web`
3. Deploy to Vercel/Netlify

## 🔧 Configuration

### Environment Variables
- `EXPO_PUBLIC_API_URL`: Backend API URL
- `EXPO_PUBLIC_INTASEND_PUBLIC_KEY`: Payment gateway key
- `EXPO_PUBLIC_SUPABASE_URL`: Database URL
- `EXPO_PUBLIC_ANALYTICS_ID`: Analytics tracking ID

### App Configuration
- Update `app.json` with your app details
- Configure `eas.json` for EAS Build
- Set up proper bundle identifiers

## 🛠 Services Setup

### 1. Backend API
- Set up your backend server
- Configure authentication endpoints
- Implement inventory, predictions, and analytics APIs

### 2. Database (Supabase)
- Create Supabase project
- Run migrations from `supabase/migrations/`
- Configure RLS policies

### 3. Payment Gateway (IntaSend)
- Create IntaSend account
- Get API keys
- Configure webhook endpoints

### 4. Push Notifications
- Configure Expo notifications
- Set up notification channels
- Test notification delivery

## 📊 Monitoring & Analytics

### Performance Monitoring
- Built-in performance tracking
- Memory usage monitoring
- Error reporting

### Analytics
- User behavior tracking
- Feature usage analytics
- Performance metrics

## 🔒 Security

### Data Encryption
- Hardware-backed encryption
- Secure key storage
- Biometric authentication

### API Security
- JWT token authentication
- Rate limiting
- Input validation

## 🧪 Testing

### Run Tests
```bash
npm test
npm run test:watch
```

### Test Coverage
- Service layer tests
- Component tests
- Integration tests

## 📦 Deployment

### EAS Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build for production
eas build --platform all
```

### App Store Deployment
1. Build production version
2. Submit to App Store/Play Store
3. Configure store listings
4. Set up app review process

## 🚨 Troubleshooting

### Common Issues
1. **Build Failures**: Check dependencies and configuration
2. **API Errors**: Verify environment variables
3. **Permission Issues**: Check platform-specific permissions
4. **Performance Issues**: Monitor memory usage and optimize

### Debug Mode
```bash
EXPO_PUBLIC_DEBUG_MODE=true npm run dev
```

## 📞 Support

For technical support:
- Check documentation in `/docs`
- Review error logs
- Contact development team

## 🔄 Updates

### Updating Dependencies
```bash
npm update
npm audit fix
```

### App Updates
- Use EAS Update for OTA updates
- Test updates in staging environment
- Roll out gradually to users
