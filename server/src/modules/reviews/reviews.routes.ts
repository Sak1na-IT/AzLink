import { Router } from "express";

import {
  createReviewHandler,
  listReviewsHandler,
  listMyReviewsHandler,
} from "./reviews.controller";
import { authenticate, requireRole } from "../../middleware/authenticate";

const router = Router();

router.get("/", listReviewsHandler);
router.get("/mine", authenticate, requireRole("USER"), listMyReviewsHandler);
router.post("/", authenticate, requireRole("USER"), createReviewHandler);

export default router;