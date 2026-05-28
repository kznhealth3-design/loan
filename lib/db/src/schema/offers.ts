import { pgTable, varchar, integer, boolean, timestamp, real, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const loanOffersTable = pgTable("loan_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lender: varchar("lender").notNull(),
  productName: varchar("product_name").notNull(),
  loanType: varchar("loan_type").notNull(),
  description: text("description"),
  minAmount: real("min_amount").notNull(),
  maxAmount: real("max_amount").notNull(),
  interestMin: real("interest_min").notNull(),
  interestMax: real("interest_max").notNull(),
  tenureMinMonths: integer("tenure_min_months").notNull(),
  tenureMaxMonths: integer("tenure_max_months").notNull(),
  processingFeePct: real("processing_fee_pct").notNull().default(0),
  rating: real("rating").notNull().default(4.5),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LoanOffer = typeof loanOffersTable.$inferSelect;
export type InsertLoanOffer = typeof loanOffersTable.$inferInsert;
