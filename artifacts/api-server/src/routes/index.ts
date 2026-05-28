import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import offersRouter from "./offers";
import applicationsRouter from "./applications";
import loansRouter from "./loans";
import notificationsRouter from "./notifications";
import kycRouter from "./kyc";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(offersRouter);
router.use(applicationsRouter);
router.use(loansRouter);
router.use(notificationsRouter);
router.use(kycRouter);
router.use(paymentsRouter);

export default router;
