import { Router, type IRouter } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, loansTable, emiPaymentsTable } from "@workspace/db";
import {
  ListMyLoansResponse,
  GetLoanDetailParams,
  GetLoanDetailResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/requireAuth";

const router: IRouter = Router();

router.get("/loans", requireAuth, async (req, res): Promise<void> => {
  const loans = await db
    .select()
    .from(loansTable)
    .where(eq(loansTable.userId, req.user!.id))
    .orderBy(desc(loansTable.disbursedAt));
  res.json(ListMyLoansResponse.parse(loans));
});

router.get("/loans/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetLoanDetailParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [loan] = await db
    .select()
    .from(loansTable)
    .where(and(eq(loansTable.id, params.data.id), eq(loansTable.userId, req.user!.id)));
  if (!loan) {
    res.status(404).json({ error: "Loan not found" });
    return;
  }
  const emis = await db
    .select()
    .from(emiPaymentsTable)
    .where(eq(emiPaymentsTable.loanId, loan.id))
    .orderBy(asc(emiPaymentsTable.installmentNumber));
  res.json(GetLoanDetailResponse.parse({ loan, emis }));
});

export default router;
