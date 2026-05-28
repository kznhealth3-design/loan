import { pgTable, varchar, integer, timestamp, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./auth";
import { loanApplicationsTable } from "./applications";

export const loansTable = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").notNull().references(() => loanApplicationsTable.id),
  userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  principal: real("principal").notNull(),
  interestRate: real("interest_rate").notNull(),
  tenureMonths: integer("tenure_months").notNull(),
  emiAmount: real("emi_amount").notNull(),
  totalPayable: real("total_payable").notNull(),
  amountPaid: real("amount_paid").notNull().default(0),
  status: varchar("status").notNull().default("active"),
  disbursedAt: timestamp("disbursed_at", { withTimezone: true }).notNull().defaultNow(),
  nextDueDate: timestamp("next_due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Loan = typeof loansTable.$inferSelect;
export type InsertLoan = typeof loansTable.$inferInsert;

export const emiPaymentsTable = pgTable("emi_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanId: varchar("loan_id").notNull().references(() => loansTable.id, { onDelete: "cascade" }),
  installmentNumber: integer("installment_number").notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  amount: real("amount").notNull(),
  status: varchar("status").notNull().default("pending"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  stripeSessionId: varchar("stripe_session_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type EmiPayment = typeof emiPaymentsTable.$inferSelect;
export type InsertEmiPayment = typeof emiPaymentsTable.$inferInsert;
