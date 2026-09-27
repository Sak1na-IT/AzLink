import type { Request, Response } from "express";

import * as authService from "./auth.service";
import type { AuthenticatedRequest } from "../../middleware/authenticate";

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
};

const toPublicUser = (user: {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
}): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
});

export const signupHandler = async (req: Request, res: Response) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Ad, email, şifrə və rol vacibdir" });
  }

  if (role !== "USER" && role !== "BUSINESS") {
    return res
      .status(400)
      .json({ message: "Rol yalnız USER və ya BUSINESS ola bilər" });
  }

  try {
    const { user, tokens } = await authService.signup({
      name,
      email,
      password,
      role,
      phone,
    });

    res.status(201).json({
      user: toPublicUser(user),
      ...tokens,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return res
        .status(409)
        .json({ message: "Bu email artıq qeydiyyatdan keçib" });
    }

    console.error(error);
    res.status(500).json({ message: "Qeydiyyat zamanı xəta baş verdi" });
  }
};

export const signinHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email və şifrə vacibdir" });
  }

  try {
    const { user, tokens } = await authService.signin({ email, password });

    res.json({
      user: toPublicUser(user),
      ...tokens,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res
        .status(401)
        .json({ message: "Email və ya şifrə yanlışdır" });
    }

    console.error(error);
    res.status(500).json({ message: "Giriş zamanı xəta baş verdi" });
  }
};

export const refreshHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "refreshToken vacibdir" });
  }

  try {
    const result = await authService.refresh(refreshToken);
    res.json(result);
  } catch {
    res.status(401).json({ message: "Refresh token etibarsızdır" });
  }
};

export const logoutHandler = async (_req: Request, res: Response) => {
  /*
   * Stateless JWT: server tərəfində heç nə silinmir. Frontend logout
   * çağıranda öz tərəfindən access/refresh tokenləri yaddaşdan
   * (localStorage / state) silməlidir.
   */
  res.json({ message: "Çıxış edildi" });
};

export const meHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "İstifadəçi tapılmadı" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verilənlər bazası xətası" });
  }
};