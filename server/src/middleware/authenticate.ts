import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken, type TokenPayload } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Giriş tələb olunur" });
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Token etibarsız və ya bitib" });
  }
};

export const requireRole =
  (role: "USER" | "BUSINESS") =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res
        .status(403)
        .json({ message: "Bu əməliyyat üçün icazəniz yoxdur" });
    }

    next();
  };