/**
 * MongoDB Database Connection
 * Handles connection pooling for Vercel serverless functions
 */

import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development mode, use a global variable to preserve the connection
// across hot reloads (prevents connection limit issues)
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // In development, use global variable to preserve connection
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Get MongoDB database instance
 */
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("rakshak"); // Database name
}

/**
 * Collections in the database
 */
export const COLLECTIONS = {
  SUBSCRIPTIONS: "subscriptions",
  REPORTS: "reports",
} as const;

/**
 * Initialize database indexes (call once on first deployment)
 */
export async function initializeIndexes() {
  const db = await getDb();
  
  // Subscriptions collection indexes
  await db.collection(COLLECTIONS.SUBSCRIPTIONS).createIndex(
    { district: 1, endpoint: 1 },
    { unique: true }
  );
  await db.collection(COLLECTIONS.SUBSCRIPTIONS).createIndex(
    { district: 1 }
  );
  await db.collection(COLLECTIONS.SUBSCRIPTIONS).createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 } // Auto-delete after 90 days
  );
  
  // Reports collection indexes
  await db.collection(COLLECTIONS.REPORTS).createIndex(
    { district: 1, timestamp: -1 }
  );
  await db.collection(COLLECTIONS.REPORTS).createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: 30 * 24 * 60 * 60 } // Auto-delete after 30 days
  );
  
  console.log("[DB] Indexes initialized successfully");
}

/**
 * Types for database documents
 */
export interface SubscriptionDocument {
  _id?: string;
  district: string;
  endpoint: string;
  subscription: PushSubscriptionJSON;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportDocument {
  _id?: string;
  district: string;
  category: string;
  summary: string;
  preventionTip: string;
  timestamp: number;
  createdAt: Date;
}
