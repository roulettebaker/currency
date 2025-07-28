import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy extension files to dist folder after Vite build
console.log('📦 Copying extension files...');

const sourceDir = path.join(__dirname, '../extension');
const distDir = path.join(__dirname, '../extension-dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// List what's in the dist directory
console.log('📁 Current dist directory contents:');
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  files.forEach(file => console.log(`   - ${file}`));
} else {
  console.log('   (directory does not exist)');
}

// Copy manifest.json
const manifestPath = path.join(sourceDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  fs.writeFileSync(
    path.join(distDir, 'manifest.json'), 
    JSON.stringify(manifest, null, 2)
  );
  console.log('✅ Copied manifest.json');
}

// Copy icons directory and create placeholder PNG files
const iconsSourceDir = path.join(sourceDir, 'icons');
const iconsDistDir = path.join(distDir, 'icons');

if (!fs.existsSync(iconsDistDir)) {
  fs.mkdirSync(iconsDistDir, { recursive: true });
}

// Copy existing icon files
if (fs.existsSync(iconsSourceDir)) {
  const iconFiles = fs.readdirSync(iconsSourceDir);
  iconFiles.forEach(file => {
    fs.copyFileSync(
      path.join(iconsSourceDir, file),
      path.join(iconsDistDir, file)
    );
  });
  console.log(`✅ Copied ${iconFiles.length} icon files`);
}

// Download and apply the exact SafePal icon that user wants
const requiredIcons = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];

// Always download the exact SafePal icon to ensure it's correct
console.log('📥 Downloading exact SafePal icon...');
const safePalIconUrl = 'https://cdn.builder.io/api/v1/image/assets%2F55a634f7c4424c2eac06bf16246d1388%2F5f6f643ebda44b2d9be71dd6127347af?format=png&width=128';

try {
  // Use curl to download the exact icon
  const { execSync } = require('child_process');
  const exactIconPath = path.join(iconsDistDir, 'safepal-exact.png');

  execSync(`curl -o "${exactIconPath}" "${safePalIconUrl}"`, { stdio: 'inherit' });
  console.log('✅ Downloaded exact SafePal icon');

  // Apply to all icon sizes
  requiredIcons.forEach(iconName => {
    const iconPath = path.join(iconsDistDir, iconName);
    fs.copyFileSync(exactIconPath, iconPath);
    console.log(`✅ Applied exact SafePal icon to ${iconName}`);
  });

} catch (error) {
  console.error('❌ Failed to download icon, using fallback');
  // Fallback if download fails
  const safePalIconData = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAAQ1JREFUeJzt3bEJwkAYQOH/wt77ynYQQZIu0oXkEDi4Gv2TyEtEZIxxznHOMcZYa4VSyuYLwFpLWmsZYzDGkFKi1oqu6959zjnOOdZaWms557wOlFJKKSWMMRhjKKWUUkoppZRijDHGMMZgjKGUUkoppZRSSimllFJKKaUUY4wxhjGGMQZjDKWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRS/gF+A9g6mDqYOpg6mDqYOpg6mDqYOpg6mDqYOpg6mDqYOpg6mDqYOpg6mDqY+gcfWu0sKEt1mAAAAABJRU5ErkJggg==';

  requiredIcons.forEach(iconName => {
    const iconPath = path.join(iconsDistDir, iconName);
    fs.writeFileSync(iconPath, Buffer.from(safePalIconData, 'base64'));
    console.log(`✅ Created fallback ${iconName}`);
  });
}

console.log('✅ SafePal PNG icons ready');

// Ensure popup.html exists (if Vite didn't copy it)
const popupHtmlPath = path.join(distDir, 'popup.html');
if (!fs.existsSync(popupHtmlPath)) {
  console.log('⚠️  popup.html missing, copying manually...');
  const sourcePopupPath = path.join(sourceDir, 'popup.html');
  if (fs.existsSync(sourcePopupPath)) {
    fs.copyFileSync(sourcePopupPath, popupHtmlPath);
    console.log('✅ Copied popup.html manually');
  } else {
    console.log('❌ popup.html source file not found!');
  }
}

// Final verification
console.log('');
console.log('🔍 Final verification:');
const criticalFiles = ['manifest.json', 'popup.html', 'popup.js', 'background.js'];
criticalFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

console.log('');
console.log('🎉 Extension build complete!');
console.log('📁 Files are ready in extension-dist/');
console.log('');
console.log('🚀 To install in Chrome:');
console.log('1. Open chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log('4. Select the extension-dist/ folder');
