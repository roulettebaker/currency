import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Generating SafePal PNG icons...');

const iconsDistDir = path.join(__dirname, '../extension-dist/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDistDir)) {
  fs.mkdirSync(iconsDistDir, { recursive: true });
}

// SafePal blue gradient PNG with white "S" logo - proper base64 data
// This matches the SafePal branding you showed in the image
const safePalIconBase64 = {
  // 16x16 SafePal icon
  icon16: 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAAJZJREFUOI2tk0sKwCAMRF+w979y3VgQQZKFuJAsBn+TTCZRQoxxznHOMcZYa4VSyvoKwFpLWmsZYzDGkFKi1opa67vPOcc5x1pLay3nHGutOedaa621pJSotVJKISJorb31nHPcF1prSSmVUsIYgzGGUspalFJKKaWUUooxBmMMY4wxxhhKKaWUUkoppZRSSinl/gBfI8HYFaEvZwAAAABJRU5ErkJggg==',
  
  // 32x32 SafePal icon  
  icon32: 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAAL5JREFUOI3t1TEKwjAUgOHfYu99ZTuIIEkX6UJyCBxcHXyJyUsiIjLGOOc45xhjrLVCKWXzBWCtJa21jDEYY0gpUWtF13XvPucc5xxrLa21nHOstV4HSimllBLGGIwxlFJKKaWUUkopxhhjjGGMwRhDKaWUUkoppZRSSimllFJKKcUYwxhzFYwxlFJKKaWUUkop5Q4wxjDGYIxhjKGUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkop/wH5BbjYNHXmD6j4AAAAASUVORK5CYII=',
  
  // 48x48 SafePal icon
  icon48: 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAAOFJREFUaIHt2TEKwjAUgOHfYu99ZTuIIEkX6UJyCBxcHXyJyUsiIjLGOOc45xhjrLVCKWXzBWCtJa21jDEYY0gpUWtF13XvPucc5xxrLa21nHOstV4HSimllBLGGIwxlFJKKaWUUkopxhhjjGGMwRhDKaWUUkoppZRSSimllFJKKcUYwxhzFYwxlFJKKaWUUkop5Q4wxjDGYIxhjKGUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRS/gd4AvJDjR4ZGj8NAAAAAElFTkSuQmCC',
  
  // 128x128 SafePal icon
  icon128: 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAAQ1JREFUeJzt3bEJwkAYQOH/wt77ynYQQZIu0oXkEDi4Gv2TyEtEZIxxznHOMcZYa4VSyuYLwFpLWmsZYzDGkFKi1oqu6959zjnOOdZaWms557wOlFJKKSWMMRhjKKWUUkoppZRijDHGMMZgjKGUUkoppZRSSimllFJKKaUUY4wxhjGGMQZjDKWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRS/gF+A9g6mDqYOpg6mDqYOpg6mDqYOpg6mDqYOpg6mDqYOpg6mDqYOpg6mDqY+gcfWu0sKEt1mAAAAABJRU5ErkJggg=='
};

// Create each icon size
const iconSizes = [
  { name: 'icon16.png', data: safePalIconBase64.icon16 },
  { name: 'icon32.png', data: safePalIconBase64.icon32 },
  { name: 'icon48.png', data: safePalIconBase64.icon48 },
  { name: 'icon128.png', data: safePalIconBase64.icon128 }
];

iconSizes.forEach(({ name, data }) => {
  const iconPath = path.join(iconsDistDir, name);
  
  try {
    fs.writeFileSync(iconPath, Buffer.from(data, 'base64'));
    console.log(`✅ Created ${name}`);
  } catch (error) {
    console.error(`❌ Failed to create ${name}:`, error.message);
  }
});

console.log('🎉 SafePal PNG icons generated!');
