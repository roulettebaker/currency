# MongoDB Setup and Configuration

This document explains how to configure MongoDB for the SafePal Wallet application using the centralized configuration system.

## Overview

The application uses a centralized MongoDB configuration system that allows you to change the database connection string in one place and have it update across the entire application.

## Configuration Files

### Primary Configuration File
- **Location**: `server/config/database.ts`
- **Purpose**: Contains all MongoDB connection settings and database connection logic

### Environment Variables
- **Location**: `.env` file (create from `.env.example`)
- **Purpose**: Stores sensitive configuration data like connection strings

## Environment Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with your MongoDB settings:**
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://your-mongodb-host:27017
   MONGODB_DATABASE=safepal_wallet
   MONGODB_MAX_POOL_SIZE=10
   MONGODB_SERVER_SELECTION_TIMEOUT=5000
   MONGODB_SOCKET_TIMEOUT=45000
   ```

## MongoDB Connection Options

### Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017
```

### MongoDB Atlas (Cloud)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
```

### MongoDB with Authentication
```env
MONGODB_URI=mongodb://username:password@localhost:27017/database
```

### MongoDB Replica Set
```env
MONGODB_URI=mongodb://host1:27017,host2:27017,host3:27017/database?replicaSet=myReplicaSet
```

## Database Schema

The application uses the following collections:

### Wallets Collection
```javascript
{
  _id: ObjectId,
  name: String,
  type: "native" | "imported",
  address: String,
  mnemonic: String,        // Only for native wallets
  privateKey: String,      // Encrypted
  publicKey: String,
  network: "ethereum" | "bsc" | "tron",
  balance: {
    [tokenSymbol]: Number
  },
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean
}
```

### Transactions Collection
```javascript
{
  _id: ObjectId,
  walletId: ObjectId,
  from: String,
  to: String,
  amount: Number,
  token: String,
  network: String,
  txHash: String,
  status: "pending" | "confirmed" | "failed",
  gasUsed: Number,
  gasPrice: Number,
  blockNumber: Number,
  timestamp: Date
}
```

## API Endpoints

### Wallet Endpoints
- `POST /api/wallets` - Create a new wallet
- `GET /api/wallets` - Get all active wallets
- `GET /api/wallets/:id` - Get wallet by ID
- `PUT /api/wallets/:id/balance` - Update wallet balance
- `DELETE /api/wallets/:id` - Deactivate wallet
- `GET /api/wallets/:id/transactions` - Get wallet transactions

### Transaction Endpoints
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:txHash/status` - Update transaction status

### Health Check
- `GET /api/health` - Check API and database status

## Usage in Code

### Server-side Usage
```typescript
import { getDatabase, getCollection } from '../config/database';

// Get database connection
const db = await getDatabase();

// Get specific collection
const walletCollection = await getCollection('wallets');
```

### Client-side Usage
```typescript
import { walletApi } from '../lib/api';

// Create a wallet
const wallet = await walletApi.createWallet({
  name: "My Wallet",
  type: "native",
  address: "0x...",
  publicKey: "0x...",
  network: "ethereum"
});

// Get all wallets
const wallets = await walletApi.getWallets();
```

## Development Setup

1. **Install MongoDB locally** or use MongoDB Atlas
2. **Create database and collections** (they will be created automatically on first use)
3. **Update environment variables** in `.env` file
4. **Start the application:**
   ```bash
   npm run dev
   ```

## Production Considerations

1. **Security**: Use MongoDB Atlas or properly secured MongoDB instance
2. **Authentication**: Enable MongoDB authentication
3. **SSL/TLS**: Use encrypted connections in production
4. **Backup**: Set up regular database backups
5. **Monitoring**: Monitor database performance and usage

## Troubleshooting

### Connection Issues
- Check if MongoDB is running
- Verify connection string format
- Check network connectivity
- Review authentication credentials

### Database Issues
- Check database permissions
- Verify collection names
- Review indexes for performance

### API Issues
- Check server logs for database connection errors
- Verify environment variables are loaded
- Test database connection with health check endpoint

## Changing MongoDB Configuration

To change the MongoDB connection string:

1. **Update the `.env` file:**
   ```env
   MONGODB_URI=your-new-mongodb-connection-string
   ```

2. **Restart the application:**
   ```bash
   npm run dev
   ```

That's it! The centralized configuration system will automatically use the new connection string across the entire application.
