import { pgTable, varchar, integer, timestamp, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";
import { loanOffersTable } from "./offers";

export const loanApplicationsTable = pgTable("loan_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  offerId: varchar("offer_id").notNull().references(() => loanOffersTable.id),
  amount: real("amount").notNull(),
  tenureMonths: integer("tenure_months").notNull(),
  purpose: varchar("purpose").notNull(),
  status: varchar("status").notNull().default("submitted"),
  rejectionReason: varchar("rejection_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLoanApplicationSchema = createInsertSchema(loanApplicationsTable)
  .omit({ id: true, userId: true, status: true, rejectionReason: true, createdAt: true, updatedAt: true });
export type LoanApplication = typeof loanApplicationsTable.$inferSelect;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
