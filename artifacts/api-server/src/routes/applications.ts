import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  db,
  loanApplicationsTable,
  loanOffersTable,
  loansTable,
  emiPaymentsTable,
} from "@workspace/db";
import {
  ListMyLoanApplicationsResponse,
  CreateLoanApplicationBody,
  GetLoanApplicationParams,
  GetLoanApplicationResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/requireAuth";
import { notify } from "../lib/notify";

const router: IRouter = Router();

function calcEmi(principal: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return (principal * r * pow) / (pow - 1);
}

router.get("/loan-applications", requireAuth, async (req, res): Promise<void> => {
  const apps = await db
    .select()
    .from(loanApplicationsTable)
    .where(eq(loanApplicationsTable.userId, req.user!.id))
    .orderBy(desc(loanApplicationsTable.createdAt));
  res.json(ListMyLoanApplicationsResponse.parse(apps));
});

router.post("/loan-applications", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateLoanApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [offer] = await db
    .select()
    .from(loanOffersTable)
    .where(and(eq(loanOffersTable.id, parsed.data.offerId), eq(loanOffersTable.active, true)));
  if (!offer) {
    res.status(400).json({ error: "Offer not found or inactive" });
    return;
  }

  if (parsed.data.amount < offer.minAmount || parsed.data.amount > offer.maxAmount) {
    res.status(400).json({ error: `Amount must be between $${offer.minAmount} and $${offer.maxAmount}` });
    return;
  }
  if (parsed.data.tenureMonths < offer.tenureMinMonths || parsed.data.tenureMonths > offer.tenureMaxMonths) {
    res.status(400).json({ error: `Tenure must be between ${offer.tenureMinMonths} and ${offer.tenureMaxMonths} months` });
    return;
  }

  // For demo flow: auto-approve on submission and disburse a loan with EMI schedule.
  const [application] = await db
    .insert(loanApplicationsTable)
    .values({
      userId: req.user!.id,
      offerId: parsed.data.offerId,
      amount: parsed.data.amount,
      tenureMonths: parsed.data.tenureMonths,
      purpose: parsed.data.purpose,
      status: "disbursed",
    })
    .returning();

  const interestRate = (offer.interestMin + offer.interestMax) / 2;
  const emi = calcEmi(parsed.data.amount, interestRate, parsed.data.tenureMonths);
  const total = emi * parsed.data.tenureMonths;
  const now = new Date();
  const firstDue = new Date(now);
  firstDue.setMonth(firstDue.getMonth() + 1);

  const [loan] = await db
    .insert(loansTable)
    .values({
      applicationId: application.id,
      userId: req.user!.id,
      principal: parsed.data.amount,
      interestRate,
      tenureMonths: parsed.data.tenureMonths,
      emiAmount: Math.round(emi * 100) / 100,
      totalPayable: Math.round(total * 100) / 100,
      status: "active",
      nextDueDate: firstDue,
    })
    .returning();

  const emiRecords = Array.from({ length: parsed.data.tenureMonths }, (_, i) => {
    const due = new Date(now);
    due.setMonth(due.getMonth() + i + 1);
    return {
      loanId: loan.id,
      installmentNumber: i + 1,
      dueDate: due,
      amount: Math.round(emi * 100) / 100,
      status: "pending",
    };
  });
  await db.insert(emiPaymentsTable).values(emiRecords);

  await notify(
    req.user!.id,
    "loan_approved",
    "Loan Approved!",
    `Your ${offer.productName} of $${parsed.data.amount.toLocaleString()} has been approved and disbursed.`,
  );

  res.status(201).json(GetLoanApplicationResponse.parse(application));
});

router.get("/loan-applications/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetLoanApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [app] = await db
    .select()
    .from(loanApplicationsTable)
    .where(
      and(
        eq(loanApplicationsTable.id, params.data.id),
        eq(loanApplicationsTable.userId, req.user!.id),
      ),
    );
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  res.json(GetLoanApplicationResponse.parse(app));
});

export default router;
