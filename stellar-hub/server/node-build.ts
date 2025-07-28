import { createServer } from "./index";

// Log environment for debugging
console.log("🔍 Environment Variables:");
console.log("📍 NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("🔌 PORT (env):", process.env.PORT || "not set");
console.log("🔌 PORT (fallback):", process.env.PORT || 10000);

const app = createServer();
const port = parseInt(process.env.PORT || "10000", 10);

// API root endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "SafePal Wallet API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      api: "/api",
      wallets: "/api/wallets",
      transactions: "/api/transactions"
    }
  });
});

// 404 handler for non-API routes
app.get("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    available: "/api, /health"
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 SafePal Wallet API server running on port ${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
  console.log(`📊 Health: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
