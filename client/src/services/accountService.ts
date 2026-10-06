import { apiRequest } from "./api";

export interface AccountInfo {
  name: string;
  email: string;
  phone: string;
}

const readString = (value: unknown) =>
  typeof value === "string" ? value : "";

/*
 * /auth/me cavabı { user: {...} } və ya birbaşa {...} ola bilər.
 * İkisini də qəbul edirik.
 */
export const readAccount = (value: unknown): AccountInfo | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  const source =
    record.user && typeof record.user === "object"
      ? (record.user as Record<string, unknown>)
      : record;

  return {
    name: readString(source.name),
    email: readString(source.email),
    phone: readString(source.phone),
  };
};

export interface UpdateProfileInput {
  name: string;
  phone?: string;
}

export const updateMyProfile = (input: UpdateProfileInput) =>
  apiRequest<unknown>("/auth/me", { method: "PATCH", body: input });

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = (input: ChangePasswordInput) =>
  apiRequest<{ message?: string }>("/auth/password", {
    method: "PATCH",
    body: input,
  });

export const getErrorText = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;