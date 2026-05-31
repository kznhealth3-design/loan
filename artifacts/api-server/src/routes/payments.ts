import { Router, type IRouter } from "express";
import { and, asc, eq, or } from "drizzle-orm";
import { db, emiPaymentsTable, loansTable } from "@workspace/db";
import { PayEmiBody, PayEmiResponse, CreateCheckoutSessionBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/requireAuth";
import { notify } from "../lib/notify";

const router: IRouter = Router();

router.post("/payments/pay-emi", requireAuth, async (req, res): Promise<void> => {
  const parsed = PayEmiBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [loan] = await db
    .select()
    .from(loansTable)
    .where(
      and(
        eq(loansTable.id, parsed.data.loanId),
        eq(loansTable.userId, req.user!.id),
      ),
    );

  if (!loan) {
    res.status(404).json({ error: "Loan not found" });
    return;
  }

  if (loan.status === "closed") {
    res.status(400).json({ error: "Loan is already closed" });
    return;
  }

  let emi;
  if (parsed.data.emiPaymentId) {
    const [found] = await db
      .select()
      .from(emiPaymentsTable)
      .where(
        and(
          eq(emiPaymentsTable.id, parsed.data.emiPaymentId),
          eq(emiPaymentsTable.loanId, loan.id),
        ),
      );
    emi = found;
  } else {
    const [next] = await db
      .select()
      .from(emiPaymentsTable)
      .where(
        and(
          eq(emiPaymentsTable.loanId, loan.id),
          or(
            eq(emiPaymentsTable.status, "pending"),
            eq(emiPaymentsTable.status, "overdue"),
          ),
        ),
      )
      .orderBy(asc(emiPaymentsTable.dueDate))
      .limit(1);
    emi = next;
  }

  if (!emi) {
    res.status(404).json({ error: "No pending EMI found for this loan" });
    return;
  }

  if (emi.status === "paid") {
    res.status(400).json({ error: "EMI already paid" });
    return;
  }

  const now = new Date();

  const [updatedEmi] = await db
    .update(emiPaymentsTable)
    .set({ status: "paid", paidAt: now })
    .where(eq(emiPaymentsTable.id, emi.id))
    .returning();

  const newAmountPaid = Math.round((loan.amountPaid + emi.amount) * 100) / 100;
  const allPaid = newAmountPaid >= loan.totalPayable - 0.01;

  const nextPendingRows = await db
    .select()
    .from(emiPaymentsTable)
    .where(
      and(
        eq(emiPaymentsTable.loanId, loan.id),
        or(
          eq(emiPaymentsTable.status, "pending"),
          eq(emiPaymentsTable.status, "overdue"),
        ),
      ),
    )
    .orderBy(asc(emiPaymentsTable.dueDate))
    .limit(1);

  const nextDueDate = nextPendingRows.length > 0 ? nextPendingRows[0].dueDate : null;

  await db
    .update(loansTable)
    .set({
      amountPaid: newAmountPaid,
      status: allPaid ? "closed" : "active",
      nextDueDate,
    })
    .where(eq(loansTable.id, loan.id));

  await notify(
    req.user!.id,
    "emi_payment",
    "EMI Payment Successful",
    `Your EMI #${emi.installmentNumber} of $${emi.amount.toFixed(2)} has been paid successfully.`,
  );

  res.json(PayEmiResponse.parse(updatedEmi));
});

router.post("/payments/checkout-session", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCheckoutSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.status(501).json({ error: "Stripe checkout not yet configured" });
});

export default router;
