import { Router } from "express";

import { listAreasHandler, getAreaHandler } from "./areas.controller";

const router = Router();

router.get("/", listAreasHandler);
router.get("/:id", getAreaHandler);

export default router;