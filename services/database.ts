import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { desc, inArray, like } from 'drizzle-orm';
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

export interface MonthlyTotal {
  month: string;
  total: number;
  count: number;
}

export const getMonthlyTotals = (): MonthlyTotal[] => {
  const query = `
        SELECT
            substr(date, 1, 7) as month,
            SUM(total_amount) as total,
            COUNT(*) as count
        FROM receipts
        WHERE date IS NOT NULL AND date != ''
        GROUP BY substr(date, 1, 7)
        ORDER BY month DESC;
    `;
  // expo-sqlite's getAllSync returns an array of objects
  return expoDb.getAllSync(query) as MonthlyTotal[];
};



export const getReceiptsByMonth = async (month: string): Promise<Receipt[]> => {
  return await db.select()
    .from(receipts)
    .where(like(receipts.date, `${month}%`))
    .orderBy(desc(receipts.date), desc(receipts.createdAt));
};
