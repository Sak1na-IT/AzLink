import { Router } from "express";

import {
  createReviewHandler,
  listReviewsHandler,
  listMyReviewsHandler,
} from "./reviews.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.get("/", listReviewsHandler);
router.get("/mine", authenticate, listMyReviewsHandler);
router.post("/", authenticate, createReviewHandler);

export default router;