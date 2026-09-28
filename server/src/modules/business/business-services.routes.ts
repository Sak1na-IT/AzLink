import { Router } from "express";

import {
  listServicesHandler,
  createServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
} from "./business-services.controller";

const router = Router();

router.get("/", listServicesHandler);
router.post("/", createServiceHandler);
router.patch("/:id", updateServiceHandler);
router.delete("/:id", deleteServiceHandler);

export default router;