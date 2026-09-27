import { Router } from "express";

import {
  listProvidersHandler,
  getProviderHandler,
} from "./providers.controller";

const router = Router();

router.get("/", listProvidersHandler);
router.get("/:id", getProviderHandler);

export default router;