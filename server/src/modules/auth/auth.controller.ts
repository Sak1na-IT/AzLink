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
    if (error instanceof Error && error.message.startsWith("EMAIL_TAKEN")) {
      const existingRole = error.message.split(":")[1];
      const roleLabel = existingRole === "BUSINESS" ? "biznes" : "istifadəçi";

      return res.status(409).json({
        message: `Bu email artıq ${roleLabel} hesabı kimi qeydiyyatdan keçib. Həmin hesabla daxil olun.`,
      });
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

export const updateProfileHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const { name, phone } = req.body ?? {};

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(400).json({ message: "Ad boş ola bilməz" });
    }

    if (phone !== undefined && typeof phone !== "string") {
      return res.status(400).json({ message: "Telefon mətn olmalıdır" });
    }

    const user = await authService.updateProfile(req.user.userId, {
      name: typeof name === "string" ? name.trim() : undefined,
      phone: typeof phone === "string" ? phone.trim() : undefined,
    });

    res.json(toPublicUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verilənlər bazası xətası" });
  }
};

export const changePasswordHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Giriş tələb olunur" });
    }

    const { currentPassword, newPassword } = req.body ?? {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res
        .status(400)
        .json({ message: "Cari və yeni şifrə vacibdir" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Yeni şifrə ən azı 6 simvol olmalıdır" });
    }

    await authService.changePassword(req.user.userId, {
      currentPassword,
      newPassword,
    });

    res.json({ message: "Şifrə dəyişdirildi" });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CURRENT_PASSWORD"
    ) {
      return res.status(401).json({ message: "Cari şifrə yanlışdır" });
    }

    console.error(error);
    res.status(500).json({ message: "Verilənlər bazası xətası" });
  }
};