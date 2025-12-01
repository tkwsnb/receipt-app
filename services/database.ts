import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

const expoDb = openDatabaseSync("receipts.db");
export const db = drizzle(expoDb);

export const receipts = sqliteTable("receipts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    storeName: text("store_name"),
    date: text("date"),
    totalAmount: integer("total_amount"),
    rawText: text("raw_text"),
    imageUri: text("image_uri"), // Path to the saved image (if we decide to keep it)
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;

// Simple initialization to ensure table exists
export const initDatabase = () => {
    const query = `
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT,
      date TEXT,
      total_amount INTEGER,
      raw_text TEXT,
      image_uri TEXT,
      created_at INTEGER
    );
  `;
    expoDb.execSync(query);
};
