import { MongoClient, Db } from 'mongodb';

export interface DatabaseConfig {
  connectionString: string;
  databaseName: string;
  maxPoolSize: number;
  serverSelectionTimeoutMS: number;
  socketTimeoutMS: number;
}

// Centralized MongoDB configuration
export const databaseConfig: DatabaseConfig = {
  connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  databaseName: process.env.MONGODB_DATABASE || 'safepal_wallet',
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
  serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '5000'),
  socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000'),
};

// MongoDB client instance (singleton pattern)
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private client: MongoClient | null = null;
  private database: Db | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<Db> {
    if (this.database) {
      return this.database;
    }

    try {
      console.log('Connecting to MongoDB...');
      
      this.client = new MongoClient(databaseConfig.connectionString, {
        maxPoolSize: databaseConfig.maxPoolSize,
        serverSelectionTimeoutMS: databaseConfig.serverSelectionTimeoutMS,
        socketTimeoutMS: databaseConfig.socketTimeoutMS,
      });

      await this.client.connect();
      this.database = this.client.db(databaseConfig.databaseName);
      
      console.log(`Successfully connected to MongoDB database: ${databaseConfig.databaseName}`);
      return this.database;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.database = null;
      console.log('Disconnected from MongoDB');
    }
  }

  public getDatabase(): Db | null {
    return this.database;
  }

  public isConnected(): boolean {
    return this.database !== null;
  }
}

// Export the singleton instance
export const dbConnection = DatabaseConnection.getInstance();

// Helper function to get database connection
export async function getDatabase(): Promise<Db> {
  return await dbConnection.connect();
}

// Helper function to get specific collections
export async function getCollection(collectionName: string) {
  const db = await getDatabase();
  return db.collection(collectionName);
}
