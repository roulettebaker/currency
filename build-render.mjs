#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting Render build process...');
console.log('📁 Current directory:', process.cwd());

try {
  // Change to stellar-hub directory
  const stellarHubDir = path.join(__dirname, 'stellar-hub');
  console.log('📁 Changing to:', stellarHubDir);
  process.chdir(stellarHubDir);

  console.log('📁 Current directory after change:', process.cwd());

  // Debug: Check if package files exist
  console.log('🔍 Checking package files...');
  console.log('📄 package.json exists:', fs.existsSync('package.json'));
  console.log('📄 package-lock.json exists:', fs.existsSync('package-lock.json'));

  // Clean any existing node_modules and package-lock
  console.log('🧹 Cleaning existing installations...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }

  console.log('📦 Installing dependencies with clean install...');

  // Clear npm cache and install fresh
  execSync('npm cache clean --force', { stdio: 'inherit' });
  execSync('npm install', { stdio: 'inherit' });

  console.log('🔨 Building server...');
  // Build the server
  execSync('npm run build:server', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
