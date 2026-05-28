import { db, loanOffersTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const OFFERS = [
  {
    lender: "Prime Capital",
    productName: "Personal Loan Plus",
    loanType: "personal",
    description: "Quick personal loan for any need. Instant approval, minimal docs.",
    minAmount: 1000,
    maxAmount: 50000,
    interestMin: 10.99,
    interestMax: 14.99,
    tenureMinMonths: 6,
    tenureMaxMonths: 60,
    processingFeePct: 1.5,
    rating: 4.7,
    featured: true,
  },
  {
    lender: "BlueRock Bank",
    productName: "Home Loan",
    loanType: "home",
    description: "Make your dream home a reality with competitive rates.",
    minAmount: 50000,
    maxAmount: 1000000,
    interestMin: 6.5,
    interestMax: 8.25,
    tenureMinMonths: 60,
    tenureMaxMonths: 360,
    processingFeePct: 0.5,
    rating: 4.8,
    featured: true,
  },
  {
    lender: "Drive Finance",
    productName: "Auto Loan",
    loanType: "auto",
    description: "Drive home today with flexible auto financing.",
    minAmount: 5000,
    maxAmount: 100000,
    interestMin: 7.99,
    interestMax: 11.5,
    tenureMinMonths: 12,
    tenureMaxMonths: 84,
    processingFeePct: 1.0,
    rating: 4.5,
    featured: true,
  },
  {
    lender: "EduFund",
    productName: "Education Loan",
    loanType: "education",
    description: "Invest in your future with low-rate education loans.",
    minAmount: 5000,
    maxAmount: 200000,
    interestMin: 5.99,
    interestMax: 9.5,
    tenureMinMonths: 24,
    tenureMaxMonths: 180,
    processingFeePct: 0,
    rating: 4.6,
    featured: false,
  },
  {
    lender: "BizGrow",
    productName: "Business Loan",
    loanType: "business",
    description: "Grow your business with working capital loans.",
    minAmount: 10000,
    maxAmount: 500000,
    interestMin: 9.5,
    interestMax: 13.5,
    tenureMinMonths: 12,
    tenureMaxMonths: 120,
    processingFeePct: 2.0,
    rating: 4.4,
    featured: false,
  },
  {
    lender: "QuickCash",
    productName: "Instant Cash Loan",
    loanType: "personal",
    description: "Get cash in 5 minutes for emergencies. Min docs.",
    minAmount: 500,
    maxAmount: 10000,
    interestMin: 14.99,
    interestMax: 19.99,
    tenureMinMonths: 3,
    tenureMaxMonths: 24,
    processingFeePct: 2.5,
    rating: 4.2,
    featured: false,
  },
  {
    lender: "GoldVault",
    productName: "Gold Loan",
    loanType: "gold",
    description: "Loan against gold at the best rates in the market.",
    minAmount: 1000,
    maxAmount: 100000,
    interestMin: 7.5,
    interestMax: 11.0,
    tenureMinMonths: 3,
    tenureMaxMonths: 36,
    processingFeePct: 0.5,
    rating: 4.6,
    featured: false,
  },
  {
    lender: "MediCare Plus",
    productName: "Medical Loan",
    loanType: "medical",
    description: "Healthcare financing for treatments and surgeries.",
    minAmount: 1000,
    maxAmount: 75000,
    interestMin: 8.99,
    interestMax: 12.99,
    tenureMinMonths: 6,
    tenureMaxMonths: 60,
    processingFeePct: 0,
    rating: 4.7,
    featured: false,
  },
];

async function main() {
  const existing = await db.execute(sql`SELECT COUNT(*)::int AS n FROM loan_offers`);
  const count = (existing.rows[0] as { n: number }).n;
  if (count > 0) {
    console.log(`loan_offers already has ${count} rows — skipping seed.`);
    process.exit(0);
  }
  await db.insert(loanOffersTable).values(OFFERS);
  console.log(`Inserted ${OFFERS.length} loan offers.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
