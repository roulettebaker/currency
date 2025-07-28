import { Request, Response } from 'express';
import { dbConnection } from '../config/database';

export async function healthCheck(req: Request, res: Response) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      mongodb: {
        connected: false,
        error: null as string | null
      },
      mockService: {
        available: true, // Always assume mock service is available since it's built-in
        error: null as string | null
      }
    }
  };

  // Check MongoDB connection
  try {
    health.database.mongodb.connected = dbConnection.isConnected();
    if (!health.database.mongodb.connected) {
      // Don't try to connect in health check to avoid hanging
      health.database.mongodb.error = 'MongoDB not connected';
    }
  } catch (error) {
    health.database.mongodb.error = error instanceof Error ? error.message : 'Unknown error';
    health.database.mongodb.connected = false;
  }

  // Overall status - always degraded if no MongoDB, but not error since fallback works
  if (!health.database.mongodb.connected) {
    health.status = 'degraded';
  }

  res.json(health);
}
