# 🚀 Safepal Wallet Render Deployment Guide

This guide covers deploying your Express + MongoDB Atlas backend to Render and configuring your Chrome Extension to work with the production backend.

## 📋 Prerequisites

- GitHub repository with your code
- MongoDB Atlas cluster running
- Render account (free tier available)

## 🛠️ Step 1: Render Web Service Setup

### 1.1 Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your repository (e.g., `your-username/stellar-hub`)

### 1.2 Configure Build Settings
```yaml
Name: safepal-wallet-backend
Environment: Node
Region: Oregon (US West) or closest to your users
Branch: main
Root Directory: stellar-hub
Build Command: npm install && npm run build
Start Command: npm start
```

### 1.3 Environment Variables
Set these in Render Dashboard → Environment:

**Required Variables:**
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://roulettebaker:123123Aa.@cluster0.pneek.mongodb.net/safepal_wallet
MONGODB_DATABASE=safepal_wallet
MONGODB_MAX_POOL_SIZE=10
MONGODB_SERVER_SELECTION_TIMEOUT=5000
MONGODB_SOCKET_TIMEOUT=45000
PING_MESSAGE=SafePal Wallet API is running on Render
```

**Optional Variables:**
```bash
VITE_API_URL=https://your-app-name.onrender.com/api
```

### 1.4 Advanced Settings
- **Health Check Path**: `/health`
- **Auto-Deploy**: Yes (recommended)

## 🔗 Step 2: Update Your URLs

### 2.1 Replace Placeholder URLs
After deployment, Render will give you a URL like: `https://safepal-wallet-backend-abc123.onrender.com`

Update these files with your actual URL:

**1. client/lib/config.ts:**
```typescript
export const API_ENDPOINTS = {
  development: 'http://localhost:8080/api',
  production: 'https://YOUR-RENDER-URL.onrender.com/api', // Replace with actual URL
  staging: 'https://YOUR-RENDER-URL-staging.onrender.com/api',
};
```

**2. server/index.ts CORS configuration:**
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'https://YOUR-RENDER-URL.onrender.com', // Replace with actual URL
  /^chrome-extension:\/\/[a-z]{32}$/,
  /^https:\/\/.*\.onrender\.com$/,
];
```

## 🔧 Step 3: MongoDB Atlas Network Access

### 3.1 Whitelist Render IPs
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Add `0.0.0.0/0` (Allow access from anywhere) - **For development only**
4. For production, add specific Render IP ranges (contact Render support for current IPs)

### 3.2 Database User Permissions
Ensure your MongoDB user has:
- `readWrite` access to `safepal_wallet` database
- Connection limit sufficient for your app

## 🌐 Step 4: Chrome Extension Updates

### 4.1 Rebuild Extension
```bash
cd stellar-hub
npm run build:extension
```

### 4.2 Test Extension Locally First
1. Load unpacked extension from `extension-dist/`
2. Open DevTools → Network tab
3. Open extension popup
4. Verify API calls go to your Render URL

### 4.3 Manifest Permissions Check
Ensure manifest.json includes:
```json
{
  "host_permissions": [
    "https://*/*",
    "https://*.onrender.com/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; connect-src 'self' https://* https://*.onrender.com"
  }
}
```

## 🧪 Step 5: Testing & Verification

### 5.1 Backend Health Check
```bash
curl https://YOUR-RENDER-URL.onrender.com/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-28T18:30:00.000Z",
  "database": "connected"
}
```

### 5.2 API Endpoints Test
```bash
# Test wallets endpoint
curl https://YOUR-RENDER-URL.onrender.com/api/wallets

# Test ping endpoint
curl https://YOUR-RENDER-URL.onrender.com/api/ping
```

### 5.3 Chrome Extension Testing
1. **Network Tab**: Check if requests reach your Render URL
2. **Console**: Look for CORS errors or connection failures
3. **Extension Popup**: Verify data loads from MongoDB
4. **Background Scripts**: Check for service worker errors

## 🚨 Troubleshooting

### Common Issues & Solutions

**❌ CORS Errors**
```
Access to fetch at 'https://your-app.onrender.com/api/wallets' 
from origin 'chrome-extension://abc123' has been blocked by CORS
```
**Solution**: Update CORS configuration in `server/index.ts` to include your extension ID

**❌ 503 Service Unavailable**
```
Service Temporarily Unavailable
```
**Solution**: 
- Check Render logs for startup errors
- Verify environment variables are set
- Check MongoDB connection string

**❌ Extension Not Loading Data**
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```
**Solution**:
- Verify Render service is running
- Check if URL in `client/lib/config.ts` is correct
- Ensure manifest.json has correct host permissions

**❌ MongoDB Connection Failed**
```
MongoNetworkTimeoutError: connection timed out
```
**Solution**:
- Check MongoDB Atlas Network Access settings
- Verify connection string format
- Increase timeout values in environment variables

### 5.4 Render Logs Debugging
```bash
# View logs in Render Dashboard or CLI
render logs YOUR-SERVICE-NAME --tail
```

### 5.5 Chrome Extension Debugging
1. Go to `chrome://extensions/`
2. Click "Service worker" or "background page" 
3. Check Console for errors
4. Use Network tab to verify API calls

## 🔒 Security Best Practices

### Production Checklist
- [ ] MongoDB Atlas: Restrict IP access (remove 0.0.0.0/0)
- [ ] Environment variables: Use Render's secure environment variables
- [ ] HTTPS: Ensure all API calls use HTTPS
- [ ] CORS: Restrict to specific origins (avoid wildcards)
- [ ] Rate Limiting: Implement API rate limiting (consider using middleware)
- [ ] Error Handling: Don't expose sensitive error details in production

### Chrome Extension Security
- [ ] CSP: Use strict Content Security Policy
- [ ] Permissions: Request minimum required permissions
- [ ] Storage: Use chrome.storage.local for sensitive data
- [ ] HTTPS: Only connect to HTTPS endpoints in production

## 📈 Performance Optimization

### Render Optimization
- **Cold Starts**: Keep service warm with health checks
- **Caching**: Implement Redis or in-memory caching
- **Database**: Use connection pooling (already configured)

### Extension Optimization
- **Caching**: Cache API responses locally
- **Background Sync**: Update data in background
- **Lazy Loading**: Load data on-demand

## 🎯 Production Deployment Checklist

- [ ] Render service deployed and healthy
- [ ] MongoDB Atlas connection working
- [ ] Environment variables configured
- [ ] CORS configured for Chrome Extension
- [ ] Health check endpoint responding
- [ ] API endpoints returning data
- [ ] Chrome Extension rebuilt with production URLs
- [ ] Extension tested with production backend
- [ ] Error monitoring setup (optional: Sentry integration)
- [ ] Backup strategy for MongoDB (Atlas automated backups)

## 📞 Support Resources

- **Render Support**: [https://render.com/docs](https://render.com/docs)
- **MongoDB Atlas**: [https://docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Chrome Extension**: [https://developer.chrome.com/docs/extensions](https://developer.chrome.com/docs/extensions)

---

🎉 **Your Safepal Wallet is now ready for production on Render!**
