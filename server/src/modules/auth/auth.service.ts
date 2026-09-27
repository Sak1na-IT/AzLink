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
 */
export const signup = async (input: SignupInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new Error("EMAIL_TAKEN");
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