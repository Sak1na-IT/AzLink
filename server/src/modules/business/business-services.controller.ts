import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate";
import * as servicesService from "./business-services.service";
import type { ServiceInput } from "./business-services.service";

type ParseResult =
  | { ok: true; data: Partial<ServiceInput> }
  | { ok: false; message: string };

/*
 * requireAll = true  → POST (ad, qiymət, müddət məcburidir)
 * requireAll = false → PATCH (yalnız göndərilən sahələr yoxlanılır)
 */
const parseServiceBody = (body: unknown, requireAll: boolean): ParseResult => {
  const source = (
    typeof body === "object" && body !== null ? body : {}
  ) as Record<string, unknown>;

  const data: Partial<ServiceInput> = {};

  if (source.name !== undefined || requireAll) {
    if (typeof source.name !== "string" || source.name.trim().length === 0) {
      return { ok: false, message: "Xidmətin adı vacibdir" };
    }

    data.name = source.name.trim();
  }

  if (source.description !== undefined) {
    if (typeof source.description !== "string") {
      return { ok: false, message: "Təsvir mətn olmalıdır" };
    }

    data.description = source.description.trim();
  }

  if (source.price !== undefined || requireAll) {
    const price = Number(source.price);

    if (
      source.price === null ||
      source.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return { ok: false, message: "Qiymət 0 və ya daha böyük rəqəm olmalıdır" };
    }

    data.price = price;
  }

  if (source.duration !== undefined || requireAll) {
    const duration = Number(source.duration);

    if (
      source.duration === null ||
      source.duration === "" ||
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      return {
        ok: false,
        message: "Müddət dəqiqə ilə, 0-dan böyük tam ədəd olmalıdır",
      };
    }

    data.duration = duration;
  }

  return { ok: true, data };
};

const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error) {
    if (error.message === "BUSINESS_NOT_FOUND") {
      return res
        .status(404)
        .json({ message: "Əvvəlcə biznes profilini doldurun" });
    }

    if (error.message === "CATEGORY_REQUIRED") {
      return res.status(400).json({
        message: "Əvvəlcə biznes profilində kateqoriya seçin",
      });
    }

    if (error.message === "SERVICE_NOT_FOUND") {
      return res.status(404).json({ message: "Xidmət tapılmadı" });
    }
  }

  /* P2003: bu xidmətə bağlı rezervlər var, silmək olmaz */
  if ((error as { code?: string }).code === "P2003") {
    return res.status(409).json({
      message: "Bu xidmətə bağlı rezervlər var, silmək mümkün deyil",
    });
  }

  console.error(error);
  res.status(500).json({ message: "Verilənlər bazası xətası" });
};

export const listServicesHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const services = await servicesService.listServices(req.user.userId);

    res.json(services);
  } catch (error) {
    handleError(error, res);
  }
};

export const createServiceHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const parsed = parseServiceBody(req.body, true);

    if (!parsed.ok) {
      return res.status(400).json({ message: parsed.message });
    }

    const { name, description, price, duration } = parsed.data;

    const service = await servicesService.createService(req.user.userId, {
      name: name as string,
      description: description ?? "",
      price: price as number,
      duration: duration as number,
    });

    res.status(201).json(service);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateServiceHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const parsed = parseServiceBody(req.body, false);

    if (!parsed.ok) {
      return res.status(400).json({ message: parsed.message });
    }

    const service = await servicesService.updateService(
      req.user.userId,
      String(req.params.id),
      parsed.data
    );

    res.json(service);
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteServiceHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    await servicesService.deleteService(
      req.user.userId,
      String(req.params.id)
    );

    res.json({ message: "Xidmət silindi" });
  } catch (error) {
    handleError(error, res);
  }
};