// src/drizzle/db.ts
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Read your DATABASE_URL from .env
const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  console.error("🛑 No DATABASE_URL in environment");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  // For Neon on many cloud providers you usually don’t need keepAlive;
  // the pool will reconnect automatically.
  // keepAlive: false,
  max: 10,                      // up to 10 concurrent clients
  idleTimeoutMillis: 30_000,    // close idle clients after 30s
  connectionTimeoutMillis: 5_000, // wait max 5s for a new client
  ssl: { rejectUnauthorized: false }, // required by Neon
});

// Surface any idle‐client errors (e.g. network issues)
pool.on("error", (err) => {
  console.error("🛑 Unexpected Postgres idle client error:", err);
});

// Initialize Drizzle‐ORM
const db = drizzle(pool, {
  schema,
  logger: true, // turn this off in production if you prefer
});

export default db;
