import { Router } from "express";

import { authenticate } from "../../middleware/authenticate";
import {
  listProvidersHandler,
  getProviderHandler,
  getBusySlotsHandler,
} from "./providers.controller";

const router = Router();

router.get("/", listProvidersHandler);
router.get("/:id", getProviderHandler);
router.get("/:id/busy", authenticate, getBusySlotsHandler);

export default router;