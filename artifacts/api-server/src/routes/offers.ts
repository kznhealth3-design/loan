import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, loanOffersTable } from "@workspace/db";
import {
  ListLoanOffersResponse,
  GetLoanOfferParams,
  GetLoanOfferResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/loan-offers", async (_req, res): Promise<void> => {
  const offers = await db
    .select()
    .from(loanOffersTable)
    .where(eq(loanOffersTable.active, true))
    .orderBy(desc(loanOffersTable.featured), desc(loanOffersTable.rating));
  res.json(ListLoanOffersResponse.parse(offers));
});

router.get("/loan-offers/:id", async (req, res): Promise<void> => {
  const params = GetLoanOfferParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [offer] = await db
    .select()
    .from(loanOffersTable)
    .where(and(eq(loanOffersTable.id, params.data.id), eq(loanOffersTable.active, true)));
  if (!offer) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }
  res.json(GetLoanOfferResponse.parse(offer));
});

export default router;
