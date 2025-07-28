# 🚀 Render Deployment Checklist

## ❌ Current Issue: "Instance failed" on Render

Your deployment is failing because the application is exiting early. Here's how to fix it:

## 🔧 Step 1: Environment Variables (CRITICAL)

**In your Render Dashboard, set these environment variables:**

```bash
# Required for MongoDB connection
MONGODB_URI=mongodb+srv://roulettebaker:123123Aa.@cluster0.pneek.mongodb.net/safepal_wallet
MONGODB_DATABASE=safepal_wallet
MONGODB_MAX_POOL_SIZE=10
MONGODB_SERVER_SELECTION_TIMEOUT=30000
MONGODB_SOCKET_TIMEOUT=45000

# Server configuration
NODE_ENV=production
PORT=10000
PING_MESSAGE=SafePal Wallet API is running on Render

# Debug (remove after deployment works)
DEBUG=*
```

## 🛠️ Step 2: Render Service Configuration

**Manual Configuration in Render Dashboard:**

```
Service Type: Web Service
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: stellar-hub

Build Command: npm install && npm run build:server
Start Command: node start-server.js

Health Check Path: /api/health
```

## 🔍 Step 3: Troubleshooting Commands

**Check logs in Render Dashboard to see:**

1. **Build Phase Errors**:
   - Dependencies installation failed
   - TypeScript compilation errors
   - Missing files

2. **Runtime Phase Errors**:
   - MongoDB connection timeout
   - Missing environment variables
   - Port binding issues

## 🎯 Step 4: Common Fixes

### Fix 1: MongoDB Connection Issues
```bash
# Increase timeouts in environment variables:
MONGODB_SERVER_SELECTION_TIMEOUT=30000
MONGODB_SOCKET_TIMEOUT=45000
```

### Fix 2: Port Configuration
```bash
# Render uses PORT environment variable:
PORT=10000
```

### Fix 3: Health Check
```bash
# Ensure health endpoint works:
curl https://your-app.onrender.com/api/health
```

## 🧪 Step 5: Test Locally First

Before deploying to Render, test the production build locally:

```bash
cd stellar-hub
npm install
npm run build:server
PORT=10000 NODE_ENV=production node start-server.js
```

## 📋 Step 6: MongoDB Atlas Network Access

1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (Allow access from anywhere)
3. Save changes

## 🔄 Step 7: Redeploy

1. Commit your changes:
```bash
git add .
git commit -m "Fix Render deployment configuration"
git push
```

2. Manually trigger deployment in Render Dashboard
3. Watch the logs for any errors

## 🎉 Success Indicators

When deployment works, you should see:
- ✅ Build completed successfully
- ✅ "Connecting to MongoDB..." in logs
- ✅ "Successfully connected to MongoDB database: safepal_wallet"
- ✅ "🚀 SafePal Wallet API server running on port 10000"
- ✅ Health check returns 200 OK

## 🆘 If Still Failing

1. **Check Render logs** for specific error messages
2. **Verify MongoDB Atlas** connection string and network access
3. **Test the build** locally first
4. **Contact Render support** if infrastructure issues persist

The most common cause is missing or incorrect MONGODB_URI environment variable.
