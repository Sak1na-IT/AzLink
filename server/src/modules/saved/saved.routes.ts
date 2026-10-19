import { Router } from "express";

import {
  listSavedHandler,
  addSavedHandler,
  removeSavedHandler,
} from "./saved.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

/*
 * Hər iki rol üçün açıqdır: biznes hesabı da başqa ustaları
 * seçilmişlərə əlavə edə bilir (öz biznesi istisnadır, service-də yoxlanılır).
 */
router.use(authenticate);

router.get("/", listSavedHandler);
router.post("/:providerId", addSavedHandler);
router.delete("/:providerId", removeSavedHandler);

export default router;