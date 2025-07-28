#!/usr/bin/env node

// Start script for Render deployment with enhanced error handling
console.log('🚀 Starting SafePal Wallet API...');
console.log('📍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || 3000);
console.log('🗄️ MongoDB URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('💾 Database:', process.env.MONGODB_DATABASE || 'safepal_wallet');

// Check critical environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  console.error('📝 Set it in Render Dashboard → Environment Variables');
  process.exit(1);
}

// Import and start the server
import('./dist/server/node-build.mjs')
  .then(() => {
    console.log('✅ Server module loaded successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error.message);
    console.error('🔍 Stack trace:', error.stack);
    console.error('💡 Check MongoDB connection and environment variables');
    process.exit(1);
  });

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('🔍 Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
