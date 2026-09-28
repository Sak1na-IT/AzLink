import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate";
import * as savedService from "./saved.service";

const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error && error.message === "PROVIDER_NOT_FOUND") {
    return res.status(404).json({ message: "Profil tapılmadı" });
  }

  console.error(error);
  res.status(500).json({ message: "Verilənlər bazası xətası" });
};

export const listSavedHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const providers = await savedService.listSaved(req.user.userId);

    res.json(providers);
  } catch (error) {
    handleError(error, res);
  }
};

export const addSavedHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    await savedService.addSaved(
      req.user.userId,
      String(req.params.providerId)
    );

    res.json({ saved: true });
  } catch (error) {
    handleError(error, res);
  }
};

export const removeSavedHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    await savedService.removeSaved(
      req.user.userId,
      String(req.params.providerId)
    );

    res.json({ saved: false });
  } catch (error) {
    handleError(error, res);
  }
};