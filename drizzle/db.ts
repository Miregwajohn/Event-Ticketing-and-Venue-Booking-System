import "dotenv/config"
import { Client } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"

export const client = new Client({
  connectionString: process.env.DATABASE_URL as string,
})

// Handle database connection errors gracefully
client.on("error", (err) => {
  console.error(" Postgres Client Error:", err.message)
  process.exit(1) // Optional: exit process if DB connection is lost
})

//   connect to the DB
const main = async () => {
  try {
    await client.connect()
    console.log("Connected to Neon PostgreSQL database")
  } catch (error) {
    console.error(" Failed to connect to DB:", error)
    process.exit(1)
  }
}

main()

const db = drizzle(client, { schema, logger: true })
export default db
