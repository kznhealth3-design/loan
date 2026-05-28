import { pgTable, varchar, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";

export const userProfilesTable = pgTable("user_profiles", {
  userId: varchar("user_id").primaryKey().references(() => usersTable.id, { onDelete: "cascade" }),
  phone: varchar("phone"),
  dob: varchar("dob"),
  pan: varchar("pan"),
  employmentType: varchar("employment_type"),
  monthlyIncome: real("monthly_income"),
  companyName: varchar("company_name"),
  workExperienceMonths: integer("work_experience_months"),
  addressLine: varchar("address_line"),
  city: varchar("city"),
  state: varchar("state"),
  pincode: varchar("pincode"),
  acceptedTerms: boolean("accepted_terms").notNull().default(false),
  acceptedPrivacy: boolean("accepted_privacy").notNull().default(false),
  kycCompleted: boolean("kyc_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserProfileSchema = createInsertSchema(userProfilesTable).omit({ createdAt: true, updatedAt: true });
export type UserProfile = typeof userProfilesTable.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
