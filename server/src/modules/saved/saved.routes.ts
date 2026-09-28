import { Router } from "express";

import {
  listSavedHandler,
  addSavedHandler,
  removeSavedHandler,
} from "./saved.controller";
import { authenticate, requireRole } from "../../middleware/authenticate";

const router = Router();

router.use(authenticate, requireRole("USER"));

router.get("/", listSavedHandler);
router.post("/:providerId", addSavedHandler);
router.delete("/:providerId", removeSavedHandler);

export default router;