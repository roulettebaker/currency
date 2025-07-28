#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Build script for Chrome Extension
console.log('🚀 Building Safepal Wallet Chrome Extension...');

const sourceDir = path.join(__dirname, '../extension');
const distDir = path.join(__dirname, '../extension-dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy manifest.json
const manifest = JSON.parse(fs.readFileSync(path.join(sourceDir, 'manifest.json'), 'utf8'));
fs.writeFileSync(
  path.join(distDir, 'manifest.json'), 
  JSON.stringify(manifest, null, 2)
);

// Copy icons directory if it exists
const iconsSourceDir = path.join(sourceDir, 'icons');
const iconsDistDir = path.join(distDir, 'icons');

if (fs.existsSync(iconsSourceDir)) {
  if (!fs.existsSync(iconsDistDir)) {
    fs.mkdirSync(iconsDistDir, { recursive: true });
  }
  
  const iconFiles = fs.readdirSync(iconsSourceDir);
  iconFiles.forEach(file => {
    fs.copyFileSync(
      path.join(iconsSourceDir, file),
      path.join(iconsDistDir, file)
    );
  });
}

console.log('✅ Extension files copied to extension-dist/');
console.log('');
console.log('📋 Next steps:');
console.log('1. Run: npm run build:extension');
console.log('2. Load extension-dist/ folder in Chrome');
console.log('3. Enable "Developer mode" in chrome://extensions/');
console.log('');
console.log('🎯 Extension ready for testing!');
