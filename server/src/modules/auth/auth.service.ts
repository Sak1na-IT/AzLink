import { createHash } from "crypto";

import bcrypt from "bcryptjs";

import { prisma } from "../../config/prisma";
import {
  REFRESH_TOKEN_DAYS,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import type { SignupInput, SigninInput } from "./auth.types";

const SALT_ROUNDS = 10;

/* Bazada tokenin özü yox, yalnız SHA-256 hash-i saxlanır */
const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/*
 * Access və refresh token yaradır, refresh token-i bazaya yazır.
 * Beləcə logout onu serverdə ləğv edə bilir. Hər girişdə həmin
 * istifadəçinin vaxtı keçmiş tokenləri də təmizlənir.
 */
const issueTokens = async (user: { id: string; role: "USER" | "BUSINESS" }) => {
  const payload = { userId: user.id, role: user.role };
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.deleteMany({
    where: { userId: user.id, expiresAt: { lt: new Date() } },
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken: signAccessToken(payload), refreshToken };
};

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
    tokens: await issueTokens(user),
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
    tokens: await issueTokens(user),
  };
};

/*
 * Refresh token iki şərtlə qəbul olunur: JWT imzası düzgündür VƏ
 * bazada hələ də var (logout etməyibsə, vaxtı keçməyibsə).
 */
export const refresh = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
  });

  if (
    !stored ||
    stored.userId !== payload.userId ||
    stored.expiresAt.getTime() < Date.now()
  ) {
    throw new Error("REFRESH_TOKEN_REVOKED");
  }

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

/* Çıxış: bu cihazın refresh token-i bazadan silinir və artıq işləmir */
export const logout = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashToken(refreshToken) },
  });
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

/*
 * Email dəyişmə: təhlükəsizlik üçün cari şifrə ilə təsdiqlənir.
 * Yeni email başqa hesabda istifadə olunursa dəyişmək olmur.
 */
export const changeEmail = async (
  userId: string,
  input: { password: string; newEmail: string }
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const matches = await bcrypt.compare(input.password, user.password);

  if (!matches) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  if (input.newEmail === user.email) {
    throw new Error("SAME_EMAIL");
  }

  const taken = await prisma.user.findUnique({
    where: { email: input.newEmail },
  });

  if (taken) {
    throw new Error("EMAIL_TAKEN");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { email: input.newEmail },
  });
};
