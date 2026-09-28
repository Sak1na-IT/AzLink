import { Router } from "express";

import {
  createBookingHandler,
  listBookingsHandler,
  getBookingHandler,
  updateBookingStatusHandler,
} from "./bookings.controller";
import { authenticate, requireRole } from "../../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.post("/", requireRole("USER"), createBookingHandler);
router.get("/", listBookingsHandler);
router.get("/:id", getBookingHandler);
router.patch("/:id", updateBookingStatusHandler);

export default router;