import { Router } from "express";

import {
  signupHandler,
  signinHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  updateProfileHandler,
  changePasswordHandler,
  changeEmailHandler,
} from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.post("/signup", signupHandler);
router.post("/signin", signinHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);
router.get("/me", authenticate, meHandler);
router.patch("/me", authenticate, updateProfileHandler);
router.patch("/password", authenticate, changePasswordHandler);
router.patch("/email", authenticate, changeEmailHandler);

export default router;