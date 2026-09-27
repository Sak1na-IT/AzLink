import type { Request, Response } from "express";

import * as areasService from "./areas.service";

export const listAreasHandler = async (_req: Request, res: Response) => {
  try {
    const areas = await areasService.getAreas();
    res.json(areas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verilənlər bazası xətası" });
  }
};

export const getAreaHandler = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const area = await areasService.getAreaById(id);

    if (!area) {
      return res.status(404).json({ message: "Ərazi tapılmadı" });
    }

    res.json(area);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verilənlər bazası xətası" });
  }
};
