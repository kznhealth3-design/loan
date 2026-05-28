import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./auth";

export const kycDocumentsTable = pgTable("kyc_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  docType: varchar("doc_type").notNull(),
  objectKey: varchar("object_key").notNull(),
  status: varchar("status").notNull().default("pending"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export type KycDocument = typeof kycDocumentsTable.$inferSelect;
export type InsertKycDocument = typeof kycDocumentsTable.$inferInsert;
