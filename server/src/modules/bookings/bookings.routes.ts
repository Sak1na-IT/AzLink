import { Router } from "express";

import {
  createBookingHandler,
  listBookingsHandler,
  getBookingHandler,
  updateBookingStatusHandler,
  deleteBookingHandler,
} from "./bookings.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.post("/", createBookingHandler);
router.get("/", listBookingsHandler);
router.get("/:id", getBookingHandler);
router.patch("/:id", updateBookingStatusHandler);
router.delete("/:id", deleteBookingHandler);

export default router;