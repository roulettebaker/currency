#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Simple Render build process...');

try {
  console.log('📁 Changing to stellar-hub directory...');
  process.chdir('stellar-hub');
  console.log('📁 Current directory:', process.cwd());
  
  console.log('📦 Installing ALL dependencies...');
  // Force install all dependencies including dev
  execSync('npm install --production=false', { stdio: 'inherit' });
  
  console.log('🔍 Verifying vite installation...');
  // Check if vite is available
  try {
    execSync('npx vite --version', { stdio: 'inherit' });
    console.log('✅ Vite is available!');
  } catch (e) {
    console.log('❌ Vite not found, installing directly...');
    execSync('npm install vite@latest', { stdio: 'inherit' });
  }
  
  console.log('🔨 Building server...');
  execSync('npm run build:server', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
