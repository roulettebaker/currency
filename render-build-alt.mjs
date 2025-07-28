#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Alternative Render build process...');
console.log('📁 Working directory:', process.cwd());

// List current directory contents
console.log('📁 Current directory contents:');
execSync('ls -la', { stdio: 'inherit' });

console.log('🔍 Checking stellar-hub directory...');
if (!fs.existsSync('stellar-hub')) {
  console.error('❌ stellar-hub directory not found!');
  process.exit(1);
}

console.log('📁 stellar-hub directory contents:');
execSync('ls -la stellar-hub/', { stdio: 'inherit' });

try {
  console.log('📦 Installing dependencies in stellar-hub...');

  // Force fresh package-lock.json on Render
  console.log('🧹 Removing package-lock.json to force fresh install...');
  execSync('cd stellar-hub && rm -f package-lock.json', {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Method 1: Use full path approach with fresh install (including dev dependencies)
  execSync('cd stellar-hub && npm install --include=dev', {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Debug: Check if vite is actually installed
  console.log('🔍 Checking if vite is available...');
  try {
    execSync('cd stellar-hub && npx vite --version', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (e) {
    console.log('❌ vite not found in node_modules');
  }
  
  console.log('🔨 Building server...');
  execSync('cd stellar-hub && npm run build:server', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Fallback: Try with explicit working directory
  console.log('🔄 Trying fallback approach...');
  try {
    process.chdir('stellar-hub');
    console.log('📁 Changed to:', process.cwd());

    console.log('🧹 Removing package-lock.json in fallback...');
    execSync('rm -f package-lock.json', { stdio: 'inherit' });

    console.log('📦 Fresh install in fallback (with dev dependencies)...');
    execSync('npm install --include=dev', { stdio: 'inherit' });
    execSync('npm run build:server', { stdio: 'inherit' });
    
    console.log('✅ Fallback build successful!');
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError.message);
    process.exit(1);
  }
}
