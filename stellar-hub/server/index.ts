import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  createWallet,
  getWallets,
  getWallet,
  updateWalletBalance,
  deactivateWallet,
  getWalletTransactions
} from "./routes/wallets";
import {
  createTransaction,
  updateTransactionStatus
} from "./routes/transactions";
import { sendTransaction } from "./routes/send";
import { dbConnection } from "./config/database";
import { seedDatabase } from "./seed";
import { healthCheck } from "./routes/health";
import { debugWalletBalances, resetMockBalances } from "./routes/debug";

export function createServer() {
  const app = express();

  // CORS configuration for production and Chrome Extension
  const corsOptions = {
    origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      // Define allowed origins
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:8080',
        'https://your-wallet-frontend.onrender.com', // Your frontend domain
        /^chrome-extension:\/\/[a-z]{32}$/, // Chrome Extension pattern
        /^https:\/\/.*\.onrender\.com$/, // Any Render subdomain
        /^https:\/\/.*\.fly\.dev$/, // Any Fly.io subdomain
        /^https:\/\/[a-z0-9\-]+\.fly\.dev$/, // Fly.io app pattern
      ];

      // Check if origin is allowed
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        }
        return allowed.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database connection (gracefully handle failures)
  dbConnection.connect().catch(error => {
    console.warn('MongoDB connection failed, API will fall back to mock data:', error.message);
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Health check endpoint for Render
  app.get("/api/health", healthCheck);
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbConnection.isConnected() ? 'connected' : 'disconnected'
    });
  });

  // Wallet API routes
  app.post("/api/wallets", createWallet);
  app.get("/api/wallets", getWallets);
  app.get("/api/wallets/:id", getWallet);
  app.put("/api/wallets/:id/balance", updateWalletBalance);
  app.delete("/api/wallets/:id", deactivateWallet);
  app.get("/api/wallets/:id/transactions", getWalletTransactions);

  // Transaction API routes
  app.post("/api/transactions", createTransaction);
  app.put("/api/transactions/:txHash/status", updateTransactionStatus);
  app.post("/api/send", sendTransaction);

  // Database seed route
  app.post("/api/seed", async (_req, res) => {
    try {
      const result = await seedDatabase();
      if (result.success) {
        res.json({ success: true, message: "Database seeded successfully" });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Health check route that includes comprehensive database status
  app.get("/api/health", healthCheck);

  // Debug routes for development
  app.get("/api/debug/balances", debugWalletBalances);
  app.post("/api/debug/reset", resetMockBalances);

  return app;
}
