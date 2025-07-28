# 🔧 Render Deployment Fix Guide

## 🚨 **Current Issue**
```
npm error path /opt/render/project/src/package.json
npm error errno -2
npm error enoent Could not read package.json
```

**Root Cause**: Render can't find package.json because it's looking in the wrong directory.

## ✅ **Solution Options**

### **Option 1: Use Root package.json (Recommended)**

I've created a root `package.json` that will handle the build process:

1. **Root package.json** (created): Handles build commands from root
2. **Root render.yaml** (created): Proper Render configuration

### **Option 2: Manual Render Dashboard Configuration**

If Option 1 doesn't work, configure manually in Render Dashboard:

**Build Settings:**
```
Root Directory: stellar-hub
Build Command: npm install && npm run build
Start Command: npm start
```

**OR Alternative:**
```
Root Directory: (leave empty)
Build Command: cd stellar-hub && npm install && npm run build
Start Command: cd stellar-hub && npm start
```

### **Option 3: Repository Structure Fix**

If needed, we can restructure to put package.json in root and move stellar-hub contents up.

## 🔄 **Next Steps**

1. **Commit and push** the new files:
   ```bash
   git add package.json render.yaml
   git commit -m "Fix Render deployment configuration"
   git push
   ```

2. **Retry deployment** in Render Dashboard

3. **If still failing**, use Manual Configuration (Option 2)

## 🛠️ **Environment Variables to Set in Render**

Make sure these are set in your Render service environment:

```
MONGODB_URI=mongodb+srv://roulettebaker:123123Aa.@cluster0.pneek.mongodb.net/safepal_wallet
MONGODB_DATABASE=safepal_wallet
NODE_ENV=production
PORT=10000
```

## 🧪 **Testing After Deployment**

Once deployed, test these endpoints:
```bash
# Health check
curl https://your-app.onrender.com/health

# API test
curl https://your-app.onrender.com/api/ping

# Wallets endpoint
curl https://your-app.onrender.com/api/wallets
```

## 🔍 **Common Render Issues & Fixes**

**1. Build fails with npm error:**
- Check Build Command includes correct directory
- Verify package.json exists in build root

**2. Start command fails:**
- Ensure dist/ folder exists after build
- Check Start Command path is correct

**3. Service crashes on startup:**
- Check environment variables are set
- Verify MongoDB connection string
- Check Render logs for specific errors

**4. API endpoints return 404:**
- Verify routes are properly exported
- Check if build created all necessary files

Your deployment should now work! 🚀
