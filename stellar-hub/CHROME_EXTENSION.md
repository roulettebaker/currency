# Safepal Wallet Chrome Extension

A lightweight crypto asset manager for Ethereum and other EVM chains. Quickly send, receive, and track assets — all from your browser toolbar.

## 🚀 Features

- **Compact 380x600 popup design** optimized for Chrome Extension
- **Real-time balance updates** without page refresh
- **Multi-chain support** for Ethereum and EVM chains  
- **Send/Receive crypto** with intuitive UI
- **Transaction history** and portfolio tracking
- **Secure wallet management** with local storage

## 📦 Installation & Setup

### Development Setup

1. **Build the extension**:
   ```bash
   cd stellar-hub
   npm install
   npm run build:extension
   ```

2. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `stellar-hub/extension-dist` folder

3. **Pin the extension**:
   - Click the puzzle icon in Chrome toolbar
   - Find "Safepal Wallet Extension"
   - Click the pin icon to keep it visible

### Production Build

1. **Generate icons** (convert SVG to PNG):
   ```bash
   # Convert extension/icons/safepal-logo.svg to:
   # - icon16.png (16x16)
   # - icon32.png (32x32) 
   # - icon48.png (48x48)
   # - icon128.png (128x128)
   ```

2. **Build and package**:
   ```bash
   npm run build:extension
   zip -r safepal-extension.zip extension-dist/
   ```

## 🛠 Technical Architecture

### Key Optimizations

- **Fixed dimensions**: 380x600px popup window
- **No overflow**: Proper scrolling within popup
- **Z-index fixes**: Portal-based dropdowns
- **Performance**: Hardware-accelerated animations
- **Responsive**: Scales properly in different contexts

### File Structure

```
stellar-hub/
├── extension/
│   ├── manifest.json         # Extension configuration
│   ├── popup.html           # Popup window HTML
│   ├── popup.js             # Extension entry point
│   └── icons/               # Extension icons
├── client/
│   ├── chrome-extension.css # Popup-specific styles
│   └── ...                  # React app files
└── vite.config.extension.ts # Extension build config
```

### Chrome Extension Permissions

- `storage`: For wallet data persistence
- `activeTab`: For interacting with current tab
- `host_permissions`: For API calls to blockchain networks

## 🎨 UI Specifications

### Popup Window
- **Size**: 380x600 pixels
- **Layout**: Flexbox with proper overflow handling
- **Typography**: 13px base font, optimized line height
- **Colors**: Dark theme with SafePal branding

### Components Removed
- ✅ Database Debug panel
- ✅ Mock Data / Wi-Fi indicator  
- ✅ Sync Test button
- ✅ Floating action buttons
- ✅ Redundant $0 labels

### Components Optimized
- ✅ Compact header (50px height)
- ✅ Smaller action buttons (32px)
- ✅ Real-time balance updates
- ✅ Portal-based dropdowns
- ✅ Responsive coin list

## 🔧 Development

### Build Commands

```bash
# Development server (web version)
npm run dev

# Build extension
npm run build:extension

# Build everything
npm run build
```

### Testing

1. **Load extension** in Chrome development mode
2. **Open popup** by clicking extension icon
3. **Test functionality**:
   - Balance display
   - Send/receive flows
   - Transaction history
   - More menu dropdown
   - Responsive layout

### Debugging

- **Console logs**: Open popup → F12 → Console
- **React DevTools**: Install extension for debugging
- **Network requests**: Monitor in DevTools Network tab

## 📱 Browser Compatibility

- **Chrome**: v88+ (Manifest v3 support)
- **Edge**: v88+ (Chromium-based)
- **Opera**: v74+ (Chromium-based)
- **Brave**: v1.20+ (Chromium-based)

## 🔒 Security Considerations

- **Local storage**: Wallet data stored locally
- **No remote keys**: Private keys never transmitted
- **CSP**: Content Security Policy for XSS protection
- **Permissions**: Minimal required permissions

## 📦 Distribution

### Chrome Web Store
1. Create developer account
2. Upload `safepal-extension.zip`
3. Fill store listing details
4. Submit for review

### Manual Installation
1. Download release `.zip` file
2. Extract to local folder
3. Load unpacked in Chrome developer mode

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes to `client/` or `extension/` folders  
4. Test in Chrome extension environment
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

---

**SafePal Wallet Extension** - Bringing DeFi to your browser toolbar! 🚀
