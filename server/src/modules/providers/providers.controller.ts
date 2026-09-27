import type { Request, Response } from "express";

import * as providersService from "./providers.service";

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