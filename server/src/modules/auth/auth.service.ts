import bcrypt from "bcryptjs";

import { prisma } from "../../config/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import type { SignupInput, SigninInput } from "./auth.types";

const SALT_ROUNDS = 10;

/*
 * Qeydiyyat: yalnız User yaradılır. Biznes sahibləri (role: BUSINESS)
 * eyni User cədvəlində saxlanır, amma Business profili (ad, ərazi,
 * telefon) sonra BusinessProfile səhifəsindən ayrıca doldurulur.
 *
 * Email unikaldır: eyni email ilə ikinci hesab (başqa rolla belə)
 * açıla bilməz. Əgər artıq varsa, hansı rolla qeydiyyatdan keçdiyi
 * "EMAIL_TAKEN:<ROL>" formatında bildirilir ki, controller istifadəçiyə
 * dəqiq mesaj göstərə bilsin.
 */
export const signup = async (input: SignupInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new Error(`EMAIL_TAKEN:${existing.role}`);
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      phone: input.phone,
    },
  });

  return {
    user,
    tokens: {
      accessToken: signAccessToken({ userId: user.id, role: user.role }),
      refreshToken: signRefreshToken({ userId: user.id, role: user.role }),
    },
  };
};

export const signin = async (input: SigninInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return {
    user,
    tokens: {
      accessToken: signAccessToken({ userId: user.id, role: user.role }),
      refreshToken: signRefreshToken({ userId: user.id, role: user.role }),
    },
  };
};

/*
 * Refresh token stateless JWT-dir (DB-də saxlanmır). Bu, sadə və
 * sürətlidir, amma bir məhdudiyyəti var: logout refresh tokeni server
 * tərəfindən "ləğv edə" bilmir (blacklist yoxdur) — token yalnız 7 gün
 * sonra öz-özünə bitir. Real production üçün RefreshToken cədvəli
 * əlavə edib logout-da onu silmək daha təhlükəsiz olardı.
 */
export const refresh = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return {
    accessToken: signAccessToken({ userId: user.id, role: user.role }),
  };
};

export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

export const updateProfile = async (
  userId: string,
  input: { name?: string; phone?: string }
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone }),
    },
  });
};

export const changePassword = async (
  userId: string,
  input: { currentPassword: string; newPassword: string }
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const matches = await bcrypt.compare(input.currentPassword, user.password);

  if (!matches) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};