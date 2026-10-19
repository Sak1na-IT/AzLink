import { Router } from "express";

import {
  getBusinessProfileHandler,
  patchBusinessProfileHandler,
  getDashboardHandler,
  getCustomersHandler,
  getBusinessReviewsHandler,
} from "./business.controller";
import businessServicesRoutes from "./business-services.routes";
import businessPortfolioRoutes from "./business-portfolio.routes";
import { authenticate, requireRole } from "../../middleware/authenticate";

const router = Router();

router.use(authenticate, requireRole("BUSINESS"));

router.get("/profile", getBusinessProfileHandler);
router.patch("/profile", patchBusinessProfileHandler);
router.get("/dashboard", getDashboardHandler);
router.get("/customers", getCustomersHandler);
router.get("/reviews", getBusinessReviewsHandler);

router.use("/services", businessServicesRoutes);
router.use("/portfolio", businessPortfolioRoutes);

export default router;