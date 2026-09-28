import { Router } from "express";

import {
  getBusinessProfileHandler,
  patchBusinessProfileHandler,
} from "./business.controller";
import businessServicesRoutes from "./business-services.routes";
import { authenticate, requireRole } from "../../middleware/authenticate";

const router = Router();

router.get(
  "/profile",
  authenticate,
  requireRole("BUSINESS"),
  getBusinessProfileHandler
);
router.patch(
  "/profile",
  authenticate,
  requireRole("BUSINESS"),
  patchBusinessProfileHandler
);

router.use(
  "/services",
  authenticate,
  requireRole("BUSINESS"),
  businessServicesRoutes
);

export default router;