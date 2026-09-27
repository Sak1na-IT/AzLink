import { Router } from "express";

import {
  signupHandler,
  signinHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
} from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.post("/signup", signupHandler);
router.post("/signin", signinHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);
router.get("/me", authenticate, meHandler);

export default router;