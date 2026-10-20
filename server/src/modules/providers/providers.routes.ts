import { Router } from "express";

import { authenticate } from "../../middleware/authenticate";
import {
  listProvidersHandler,
  getProviderHandler,
  getBusySlotsHandler,
  getRecentlyViewedHandler,
  recordViewHandler,
} from "./providers.controller";

const router = Router();

router.get("/", listProvidersHandler);
/* "/recent" "/:id"-dən əvvəl olmalıdır, yoxsa "recent" id kimi oxunar */
router.get("/recent", authenticate, getRecentlyViewedHandler);
router.get("/:id", getProviderHandler);
router.post("/:id/view", authenticate, recordViewHandler);
router.get("/:id/busy", authenticate, getBusySlotsHandler);

export default router;