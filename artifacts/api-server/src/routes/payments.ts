import { Router, type IRouter } from "express";
import { CreateCheckoutSessionBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/requireAuth";

const router: IRouter = Router();

// Stripe checkout - deferred (M4 not configured)
router.post("/payments/checkout-session", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCheckoutSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.status(501).json({ error: "Stripe checkout not yet configured" });
});

export default router;
