import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate";
import * as businessService from "./business.service";
import * as dashboardService from "./business-dashboard.service";

export const getBusinessProfileHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const profile = await businessService.getBusinessProfileByUserId(
      req.user.userId
    );

    if (!profile) {
      return res.status(404).json({ message: "Biznes profili tapılmadı" });
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verilənlər bazası xətası" });
  }
};

export const patchBusinessProfileHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const { businessName, category, areaId, phone, description, schedule } =
      req.body;

    if (!businessName || !areaId || !phone || !schedule) {
      return res
        .status(400)
        .json({ message: "Ad, ərazi, telefon və iş saatları vacibdir" });
    }

    const profile = await businessService.saveBusinessProfile(
      req.user.userId,
      {
        businessName,
        category: category ?? "",
        areaId,
        phone,
        description: description ?? "",
        schedule,
      }
    );

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verilənlər bazası xətası" });
  }
};

const handleDashboardError = (error: unknown, res: Response) => {
  if (error instanceof Error && error.message === "BUSINESS_NOT_FOUND") {
    return res
      .status(404)
      .json({ message: "Əvvəlcə biznes profilini doldurun" });
  }

  console.error(error);
  res.status(500).json({ message: "Verilənlər bazası xətası" });
};

export const getDashboardHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const dashboard = await dashboardService.getDashboard(req.user.userId);

    res.json(dashboard);
  } catch (error) {
    handleDashboardError(error, res);
  }
};

export const getCustomersHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const customers = await dashboardService.getCustomers(req.user.userId);

    res.json(customers);
  } catch (error) {
    handleDashboardError(error, res);
  }
};