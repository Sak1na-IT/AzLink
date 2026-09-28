import { Router } from "express";

import {
  getBusinessProfileHandler,
  patchBusinessProfileHandler,
} from "./business.controller";
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

export default router;