#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Starting build process...');

try {
  console.log('📦 Building client...');
  execSync('npm run build:client', { stdio: 'inherit' });
  console.log('✅ Client build completed');

  console.log('🔧 Building server...');
  execSync('npm run build:server', { stdio: 'inherit' });
  console.log('✅ Server build completed');

  console.log('🎉 Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
