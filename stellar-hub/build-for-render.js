#!/usr/bin/env node

// Simplified build script for Render deployment
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Render build process...');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });

  // Build only the server (no client needed for API)
  console.log('🔨 Building server...');
  execSync('npm run build:server', { stdio: 'inherit' });

  // Verify build output
  const serverBuild = './dist/server/node-build.mjs';
  if (fs.existsSync(serverBuild)) {
    console.log('✅ Server build successful!');
    console.log(`📁 Build output: ${serverBuild}`);
  } else {
    throw new Error('❌ Server build failed - output file not found');
  }

  console.log('🎉 Render build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
