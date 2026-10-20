import { Router } from "express";

import {
  listNotificationsHandler,
  unreadCountHandler,
  markReadHandler,
  markAllReadHandler,
} from "./notifications.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

/* Hər iki rol üçün: hər kəs yalnız öz bildirişlərini görür */
router.use(authenticate);

router.get("/", listNotificationsHandler);
router.get("/unread-count", unreadCountHandler);
router.patch("/read-all", markAllReadHandler);
router.patch("/:id/read", markReadHandler);

export default router;
