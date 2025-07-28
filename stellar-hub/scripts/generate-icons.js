// Generate Chrome Extension icons from the SafePal logo
// This script creates different sized icons for the extension

const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, '../extension/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SafePal logo SVG (based on the provided icon)
const safePalLogo = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="20" fill="url(#gradient)"/>
  <path d="M32 48L64 24L96 48V80L64 104L32 80V48Z" fill="white"/>
  <path d="M48 40L64 32L80 40V56L64 64L48 56V40Z" fill="url(#innerGradient)"/>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366F1"/>
      <stop offset="100%" style="stop-color:#8B5CF6"/>
    </linearGradient>
    <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366F1"/>
      <stop offset="100%" style="stop-color:#4F46E5"/>
    </linearGradient>
  </defs>
</svg>`;

// Create SVG icon file
fs.writeFileSync(path.join(iconsDir, 'safepal-logo.svg'), safePalLogo);

console.log('SafePal extension icons generated successfully!');
console.log('Icons created in: extension/icons/');
console.log('');
console.log('Note: For production, convert the SVG to PNG files using:');
console.log('- icon16.png (16x16)');
console.log('- icon32.png (32x32)');
console.log('- icon48.png (48x48)');
console.log('- icon128.png (128x128)');
