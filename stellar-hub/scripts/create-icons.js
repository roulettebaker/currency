import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create icon directory
const iconsDir = path.join(__dirname, '../extension/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Base64 encoded minimal PNG files (1x1 transparent pixels that will be resized by the browser)
const createPNG = () => {
  // This is a minimal 1x1 transparent PNG
  return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
};

// Create all required icon sizes
const iconSizes = [16, 32, 48, 128];

iconSizes.forEach(size => {
  const filename = `icon${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, createPNG());
  console.log(`✅ Created ${filename}`);
});

console.log('🎉 All PNG icons created successfully!');
console.log('📁 Icons created in: extension/icons/');
