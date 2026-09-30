import { Router } from "express";

import {
  listPortfolioHandler,
  addPortfolioImageHandler,
  deletePortfolioImageHandler,
} from "./business-portfolio.controller";

const router = Router();

router.get("/", listPortfolioHandler);
router.post("/", addPortfolioImageHandler);
router.delete("/:id", deletePortfolioImageHandler);

export default router;