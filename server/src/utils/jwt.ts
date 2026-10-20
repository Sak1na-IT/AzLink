import { randomUUID } from "crypto";

import jwt from "jsonwebtoken";

export type TokenPayload = {
  userId: string;
  role: "USER" | "BUSINESS";
};

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "";

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });

/* Refresh token-in ömrü: bazadakı expiresAt də buna uyğun yazılır */
export const REFRESH_TOKEN_DAYS = 7;

/*
 * jwtid hər tokeni unikal edir: eyni saniyədə iki dəfə giriş edilsə
 * belə tokenlər (və bazadakı hash-ləri) üst-üstə düşmür.
 */
export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_DAYS}d`,
    jwtid: randomUUID(),
  });

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, ACCESS_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, REFRESH_SECRET) as TokenPayload;