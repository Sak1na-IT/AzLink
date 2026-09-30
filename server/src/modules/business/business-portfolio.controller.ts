import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate";
import * as portfolioService from "./business-portfolio.service";

/* base64 şəklin özü ~10MB-a qədər (~13.3MB base64 mətn) */
const MAX_DATA_URL_LENGTH = 14_000_000;
const MAX_CAPTION_LENGTH = 200;

const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error) {
    if (error.message === "BUSINESS_NOT_FOUND") {
      return res
        .status(404)
        .json({ message: "Əvvəlcə biznes profilini doldurun" });
    }

    if (error.message === "IMAGE_NOT_FOUND") {
      return res.status(404).json({ message: "Şəkil tapılmadı" });
    }
  }

  console.error(error);
  res.status(500).json({ message: "Verilənlər bazası xətası" });
};

export const listPortfolioHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const images = await portfolioService.listPortfolio(req.user.userId);

    res.json(images);
  } catch (error) {
    handleError(error, res);
  }
};

export const addPortfolioImageHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const { dataUrl, caption } = req.body ?? {};

    if (
      typeof dataUrl !== "string" ||
      !dataUrl.startsWith("data:image/")
    ) {
      return res
        .status(400)
        .json({ message: "Şəkil data:image/... formatında olmalıdır" });
    }

    if (dataUrl.length > MAX_DATA_URL_LENGTH) {
      return res
        .status(400)
        .json({ message: "Şəkil çox böyükdür (maks. ~10MB)" });
    }

    if (caption !== undefined && typeof caption !== "string") {
      return res.status(400).json({ message: "Başlıq mətn olmalıdır" });
    }

    const trimmedCaption =
      typeof caption === "string" ? caption.trim() : "";

    if (trimmedCaption.length > MAX_CAPTION_LENGTH) {
      return res.status(400).json({
        message: `Başlıq ${MAX_CAPTION_LENGTH} simvoldan uzun ola bilməz`,
      });
    }

    const image = await portfolioService.addPortfolioImage(req.user.userId, {
      dataUrl,
      caption: trimmedCaption,
    });

    res.status(201).json(image);
  } catch (error) {
    handleError(error, res);
  }
};

export const deletePortfolioImageHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    await portfolioService.deletePortfolioImage(
      req.user.userId,
      String(req.params.id)
    );

    res.json({ message: "Şəkil silindi" });
  } catch (error) {
    handleError(error, res);
  }
};