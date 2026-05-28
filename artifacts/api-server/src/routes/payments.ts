import { Router, type IRouter } from "express";
import { CreateEmiCheckoutSessionParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/requireAuth";

const router: IRouter = Router();

// Stripe checkout - implemented in M4
router.post("/emis/:id/checkout-session", requireAuth, async (req, res): Promise<void> => {
  const params = CreateEmiCheckoutSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  res.status(501).json({ error: "Stripe checkout not yet configured" });
});

export default router;
