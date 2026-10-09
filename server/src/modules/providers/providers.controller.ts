import type { Request, Response } from "express";

import * as providersService from "./providers.service";
import { getBusySlots } from "./provider-busy.service";

export const listProvidersHandler = async (req: Request, res: Response) => {
  try {
    const { search, area, service } = req.query;

    const providers = await providersService.getProviders({
      search: typeof search === "string" ? search : undefined,
      area: typeof area === "string" ? area : undefined,
      service: typeof service === "string" ? service : undefined,
    });

    res.json(providers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verilənlər bazası xətası" });
  }
};

export const getProviderHandler = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const provider = await providersService.getProviderById(id);

    if (!provider) {
      return res.status(404).json({ message: "Profil tapılmadı" });
    }

    res.json(provider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verilənlər bazası xətası" });
  }
};

/*
 * GET /api/providers/:id/busy?from=2026-10-06&to=2026-10-19
 * Biznesin tutulmuş vaxt aralıqları (şəxsi məlumat olmadan).
 */
export const getBusySlotsHandler = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { from, to } = req.query;

    if (typeof from !== "string" || typeof to !== "string") {
      return res
        .status(400)
        .json({ message: "Tarix aralığı (from və to) tələb olunur" });
    }

    const slots = await getBusySlots(id, from, to);

    res.json(slots);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_RANGE") {
      return res.status(400).json({
        message: "Tarix aralığı düzgün deyil (maksimum 62 gün, YYYY-MM-DD)",
      });
    }

    console.error(error);
    res.status(500).json({ message: "Verilənlər bazası xətası" });
  }
};